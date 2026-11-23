/* Results sheet
   render(query) draws temperatures, settings, tips and the export panel. */
'use strict';

function thermoRow(label, sub, val, firstVal, range, limit, scale, note){
  const [s0,s1] = scale, pct = v => clamp((v - s0)/(s1 - s0)*100, 0, 100);
  const band = range ? `<div class="band" style="left:${pct(range[0])}%;width:${Math.max(1.5,pct(range[1])-pct(range[0]))}%" title="${esc(T('th.band'))}"></div>` : '';
  const mark = val!=null ? `<div class="mark" style="left:${pct(val)}%"></div>` : '';
  const first = firstVal!=null && firstVal!==val ? `<div class="mark first" style="left:${pct(firstVal)}%"></div>` : '';
  const lim = limit!=null && limit < s1 ? `<div class="limit" style="left:${pct(limit)}%"><span>${esc(T('th.max',{v:limit}))}</span></div>` : '';
  return `<div class="trow">
    <div class="tlabel">${esc(label)}<small>${esc(sub)}</small></div>
    <div class="track" aria-hidden="true"><div class="rail"></div>${band}${lim}${mark}${first}<div class="ticks"><span>${s0}</span><span>${s1} °C</span></div></div>
    <div class="tval"><b>${val!=null ? `${val} °C` : '—'}</b><small>${esc(note)}</small></div>
  </div>`;
}

