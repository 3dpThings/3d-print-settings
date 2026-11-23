/* Recent queries
   The last 10 queries, stored in localStorage only (nothing leaves the browser). */
'use strict';

const LS_KEY = 'p3d.history.v1';
const LS_LANG = 'p3d.lang';
const store = {
  read(){ try { const v = JSON.parse(localStorage.getItem(LS_KEY)||'[]'); return Array.isArray(v) ? v : []; } catch(e){ return []; } },
  save(list){ try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch(e){ /* private mode or storage full */ } }
};
const validEntry = e => e && byId(PRINTERS,e.p) && byId(FILAMENTS,e.f) && byId(TYPES,e.t) && typeof e.n==='number' && (!e.s || !!supById(e.s));
function addHistory(q){
  const k = keyOf(q);
  recent = [{...q, ts:Date.now()}, ...recent.filter(e => keyOf(e)!==k)].slice(0,10);
  store.save(recent);
}
function timeAgo(ts){
  if (!ts) return '';
  const s = Math.max(0, (Date.now()-ts)/1000);
  if (s < 60) return T('ago.now');
  const rtf = new Intl.RelativeTimeFormat(LANG.locale, {numeric:'auto', style:'short'});
  if (s < 3600) return rtf.format(-Math.round(s/60), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s/3600), 'hour');
  const d = Math.round(s/86400);
  if (d < 7) return rtf.format(-d, 'day');
  return new Date(ts).toLocaleDateString(LANG.locale, {day:'numeric', month:'short'});
}
let histChosen = null;   // key of the query picked in the dropdown
const histLabel = e => { const p = byId(PRINTERS,e.p), f = byId(FILAMENTS,e.f), t = byId(TYPES,e.t), sp = e.s && supById(e.s);
  return {h1:`${p.model} · ${filName(f)}${sp ? ' + ' + supName(sp) : ''}`, h2:`${typeName(t)} · ${fmtNozzle(e.n)} mm · ${timeAgo(e.ts)}`}; };
function renderHistory(){
  $('clearHist').hidden = recent.length===0;
  if (!clearArmed) $('clearHist').textContent = T('h.clear');
  const chosen = recent.find(e => keyOf(e)===histChosen);
  $('histBtnLabel').innerHTML = chosen ? `${esc(histLabel(chosen).h1)} <span class="ph">· ${esc(typeName(byId(TYPES,chosen.t)))}</span>` : `<span class="ph">${esc(T(recent.length ? 'h.pick' : 'h.pickEmpty'))}</span>`;
  $('hist').innerHTML = recent.length ? recent.map((e,i) => { const L = histLabel(e);
    return `<div role="option" tabindex="-1" data-i="${i}" aria-selected="${keyOf(e)===histChosen}"><span class="hn">${String(i+1).padStart(2,'0')}</span><span class="h1">${esc(L.h1)}</span><span class="h2">${esc(L.h2)}</span></div>`;
  }).join('') : `<p class="empty">${esc(T('h.empty'))}</p>`;
}
function histOpen(open){
  const pop = $('hist'), btn = $('histBtn');
  pop.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  if (open){ const items = pop.querySelectorAll('[role="option"]'); const sel = pop.querySelector('[aria-selected="true"]') || items[0]; (sel || pop).focus(); }
}
function histPick(i){
  const e = recent[i]; if (!e) return;
  histOpen(false); $('histBtn').focus();
  setForm(e);
  histChosen = keyOf(e);
  render(readForm(), {fromHistory:true, ts:e.ts});
  if (!matchMedia('(min-width: 1180px)').matches) scrollToSheet();
}
$('histBtn').addEventListener('click', () => histOpen($('hist').hidden));
$('histBtn').addEventListener('keydown', ev => { if (ev.key==='ArrowDown'){ ev.preventDefault(); histOpen(true); } });
$('hist').addEventListener('click', ev => { const o = ev.target.closest('[data-i]'); if (o) histPick(+o.dataset.i); });
$('hist').addEventListener('keydown', ev => {
  const items = [...$('hist').querySelectorAll('[role="option"]')];
  const idx = items.indexOf(document.activeElement);
  if (ev.key==='ArrowDown'){ ev.preventDefault(); (items[Math.min(items.length-1, idx+1)] || items[0])?.focus(); }
  else if (ev.key==='ArrowUp'){ ev.preventDefault(); (items[Math.max(0, idx-1)] || items[0])?.focus(); }
  else if (ev.key==='Enter' || ev.key===' '){ if (idx>=0){ ev.preventDefault(); histPick(idx); } }
  else if (ev.key==='Escape' || ev.key==='Tab'){ histOpen(false); if (ev.key==='Escape') $('histBtn').focus(); }
});
document.addEventListener('mousedown', ev => { if (!$('hist').hidden && !ev.target.closest('.histdd')) histOpen(false); });
let clearArmed = false, clearTimer = null;
$('clearHist').addEventListener('click', () => {
  const b = $('clearHist');
  if (!clearArmed){ clearArmed = true; b.classList.add('armed'); b.textContent = T('h.confirm'); clearTimer = setTimeout(() => { clearArmed=false; b.classList.remove('armed'); b.textContent=T('h.clear'); }, 4000); return; }
  clearTimeout(clearTimer); clearArmed = false; b.classList.remove('armed');
  recent = []; store.save(recent); activeKey = null; renderHistory();
});
function scrollToSheet(){
  $('sheet').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
}
