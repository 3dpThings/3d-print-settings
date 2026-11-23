/* Searchable dropdown (combobox)
   A hidden native <select> stays the source of truth; the input filters as you type. */
'use strict';

const norm = v => String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const tokensOf = q => norm(q).split(/\s+/).filter(Boolean);
const matchAll = (hay, toks) => { const h = norm(hay); return toks.every(t => h.includes(t)); };
function hl(text, toks){
  let out = esc(text);
  toks.forEach(t => { if (!t) return; const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); out = out.replace(re, '<mark>$1</mark>'); });
  return out;
}
function makeCombo({input, list, select, items, onPick, placeholderKey}){
  let open = false, act = -1, shown = [], toks = [];
  const sync = () => { const o = select.options[select.selectedIndex]; if (!open) input.value = o ? o.textContent : ''; };
  const close = () => { open = false; list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); input.placeholder = ''; sync(); };
  const draw = q => {
    toks = tokensOf(q);
    shown = items(q, toks);
    if (!shown.length){ list.innerHTML = `<li class="combo-empty">${esc(T('combo.none'))}</li>`; act = -1; return; }
    let html = '', g = null;
    shown.forEach((it, i) => {
      if (it.group && it.group !== g){ g = it.group; html += `<li class="combo-group" role="presentation">${esc(g)}</li>`; }
      html += `<li role="option" id="${list.id}-o${i}" data-i="${i}" aria-selected="${it.id===select.value}"><span>${hl(it.label, toks)}</span>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</li>`;
    });
    list.innerHTML = html;
  };
  const setAct = i => {
    act = i;
    list.querySelectorAll('[role="option"]').forEach(li => li.classList.toggle('act', +li.dataset.i === i));
    const el = list.querySelector(`[data-i="${i}"]`);
    if (el){ input.setAttribute('aria-activedescendant', el.id); if (i <= 0) list.scrollTop = 0; else el.scrollIntoView({block:'nearest'}); }
  };
  const openList = () => {
    if (open) return;
    const o = select.options[select.selectedIndex];
    open = true; list.hidden = false; input.setAttribute('aria-expanded', 'true');
    input.placeholder = (o ? o.textContent + ' — ' : '') + T(placeholderKey);
    input.value = ''; draw('');
    setAct(shown.findIndex(it => it.id === select.value));
  };
  const pick = i => { const it = shown[i]; if (!it) return; open = false; onPick(it); close(); };
  input.addEventListener('focus', openList);
  input.addEventListener('mousedown', () => { if (document.activeElement === input) openList(); });
  input.addEventListener('input', () => { if (!open){ open = true; list.hidden = false; input.setAttribute('aria-expanded', 'true'); } draw(input.value); setAct(shown.length ? 0 : -1); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); if (!open) openList(); else setAct(Math.min(shown.length - 1, act + 1)); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (open) setAct(Math.max(0, act - 1)); }
    else if (e.key === 'Enter'){ if (open){ e.preventDefault(); pick(act); } }
    else if (e.key === 'Escape'){ if (open){ e.preventDefault(); close(); } }
  });
  input.addEventListener('blur', () => setTimeout(() => { if (open && document.activeElement !== input) close(); }, 150));
  list.addEventListener('mousedown', e => e.preventDefault());
  list.addEventListener('click', e => { const li = e.target.closest('[role="option"]'); if (li) pick(+li.dataset.i); });
  return {sync, close};
}
let fCombo = null, sCombo = null;
function syncCombos(){ if (fCombo) fCombo.sync(); if (sCombo) sCombo.sync(); }
