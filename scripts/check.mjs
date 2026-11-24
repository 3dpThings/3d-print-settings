#!/usr/bin/env node
/* Project checks: translations, catalogue data and an engine sweep over every combination.
   Usage: node scripts/check.mjs            (run from the repository root; no dependencies)
   Exit code 1 when something is wrong, so CI can block the pull request. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

/* ---------- 1. Translations ---------- */
const LANG_FILES = fs.readdirSync(path.join(ROOT, 'i18n')).filter(f => f.endsWith('.json')).sort();
const dicts = {};
for (const f of LANG_FILES){
  try { dicts[f.replace('.json','')] = JSON.parse(rd('i18n/' + f)); }
  catch(e){ err(`i18n/${f}: invalid JSON (${e.message})`); }
}
const en = dicts.en;
if (!en) { console.error('i18n/en.json is missing or broken'); process.exit(1); }
const placeholders = s => typeof s === 'string' ? (s.match(/\{\w+\}/g) || []).sort().join(',') : null;
for (const [code, d] of Object.entries(dicts)){
  if (code === 'en') continue;
  const missing = Object.keys(en).filter(k => !(k in d));
  const extra = Object.keys(d).filter(k => !(k in en));
  // Missing translations fall back to English in the app, so they are a warning, not an error.
  if (missing.length) warn(`i18n/${code}.json: ${missing.length} untranslated key(s) (English is shown): ${missing.slice(0,8).join(', ')}${missing.length>8?'…':''}`);
  if (extra.length) warn(`i18n/${code}.json: unused key(s) not in en.json: ${extra.join(', ')}`);
  for (const k of Object.keys(en)){
    if (!(k in d)) continue;
    if (Array.isArray(en[k]) !== Array.isArray(d[k])) { err(`i18n/${code}.json: "${k}" must be ${Array.isArray(en[k]) ? 'a list' : 'a string'}`); continue; }
    if (Array.isArray(en[k])){ if (en[k].length !== d[k].length) err(`i18n/${code}.json: "${k}" needs ${en[k].length} items`); continue; }
    if (placeholders(en[k]) !== placeholders(d[k])) err(`i18n/${code}.json: "${k}" placeholders differ from English (${placeholders(en[k]) || 'none'} vs ${placeholders(d[k]) || 'none'})`);
  }
  if (!/\[.+\]/.test(d['app.h1'] || '')) err(`i18n/${code}.json: "app.h1" must mark the highlighted word with [brackets]`);
}

/* ---------- 2. Load data + engine in a sandbox (no DOM) ---------- */
const ENGINE_FILES = ['js/i18n.js','js/engine/helpers.js','js/data/printers.js','js/data/materials.js','js/data/filaments.js',
  'js/data/types.js','js/data/supports.js','js/engine/suggest.js','js/engine/tips.js','js/engine/compute.js','js/ui/export.js'];
const ctx = vm.createContext({console, Intl, Math, JSON, Set, Map, Object, Array, Number, String, RegExp, Error});
const src = ENGINE_FILES.map(f => rd(f)).join('\n;\n') + `
;let __missing = new Set();
const __T = T;
T = function(k, v){ if (!(k in EN)) __missing.add(k); return __T(k, v); };
function __setLang(code, en, d){ EN = en; DICTS.en = en; DICTS[code] = d; DICT = d; LANG = LANGS.find(l => l.code === code) || LANGS[0]; }
this.__api = {PRINTERS, FILAMENTS, CLASSES, TYPES, SUPPORTS, NOZZLE_TYPES, PRINTER_TIPS, NTYPES, LANGS,
  compute, checks, buildTips, paramGroups, buildTxt, buildOrca, buildOrcaSup, buildPrusa, idealNozzle, idealType, idealSupType,
  idealLh, lhOptions, lhRange, supportOptions, multiTool, typesAt, getMissing: () => [...__missing], setLang: __setLang};`;
try { vm.runInContext(src, ctx, {filename: 'engine-bundle.js'}); }
catch(e){ console.error('The data/engine files failed to load:\n', e); process.exit(1); }
const A = ctx.__api;

