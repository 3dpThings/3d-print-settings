/* Entry point
   Wires up the form events and boots the app. */
'use strict';

$('lang').addEventListener('change', () => setLang($('lang').value, true));
const keepSup = () => $('supField').hidden ? '' : $('sName').value;
const LS_PRINTER = 'p3d.printer';
let sugList = [];
let touched = false;
function setPrinter(id, sv){
  const p = byId(PRINTERS, id); if (!p) return;
  $('pBrand').value = p.brand; fillPrinterModels(p.brand, p.id); printerSpec(p);
  fillSupports(p, curFil(), sv);
}
function savePrinter(){ try { localStorage.setItem(LS_PRINTER, $('pModel').value); } catch(e){} }
function updateNozzles(selectIdeal, keepType){
  const p = curPrinter(), f = curFil(), t = byId(TYPES, readForm().t);
  if (!p || !f || !t) return;
  const q = readForm();
  const ideal = idealNozzle(p, f, t);
  const idealT = idealType(p, f, t, ideal);
  if (selectIdeal) fillNozzles(p, ideal, ideal, idealT, idealT);
  else fillNozzles(p, q.n, ideal, keepType || q.nt, idealT);
  $('nozHint').textContent = T('nz.hint2', {n:fmtNozzle(ideal), t:ntName(idealT).toLocaleLowerCase(LANG.locale)});
}
function updateLayers(selectIdeal, val){
  const f = curFil(), t = byId(TYPES, readForm().t), n = readForm().n;
  if (!f || !t || !n){ $('lhs').innerHTML = ''; return; }
  const ideal = idealLh(n, f, t), opts = lhOptions(n, ideal), [a,b] = lhRange(n);
  const cur = val != null ? val : readForm().lh;
  const v = (!selectIdeal && cur && opts.some(x => Math.abs(x-cur) < 1e-9)) ? opts.find(x => Math.abs(x-cur) < 1e-9) : ideal;
  $('lhs').innerHTML = segHTML('lh', 'lh-', opts, v, ideal, null, x => fmt(x));
  $('lhHint').textContent = T('lh.hint', {v:fmt(ideal), n:fmtNozzle(n), a:fmt(a), b:fmt(b)});
}
function updateSupport(selectIdeal){
  const p = curPrinter(), f = curFil(), t = byId(TYPES, readForm().t);
  if (!p || !f) return;
  const ideal = idealSupport(p, f, t);
  fillSupports(p, f, selectIdeal ? (ideal ? ideal.id : '') : keepSup(), ideal);
}
function updateSupNozzle(selectIdeal, val, valT){
  const p = curPrinter(), f = curFil(), field = $('supNozField');
  const s = (p && f && multiTool(p)) ? getSupport(keepSup(), f) : null;
  if (!s){ field.hidden = true; $('supNozzles').innerHTML = ''; $('supNozTypes').innerHTML = ''; return; }
  field.hidden = false;
  const q = readForm(), n = q.n, mt = q.nt, ideal = n;
  const lock = p.mix === false ? n : null;
  const lockType = p.sameType ? mt : null;
  const idealT = idealSupType(p, n, mt);
  const cur = val != null ? val : parseFloat((document.querySelector('input[name="supnozzle"]:checked')||{}).value);
  const curT = valT || (document.querySelector('input[name="supntype"]:checked')||{}).value;
  if (selectIdeal) fillSupNozzles(p, ideal, ideal, lock, idealT, idealT, lockType);
  else fillSupNozzles(p, cur, ideal, lock, curT, idealT, lockType);
  const tl = ntName(idealT).toLocaleLowerCase(LANG.locale);
  let key = 'nz.supHint2';
  if (lock != null && lockType) key = 'nz.supLocked2';
  else if (lock != null) key = 'nz.supLockedSize';
  else if (p.mix === 'exp') key = 'nz.supExp2';
  $('supNozHint').textContent = T(key, {model:p.model, n:fmtNozzle(n), t:tl});
}
function renderSuggestion(){
  const p = curPrinter(), top = sugList[0];
  if (!p || !top){ $('sugWhy').textContent = ''; $('sugAlts').innerHTML = ''; return; }
  const entry = sugList.find(e => e.p.id===p.id);
  const why = entry && entry.why.length ? entry.why.map(([k,v]) => T(k, v)).join(' · ') : '';
  if (top.p.id===p.id){
    $('sugWhy').innerHTML = `<b>${esc(T('sug.printerBest'))}</b>${why ? '<br>' + esc(why) : ''}`;
    $('sugAlts').innerHTML = '';
  } else {
    const tw = top.why.length ? top.why.map(([k,v]) => T(k, v)).join(' · ') : '';
    $('sugWhy').innerHTML = `${esc(T('sug.printerOther', {model:`${top.p.brand} ${top.p.model}`}))}${tw ? '<br>' + esc(tw) : ''}`;
    $('sugAlts').innerHTML = `<span>${esc(T('sug.alts'))}</span>` + sugList.slice(0,3).map(e =>
      `<button type="button" data-pid="${e.p.id}">${esc(e.p.model)}</button>`).join('');
  }
}
function refreshSuggestion(selectIdeal){
  const f = curFil(), t = byId(TYPES, readForm().t);
  if (!f || !t) return;
  sugList = suggestPrinters(f, t);
  if (curPrinter()){ updateNozzles(selectIdeal); updateSupport(selectIdeal); updateSupNozzle(selectIdeal); updateLayers(selectIdeal); }
  renderSuggestion();
}
/* Live recalculation. A query is saved to history once the selection stays unchanged for a few seconds. */
let liveTimer = null, histTimer = null;
function liveRender(){
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    const q = readForm();
    if (!q.p || !q.f || !q.t || !q.n) return;
    render(q, {silent:true});
    clearTimeout(histTimer);
    if (touched) histTimer = setTimeout(() => { const k = keyOf(readForm()); if (current && keyOf(current)===k){ addHistory(current); renderHistory(); } }, 2500);
  }, 40);
}
function markStale(){
  touched = true;
  if (histChosen){ histChosen = null; renderHistory(); }
  liveRender();
}
function onPrinterPicked(){
  const p = curPrinter(); if (!p) return;
  printerSpec(p); refreshSuggestion(true); savePrinter(); markStale();
}
$('pBrand').addEventListener('change', () => { fillPrinterModels($('pBrand').value); onPrinterPicked(); });
$('pModel').addEventListener('change', onPrinterPicked);
$('sugAlts').addEventListener('click', ev => {
  const b = ev.target.closest('button[data-pid]'); if (!b) return;
  setPrinter(b.dataset.pid, ''); refreshSuggestion(true); savePrinter(); markStale();
  $('pModel').focus();
});
$('fBrand').addEventListener('change', () => { fillFilaments($('fBrand').value); filamentSpec(curFil()); refreshSuggestion(true); markStale(); });
$('fName').addEventListener('change', () => { filamentSpec(curFil()); refreshSuggestion(true); markStale(); });
$('types').addEventListener('change', () => { refreshSuggestion(true); markStale(); });
$('nozzles').addEventListener('change', () => { updateSupNozzle(true); updateLayers(true); markStale(); });
$('lhs').addEventListener('change', markStale);
$('nozTypes').addEventListener('change', () => { const p = curPrinter(), q = readForm(); updateNozzles(false, q.nt); updateSupNozzle(true); updateLayers(false); markStale(); });
$('supNozTypes').addEventListener('change', () => { const v = (document.querySelector('input[name="supntype"]:checked')||{}).value; updateSupNozzle(false, null, v); markStale(); });
$('supNozzles').addEventListener('change', markStale);
$('sName').addEventListener('change', () => { supportSpec(curFil()); updateSupNozzle(true); markStale(); });
$('fName').addEventListener('change', syncCombos);
$('sName').addEventListener('change', syncCombos);

