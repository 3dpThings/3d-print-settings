/* Language switching
   Re-renders every visible string when the language changes. */
'use strict';

function applyStatic(){
  document.documentElement.lang = LANG.locale==='zh-CN' ? 'zh-CN' : LANG.code;
  $('h1').innerHTML = esc(T('app.h1')).replace(/\[(.+?)\]/, '<b>$1</b>');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $('nozTypes').setAttribute('aria-label', T('f.ntype')); $('supNozTypes').setAttribute('aria-label', T('f.ntype'));
}
function rerenderAll(){
  const q = readForm();
  applyStatic();
  fillFilamentBrands($('fBrand').value);
  renderTypes(q.t);
  const p = byId(PRINTERS, q.p), f = byId(FILAMENTS, q.f);
  if (p){ fillNozzles(p, q.n, null, q.nt); printerSpec(p); }
  if (f) filamentSpec(f);
  fillSupports(p, f, q.s);
  refreshSuggestion(false);
  updateLayers(false, q.lh);
  if (current) render(readForm(), {...currentOpts, silent:true}); else renderHistory();
}
async function setLang(code, persist){
  const L = LANGS.find(l => l.code===code) || LANGS[0];
  try { await loadDict(L.code); }
  catch(e){ console.warn(e); $('lang').value = LANG.code; return; }
  LANG = L; DICT = DICTS[L.code];
  $('lang').value = L.code;
  if (persist){ try { localStorage.setItem(LS_LANG, L.code); } catch(e){} }
  rerenderAll();
}