function render(q, opts={}){
  const p = byId(PRINTERS,q.p), f = byId(FILAMENTS,q.f), t = byId(TYPES,q.t), n = q.n;
  if (!p || !f || !t || !n) return;
  current = q; currentOpts = opts;
  const c = CLASSES[f.cls];
  let s = multiTool(p) ? getSupport(q.s, f) : null;
  const o = compute(p,f,n,t,s,q.sn,q.nt,q.snt,q.lh);
  const alerts = checks(p,f,n,t,o,s);
  const tips = buildTips(p,f,n,t,o,s);
  const ctx = {p,f,n,t,o,c,alerts,tips,s};
  const groups = paramGroups(ctx);
  const sheet = $('sheet');
  sheet.hidden = false;
  const badge = opts.fromHistory ? `<span class="badge">${esc(T('badge.history',{ago:timeAgo(opts.ts)}))}</span>` : '';
  const lvl = l => T('lvl.'+l);

  const alertHTML = alerts.length ? `<div class="alerts">${alerts.map(a => `<div class="alert ${a.lvl}"><span class="lv">${esc(lvl(a.lvl))}</span><p>${esc(a.text)}</p></div>`).join('')}</div>` : '';
  const chText = o.chamber.key ? T(o.chamber.key, o.chamber.vars) : '—';
  const chSub = o.chamber.value!=null ? T('th.ch.active') : (p.chamber==='passive' ? T('th.ch.passive') : '');
  const chVal = o.chamber.value!=null ? o.chamber.value : (o.chamber.approx||null);
  let soakExtra = p.id==='bbl-x2d' ? T('soak.x2d') : T('soak.generic');
  if (c.needsEncl && p.chamber==='active') soakExtra += ' ' + T('soak.chActive', {t:o.chamber.value});
  if (c.needsEncl && p.chamber==='passive') soakExtra += ' ' + T('soak.chPassive', {m:p.preheat||15});

  const thermo = `<section class="panel thermo" aria-label="${esc(T('th.aria'))}">
    ${thermoRow(T('th.nozzle'), T('th.range',{a:f.nozzle[0], b:f.nozzle[1]}), o.nz, o.nz1, f.nozzle, p.maxNozzle, [150,380], T('th.first',{v:o.nz1}))}
    ${thermoRow(T('th.bed'), T('th.range',{a:f.bed[0], b:f.bed[1]}), o.bed, o.bed1, f.bed, p.maxBed, [0,130], T('th.first',{v:o.bed1}))}
    ${s ? thermoRow(T('th.support'), supName(s), o.sup.nz, null, s.nozzle, p.maxNozzle, [150,380], T('r.supStandby') + ' ' + o.sup.standby + ' °C') : ''}
    ${c.chamber>0 || p.chamber!=='open' ? thermoRow(T('th.chamber'), chSub, chVal, null, c.chamber>0 ? [Math.max(c.chamber-10,30), c.chamber+5] : null, p.chamber==='active' ? p.maxChamber : null, [0,80], chText) : ''}
    <div class="soak"><span class="clock">+${p.soak} min</span><p><b>${esc(T('soak.title'))}</b> ${esc(soakExtra)}</p></div>
  </section>`;

  const groupsHTML = `<div class="groups">${groups.map(g => `<section class="group"><h3>${esc(g.title)}</h3><dl>${g.rows.map(([k,v,note,wide]) =>
      `<div class="pr${wide?' wide':''}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd>${note?`<span class="nt">${esc(note)}</span>`:''}</div>`).join('')}</dl></section>`).join('')}</div>`;

  const tipList = arr => arr.length ? `<ul>${arr.map(x => `<li><span class="tag${x.key?' key':''}">${esc(x.raw ? x.tag : tagText(x.tag))}</span>${esc(x.text)}</li>`).join('')}</ul>` : `<p class="empty">${esc(T('tips.none'))}</p>`;
  const tipsHTML = `<div class="tips">
    <section class="printer"><h3>${esc(p.brand)} ${esc(p.model)}<small>${esc(T('tips.printer'))}</small></h3>${tipList(tips.printer)}</section>
    <section><h3>${esc(filName(f))}<small>${esc(T('tips.filament'))}</small></h3>${tipList(tips.material)}</section>
    ${s ? `<section><h3>${esc(supName(s))}<small>${esc(T('g.support'))}</small></h3>${tipList(tips.support)}</section>` : ''}
    <section><h3>${esc(typeName(t))}<small>${esc(T('tips.type'))}</small></h3>${tipList(tips.type)}</section>
  </div>`;

  if (exportTab==='orcaSup' && !s) exportTab = 'txt';
  const tabs = [['txt','exp.txt'],['orca','exp.orca']].concat(s ? [['orcaSup','exp.orcaSup']] : []).concat([['prusa','exp.prusa']]);
  const exportHTML = `<section class="panel export" aria-labelledby="expTitle">
    <h2 id="expTitle"><span>${esc(T('exp.title'))}</span></h2>
    <div class="tabs" role="tablist">${tabs.map(([id,k]) => `<button role="tab" type="button" data-tab="${id}" aria-selected="${exportTab===id}">${esc(T(k))}</button>`).join('')}</div>
    <textarea id="expText" readonly aria-label="${esc(T('exp.aria'))}"></textarea>
    <div class="bar">
      <button class="btn primary" type="button" id="dlBtn">${esc(T('exp.download'))}</button>
      <button class="btn" type="button" id="cpBtn">${esc(T('exp.copy'))}</button>
      <span class="status" id="expStatus"></span>
    </div>
  </section>`;

  sheet.innerHTML = `
    <div class="panel sheet-head">
      <div>
        <h2>${esc(p.model)} <span>×</span> ${esc(filName(f))}${s ? ` <span>+</span> ${esc(supName(s))}` : ''}</h2>
        <div class="chips">
          <span class="chip">${esc(p.brand)}</span>
          <span class="chip">${esc(T('chip.nozzle',{n:fmtNozzle(n)}))} · ${esc(ntName(o.nt))}</span>
          <span class="chip hot">${esc(typeName(t))}</span>
          <span class="chip">${esc(clsLabel(f.cls))}</span>
          ${badge}
        </div>
      </div>
      <div class="actions"><button class="btn" type="button" data-jump>${esc(T('btn.export'))}</button></div>
    </div>
    ${alertHTML}
    ${thermo}
    <h3 class="section-title">${esc(T('sec.params'))}</h3>
    ${groupsHTML}
    <h3 class="section-title">${esc(T('sec.tips'))}</h3>
    ${tipsHTML}
    ${exportHTML}
    <p class="foot">${esc(T('foot'))}</p>`;

  ctx.groups = groups;
  setupExport(ctx);
  if (!opts.silent){ sheet.classList.remove('flash'); void sheet.offsetWidth; sheet.classList.add('flash'); }
  activeKey = keyOf(q);
  renderHistory();
}