$('form').addEventListener('submit', ev => ev.preventDefault());

const EXAMPLE = {p:'bbl-x2d', f:'bbl-pa6-cf', t:'eng'};
function initForm(){
  let pid = null;
  try { pid = localStorage.getItem(LS_PRINTER); } catch(e){}
  if (!byId(PRINTERS, pid)) pid = EXAMPLE.p;
  const f0 = byId(FILAMENTS, EXAMPLE.f);
  $('fBrand').value = f0.brand; fillFilaments(f0.brand, f0.id); filamentSpec(f0);
  setPrinter(pid, '');
  refreshSuggestion(true);
}

$('theme').addEventListener('change', e => setTheme(e.target.value));

/* Start-up: load English (and the saved language) before drawing anything. */
async function boot(){
  let saved = null;
  try { saved = localStorage.getItem(LS_LANG); } catch(e){}
  try { EN = await loadDict('en'); DICT = EN; }
  catch(e){ console.error(e); document.body.classList.add('boot-failed'); $('bootError').hidden = false; return; }
  if (saved && saved !== 'en' && LANGS.some(l => l.code===saved)){
    try { DICT = await loadDict(saved); LANG = LANGS.find(l => l.code===saved); } catch(e){ console.warn(e); }
  }
  fillSelect($('lang'), LANGS.map(l => [l.code, l.name]), LANG.code);
  fillThemeSelect();
  if (CONFIG.repoUrl){
    const base = CONFIG.repoUrl.replace(/\/+$/, '');
    $('repoLink').href = base; $('repoLink').hidden = false;
    $('issueLink').href = base + '/issues/new/choose'; $('issueLink').hidden = false;
  }
  applyStatic();
  fillSelect($('pBrand'), pBrands.map(b=>[b,b]), 'Bambu Lab');
  fillFilamentBrands('Bambu Lab');
  renderTypes('eng');
  fCombo = makeCombo({
    input: $('fNameInput'), list: $('fList'), select: $('fName'), placeholderKey: 'combo.searchAll',
    items: (q, toks) => {
      const pool = toks.length ? FILAMENTS : FILAMENTS.filter(f => f.brand === $('fBrand').value);
      return pool.filter(f => matchAll(`${brandName(f.brand)} ${f.name} ${clsLabel(f.cls)} ${CLASSES[f.cls].type}`, toks))
        .map(f => ({id:f.id, label: f.name, sub: clsLabel(f.cls), group: toks.length ? brandName(f.brand) : null}));
    },
    onPick: it => {
      const f = byId(FILAMENTS, it.id);
      if ($('fBrand').value !== f.brand){ $('fBrand').value = f.brand; fillFilaments(f.brand, f.id); } else $('fName').value = f.id;
      $('fName').dispatchEvent(new Event('change'));
    }
  });
  sCombo = makeCombo({
    input: $('sNameInput'), list: $('sList'), select: $('sName'), placeholderKey: 'combo.search',
    items: (q, toks) => {
      const f = curFil(); if (!f) return [];
      const mat = CLASSES[f.cls].type;
      const out = [];
      if (!toks.length || matchAll(T('f.support.none'), toks)) out.push({id:'', label:T('f.support.none'), group:null});
      supportOptions(f).forEach(s => {
        const ideal = supIdeal && s.id === supIdeal.id;
        const label = supName(s) + (ideal ? ' · ' + T('sup.ideal') : '');
        const sub = T('supk.'+s.kind) + (s.fil ? ' · ' + clsLabel(s.fil.cls) : '');
        if (matchAll(`${label} ${sub} ${s.ftype}`, toks)) out.push({id:s.id, label, sub, group: s.fil ? T('sup.cat.filament', {mat}) : T('sup.cat.dedicated')});
      });
      return out;
    },
    onPick: it => { $('sName').value = it.id; $('sName').dispatchEvent(new Event('change')); }
  });
  recent = store.read().filter(validEntry).slice(0,10);
  renderHistory();
  if (recent.length) setForm(recent[0]); else initForm();
  liveRender();
}
boot();