/* ---------- 3. Catalogue data ---------- */
const dupes = (arr, label) => { const seen = new Set(); for (const x of arr){ if (seen.has(x.id)) err(`${label}: duplicate id "${x.id}"`); seen.add(x.id); } };
dupes(A.PRINTERS, 'printers.js'); dupes(A.FILAMENTS, 'filaments.js'); dupes(A.SUPPORTS, 'supports.js'); dupes(A.TYPES, 'types.js');
const ENUM = {chamber:['active','passive','open'], drive:['direct','bowden'], mm:['dual','changer','nozzle',undefined], mix:[true,false,'exp',undefined]};
for (const p of A.PRINTERS){
  const at = `printers.js › ${p.id}`;
  for (const k of ['id','brand','model','maxNozzle','maxBed','chamber','drive','vol','flow','speedF','soak'])
    if (p[k] === undefined || p[k] === '') err(`${at}: missing "${k}"`);
  for (const [k, ok] of Object.entries(ENUM)) if (!ok.includes(p[k])) err(`${at}: "${k}" must be one of ${ok.filter(x=>x!==undefined).join(' / ')}`);
  if (p.chamber === 'active' && !p.maxChamber) err(`${at}: an active chamber needs "maxChamber"`);
  if (![true,false,null].includes(p.hardened)) err(`${at}: "hardened" must be true, false or null (unknown)`);
  if (p.mm && !(p.tools >= 2)) err(`${at}: "mm" set but "tools" < 2`);
  if (!(p.speedF > 0 && p.speedF <= 1.2)) err(`${at}: "speedF" should be between 0 and 1.2`);
  if (!/^\d+ × \d+ × \d+ mm$/.test(p.vol)) warn(`${at}: "vol" should look like "256 × 256 × 256 mm"`);
  if (!A.NOZZLE_TYPES[p.id]) warn(`${at}: no NOZZLE_TYPES entry (falls back to ${p.hardened ? 'hardened' : 'standard'} nozzles only)`);
  if (!p.nozzles.length) err(`${at}: no nozzle sizes`);
}
for (const [id, nt] of Object.entries(A.NOZZLE_TYPES)){
  if (!A.PRINTERS.some(p => p.id === id)) err(`printers.js › NOZZLE_TYPES: "${id}" is not a printer id`);
  for (const k of Object.keys(nt.types)) if (!A.NTYPES.includes(k)) err(`printers.js › NOZZLE_TYPES.${id}: unknown nozzle type "${k}"`);
  if (!nt.types[nt.stock] || !nt.types[nt.stock].length) err(`printers.js › NOZZLE_TYPES.${id}: stock type "${nt.stock}" has no sizes`);
}
const range3 = (r, lo, hi) => Array.isArray(r) && r.length >= 2 && r[0] >= lo && r[1] <= hi && r[0] <= r[1] && (r[2] === undefined || (r[2] >= r[0] && r[2] <= r[1]));
for (const f of A.FILAMENTS){
  const at = `filaments.js › ${f.id}`;
  if (!A.CLASSES[f.cls]) err(`${at}: unknown material class "${f.cls}"`);
  if (!f.brand || !f.name) err(`${at}: brand and name are required`);
  if (!range3(f.nozzle, 150, 450)) err(`${at}: nozzle range must be [min, max, default] with min ≤ default ≤ max`);
  if (!range3(f.bed, 0, 150)) err(`${at}: bed range must be [min, max, default] with min ≤ default ≤ max`);
  if (!(f.mvs > 0 && f.mvs < 60)) err(`${at}: max volumetric speed (mm³/s) looks wrong: ${f.mvs}`);
}
const usedClasses = new Set(A.FILAMENTS.map(f => f.cls));
for (const cls of Object.keys(A.CLASSES)){
  const c = A.CLASSES[cls];
  if (!usedClasses.has(cls)) warn(`materials.js › ${cls}: class not used by any filament`);
  for (const k of [`cls.${cls}`, `mt.${cls}`, c.plate, c.dry]) if (k && !(k in en)) err(`materials.js › ${cls}: i18n key "${k}" missing in en.json`);
}
for (const t of A.TYPES) for (const k of ['name','desc','mats']) if (!(`type.${t.id}.${k}` in en)) err(`types.js › ${t.id}: i18n key "type.${t.id}.${k}" missing`);
for (const [pid, conf] of Object.entries(A.PRINTER_TIPS)){
  if (!A.PRINTERS.some(p => p.id === pid) && !pid.startsWith('_')) warn(`tips.js › PRINTER_TIPS: "${pid}" is not a printer id`);
  if (conf.soak && !(conf.soak in en)) err(`tips.js › ${pid}: soak key "${conf.soak}" missing in en.json`);
  for (const tip of conf.tips || []) if (tip.key && !(tip.key in en)) err(`tips.js › ${pid}: tip key "${tip.key}" missing in en.json`);
}

