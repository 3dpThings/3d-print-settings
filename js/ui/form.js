/* Form: state, selects and section 01–04 widgets
   Everything below js/ui touches the DOM. */
'use strict';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let recent = [];
let current = null, currentOpts = {};
let activeKey = null;
let exportTab = 'txt';
const lhKey = q => { const f = byId(FILAMENTS,q.f), t = byId(TYPES,q.t); if (!q.lh || !f || !t || !q.n) return ''; return Math.abs(idealLh(q.n,f,t) - q.lh) < 1e-9 ? '' : q.lh; };
const keyOf = q => `${q.p}|${q.n}|${q.nt||''}|${q.f}|${q.t}|${q.s||''}|${q.s && q.sn ? q.sn : ''}|${q.s && q.snt ? q.snt : ''}|${lhKey(q)}`;

const pBrands = [...new Set(PRINTERS.map(p=>p.brand))];
const fBrands = [...new Set(FILAMENTS.map(f=>f.brand))];

function fillSelect(sel, items, val){
  sel.innerHTML = items.map(([v,l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
  if (val!=null && items.some(i=>i[0]===val)) sel.value = val;
}
const fillPrinterModels = (brand, val) => fillSelect($('pModel'), PRINTERS.filter(p=>p.brand===brand).map(p=>[p.id,p.model]), val);
const fillFilaments = (brand, val) => { fillSelect($('fName'), FILAMENTS.filter(f=>f.brand===brand).map(f=>[f.id,f.name]), val); syncCombos(); };
function fillFilamentBrands(val){ fillSelect($('fBrand'), fBrands.map(b=>[b, brandName(b)]), val); }
function segHTML(name, prefix, items, checked, ideal, disabledFn, labelFn){
  return items.map(v => { const id = prefix + String(v).replace('.','_'); const dis = disabledFn ? disabledFn(v) : false;
    return `<input type="radio" name="${name}" id="${id}" value="${v}" ${v===checked?'checked':''} ${dis?'disabled':''}><label for="${id}"${v===ideal?' class="ideal"':''}${dis?' aria-disabled="true"':''}>${esc(labelFn(v))}</label>`; }).join('');
}
const availTypes = p => NTYPES.filter(k => sizesOf(p,k).length);
/* Main nozzle: type + size. Only the sizes that exist for the chosen type are enabled. */
function fillNozzles(p, val, ideal, type, idealT){
  const types = availTypes(p);
  type = types.includes(type) ? type : (types.includes(idealT) ? idealT : types[0]);
  const sizes = sizesOf(p, type);
  const v = sizes.includes(val) ? val : (sizes.includes(ideal) ? ideal : sizes.reduce((b,x) => Math.abs(x-(val||0.4)) < Math.abs(b-(val||0.4)) ? x : b, sizes[0]));
  $('nozTypes').innerHTML = segHTML('ntype', 'nt-', types, type, idealT, null, ntName);
  $('nozTypes').hidden = types.length < 2;
  $('nozzles').innerHTML = segHTML('nozzle', 'nz-', p.nozzles, v, ideal, x => !sizes.includes(x), fmtNozzle);
}
function fillSupNozzles(p, val, ideal, lockTo, type, idealT, lockType){
  const types = availTypes(p);
  type = lockType || (types.includes(type) ? type : idealT);
  const sizes = sizesOf(p, type);
  let v = lockTo!=null ? lockTo : (sizes.includes(val) ? val : ideal);
  if (!sizes.includes(v)) v = sizes.includes(ideal) ? ideal : sizes[0];
  $('supNozTypes').innerHTML = segHTML('supntype', 'snt-', types, type, idealT, k => (lockType && k!==lockType) || (lockTo!=null && !sizesOf(p,k).includes(lockTo)), ntName);
  $('supNozTypes').hidden = types.length < 2;
  $('supNozzles').innerHTML = segHTML('supnozzle', 'snz-', p.nozzles, v, ideal, x => (lockTo!=null && x!==lockTo) || !sizes.includes(x), fmtNozzle);
}
function printerSpec(p){
  const ch = p.chamber==='active' ? T('spec.ch.active',{t:p.maxChamber}) : p.chamber==='passive' ? T('spec.ch.passive') : T('spec.ch.open');
  const hard = p.hardened===true ? T('spec.hard.yes') : p.hardened===false ? T('spec.hard.no') : T('spec.hard.unk');
  let txt = T('spec.printer', {nozzle:p.maxNozzle, bed:p.maxBed, chamber:ch, hard, drive:T(p.drive==='bowden'?'spec.drive.bowden':'spec.drive.direct'), vol:p.vol});
  if (p.mm) txt += ' · ' + T(p.mm==='dual' ? 'spec.tools.dual' : p.mm==='nozzle' ? 'spec.tools.nozzle' : 'spec.tools.changer', {n:p.tools});
  $('pSpec').textContent = txt;
}
function filamentSpec(f){
  const c = CLASSES[f.cls];
  let s = T('spec.fil', {label:clsLabel(f.cls), n0:f.nozzle[0], n1:f.nozzle[1], b0:f.bed[0], b1:f.bed[1]});
  if (c.cf || c.cfMild || c.abr) s += ' · ' + T('spec.abrasive');
  if (c.hyg) s += ' · ' + T('spec.hygro');
  $('fSpec').textContent = s;
  $('fDry').innerHTML = `<span><b>${esc(T('f.dryLabel'))}</b> ${esc(T(f.dry || c.dry))}</span><span><b>${esc(T('f.storeLabel'))}</b> ${esc(T('store.'+storeLevel(c)))}</span>`;
}
const HIGH_STORE = ['PA','PPA','PC'];
function storeLevel(c){
  if (HIGH_STORE.includes(c.fam) || c.verySoft) return 'high';
  return (c.hyg || c.foam) ? 'mid' : 'low';
}
function idealSupport(p, f, t){
  if (!p || !f || !multiTool(p) || (t && t.id==='water')) return null;
  const c = CLASSES[f.cls], opts = supportOptions(f).filter(s => s.tier !== 'other');
  if (!opts.length) return null;
  if (p.id==='bbl-x2d' && (c.fam==='PA' || c.fam==='PET')) return null;
  const bambu = p.brand==='Bambu Lab';
  const pick = id => opts.find(s => s.id===id) || null;
  const sameBrand = fam => opts.find(s => s.fil && s.fil.cls===fam && s.fil.brand===f.brand)
    || opts.find(s => s.fil && s.fam===fam && s.fil.brand===f.brand)
    || pick('fil:gen-' + fam.toLowerCase());
  switch (c.fam){
    case 'PLA':  return bambu ? pick('sup-bbl-pla') : sameBrand('PETG');
    case 'PETG': return bambu ? pick('sup-bbl-plapetg') : sameBrand('PLA');
    case 'TPU':  return bambu ? (pick('fil:bbl-pla-basic') || sameBrand('PLA')) : sameBrand('PLA');
    case 'ABS':  return bambu ? pick('sup-bbl-abs') : pick('sup-gen-hips');
    case 'ASA':  return pick('sup-gen-hips');
    case 'PA':   return pick('sup-bbl-pa');
    case 'PET':  return pick('sup-bbl-pa');
  }
  return null;
}
let supIdeal = null;
function fillSupports(p, f, val, ideal){
  val = LEGACY_SUP[val] || val;
  const field = $('supField');
  if (!p || !f || !multiTool(p)){ field.hidden = true; $('sName').innerHTML = ''; supIdeal = null; return; }
  field.hidden = false;
  if (ideal !== undefined) supIdeal = ideal;
  const list = supportsFor(f);
  if (supIdeal && !list.some(s => s.id===supIdeal.id)) supIdeal = null;
  fillSelect($('sName'), [['', T('f.support.none')], ...list.map(s => [s.id, supName(s) + (supIdeal && s.id===supIdeal.id ? ' · ' + T('sup.ideal') : '')])], val || '');
  supportSpec(f);
  syncCombos();
}
function supportSpec(f){
  const c = CLASSES[f.cls], list = supportsFor(f), t = byId(TYPES, (document.querySelector('input[name="ptype"]:checked')||{}).value);
  const s = getSupport($('sName').value, f);
  let txt;
  if (!list.some(s => s.tier !== 'other')) txt = T('f.support.noneAvail', {mat:c.type});
  else if (supIdeal) txt = T('sup.hint.ideal', {sup:supName(supIdeal)});
  else if (t && !t.supOn) txt = T('sup.hint.none');
  else txt = T('f.support.hint', {mat:c.type});
  if (s) txt += ' — ' + `${T('supk.'+s.kind)} · ${T('th.nozzle').toLocaleLowerCase(LANG.locale)} ${s.nozzle[0]}–${s.nozzle[1]} °C · ${T('th.bed').toLocaleLowerCase(LANG.locale)} ${s.bed[0]}–${s.bed[1]} °C`;
  $('sSpec').textContent = txt;
}
const curPrinter = () => byId(PRINTERS, $('pModel').value);
const curFil = () => byId(FILAMENTS, $('fName').value);
function renderTypes(val){
  $('types').innerHTML = TYPES.map(t => `<input type="radio" name="ptype" id="ty-${t.id}" value="${t.id}" ${t.id===val?'checked':''}><label for="ty-${t.id}"><span class="dot" aria-hidden="true"></span><span class="tt">${esc(typeName(t))}</span><span class="td">${esc(T(`type.${t.id}.desc`))}</span><span class="tm"><b>${esc(T('type.matsLabel'))}</b> ${esc(T(`type.${t.id}.mats`))}</span></label>`).join('');
}
function readForm(){
  return {
    p: $('pModel').value,
    n: parseFloat((document.querySelector('input[name="nozzle"]:checked')||{}).value),
    f: $('fName').value,
    t: (document.querySelector('input[name="ptype"]:checked')||{}).value,
    s: $('supField').hidden ? '' : $('sName').value,
    sn: $('supNozField').hidden ? null : parseFloat((document.querySelector('input[name="supnozzle"]:checked')||{}).value) || null,
    nt: (document.querySelector('input[name="ntype"]:checked')||{}).value || null,
    snt: $('supNozField').hidden ? null : ((document.querySelector('input[name="supntype"]:checked')||{}).value || null),
    lh: parseFloat((document.querySelector('input[name="lh"]:checked')||{}).value) || null,
  };
}
function setForm(q){
  const p = byId(PRINTERS,q.p), f = byId(FILAMENTS,q.f);
  if (!p || !f) return false;
  $('pBrand').value = p.brand; fillPrinterModels(p.brand, p.id); fillNozzles(p, q.n, null, q.nt || (typesAt(p,q.n).includes(p.nstock) ? p.nstock : typesAt(p,q.n)[0])); printerSpec(p);
  $('fBrand').value = f.brand; fillFilaments(f.brand, f.id); filamentSpec(f);
  fillSupports(p, f, q.s);
  const r = document.getElementById('ty-'+q.t); if (r) r.checked = true;
  refreshSuggestion(false);
  updateNozzles(false, q.nt || p.nstock);
  updateSupNozzle(false, q.sn, q.snt);
  updateLayers(false, q.lh || 0);
  return true;
}