/* ---------- 3b. Display styles and font pairs ---------- */
{
  const cctx = vm.createContext({});
  vm.runInContext(rd('js/config.js') + ';this.__c = CONFIG;', cctx);
  const cfg = cctx.__c, css = rd('css/themes.css');
  for (const [list, attr] of [[cfg.styles, 'style'], [cfg.fontPairs, 'fonts']]){
    list.forEach((o, i) => {
      if (i > 0 && !css.includes(`[data-${attr}="${o.id}"]`)) err(`config.js › ${attr} "${o.id}": no [data-${attr}="${o.id}"] block in css/themes.css`);
      if (/^[a-z]+\.[\w.]+$/.test(o.label) && !(o.label in en)) err(`config.js › ${attr} "${o.id}": label key "${o.label}" missing in en.json`);
    });
  }
  for (const id of cfg.styles.slice(1).map(s => s.id)){
    const light = (css.match(new RegExp(`:root\\[data-style="${id}"\\]\\{([^}]*)\\}`)) || [])[1] || '';
    const dark = (css.match(new RegExp(`:root\\[data-style="${id}"\\]\\[data-mode="dark"\\]\\{([^}]*)\\}`)) || [])[1];
    if (dark === undefined){ err(`themes.css › style "${id}" has no dark-mode block`); continue; }
    const vars = b => new Set((b.match(/--[\w-]+(?=:)/g) || []));
    const missing = [...vars(light)].filter(v => !vars(dark).has(v));
    if (missing.length) err(`themes.css › style "${id}": dark block must also set ${missing.join(', ')}`);
  }
}

/* ---------- 4. Engine sweep ---------- */
const BAD_TEXT = /NaN|undefined|\[object Object\]|\{[a-zA-Z]+\}/;
let combos = 0;
for (const code of ['en', 'es', 'ja']){
  if (!dicts[code]) continue;
  A.setLang(code, en, dicts[code]);
  const valid = A.FILAMENTS.filter(f => A.CLASSES[f.cls] && range3(f.nozzle, 150, 450) && range3(f.bed, 0, 150));
  for (const p of A.PRINTERS) for (const f of valid) for (const t of A.TYPES){
    let n, nt, sups;
    try {
      n = A.idealNozzle(p, f, t); nt = A.idealType(p, f, t, n);
      const opts = A.multiTool(p) ? A.supportOptions(f) : [];
      // two recommended supports plus one "other" filament (abrasive if possible, to exercise the warnings)
      const other = opts.find(s => s.tier === 'other' && s.fil && A.CLASSES[s.fil.cls].cf) || opts.find(s => s.tier === 'other');
      sups = [null, ...opts.filter(s => s.tier !== 'other').slice(0, 2), ...(other ? [other] : [])];
    } catch(e){ err(`engine: crashed preparing ${p.id} × ${f.id} × ${t.id}: ${e.message}`); continue; }
    const lhs = code === 'en' ? A.lhOptions(n, A.idealLh(n, f, t)) : [null];
    for (const s of sups) for (const lh of lhs){
      combos++;
      const where = `${p.id} × ${f.id} × ${t.id} @${n}${s ? ' + ' + s.id : ''}${lh ? ' lh ' + lh : ''} [${code}]`;
      try {
        // with a support, also try a different support nozzle size on printers that allow mixing
        const sn = s ? (p.mix !== false ? (p.nozzles.find(x => x !== n) || n) : n) : null;
        const snt = s ? A.idealSupType(p, sn, nt, s) : null;
        const o = A.compute(p, f, n, t, s, sn, nt, snt, lh);
        const alerts = A.checks(p, f, n, t, o, s), tips = A.buildTips(p, f, n, t, o, s);
        const c = {p, f, n, t, o, c: A.CLASSES[f.cls], alerts, tips, s, sn, nt, snt};
        c.groups = A.paramGroups(c);
        const txt = A.buildTxt(c), orca = A.buildOrca(c), prusa = A.buildPrusa(c);
        JSON.parse(orca); if (s) JSON.parse(A.buildOrcaSup(c));
        for (const [name, out] of [['txt', txt], ['orca', orca], ['prusa', prusa]]){
          const m = out.match(BAD_TEXT);
          if (m){ err(`engine: "${m[0]}" in ${name} export for ${where}`); break; }
        }
        if (!(o.lh >= o.lhMin - 1e-9 && o.lh <= o.lhMax + 1e-9)) err(`engine: layer height ${o.lh} outside ${o.lhMin}–${o.lhMax} for ${where}`);
        if (Object.values(o.sp).some(v => !(v > 0))) err(`engine: non-positive speed for ${where}`);
      } catch(e){ err(`engine: crashed for ${where}: ${e.message}`); }
      if (errors.length > 40) break;
    }
  }
}
for (const k of A.getMissing()) err(`engine: uses i18n key "${k}" that is missing in en.json`);

/* ---------- Report ---------- */
for (const w of warnings) console.log('warn  ' + w);
for (const e of errors.slice(0, 60)) console.log('ERROR ' + e);
console.log(`\n${A.PRINTERS.length} printers · ${A.FILAMENTS.length} filaments · ${Object.keys(A.CLASSES).length} material classes · ${LANG_FILES.length} languages · ${combos} combinations checked`);
if (errors.length){ console.log(`✗ ${errors.length} error(s)`); process.exit(1); }
console.log('✓ All checks passed');
