/* Suggestions
   Best printer for a filament + print type, ideal nozzle size and type. */
'use strict';

const maxDim = p => Math.max(...(p.vol.match(/\d+/g)||['0']).slice(0,3).map(Number));
function scorePrinter(p, f, t){
  const c = CLASSES[f.cls]; let sc = 0; const why = [];
  if (f.nozzle[0] > p.maxNozzle) return null;
  if (c.fam==='TPU' && c.soft && p.drive==='bowden') return null;
  if (c.abr && !anyHardened(p)) sc -= 20;
  if (c.cf){ if (p.hardened===true){ sc += 30; why.push(['rs.hardened']); } else if (anyHardened(p)) sc -= 15; else sc -= 60; }
  if (c.needsEncl){
    if (p.chamber==='active'){ sc += 40; why.push(['rs.chamberActive', {t:p.maxChamber}]); }
    else if (p.chamber==='passive'){ sc += 20; why.push(['rs.enclosed']); }
    else sc -= 50;
  } else if (c.fam==='PETG' && p.chamber!=='open') sc += 3;
  if (f.bed[0] > p.maxBed) sc -= 25;
  if (f.nozzle[2] + 5 > p.maxNozzle) sc -= 8;
  if (['PA','PC','PET','PPA','PPS'].includes(c.fam) && p.maxNozzle >= 320){ sc += 8; why.push(['rs.hot', {t:p.maxNozzle}]); }
  const small = p.nozzles.some(n => n <= 0.25);
  const sups = t.supOn && multiTool(p) && supportsFor(f).length > 0;
  if (t.id==='mini'){
    if (small){ sc += 15; why.push(['rs.small', {n:fmtNozzle(Math.min(...p.nozzles))}]); }
    if (sups){ sc += 10; why.push(['rs.multi']); }
  } else if (sups){ sc += (t.id==='deco' || t.id==='eng') ? 8 : 5; why.push(['rs.multi']); }
  if (t.id==='deco' && small) sc += 4;
  if (t.id==='big'){ const d = maxDim(p); sc += (d - 250) / 4; if (d >= 300) why.push(['rs.big', {v:d}]); }
  if (t.id==='draft'){ sc += p.speedF * 10; if (p.speedF >= 1) why.push(['rs.fast']); }
  sc += p.speedF * 5;
  return {p, sc, why};
}
function idealType(p, f, t, n){
  const c = CLASSES[f.cls], avail = typesAt(p, n);
  if (!avail.length) return p.nstock;
  const fast = t && (t.id==='draft' || t.id==='big') && c.fam!=='TPU' && n >= 0.4;
  let order;
  if (c.cf || c.abr) order = fast ? ['hfhard','hard'] : ['hard','hfhard'];
  else if (fast) order = ['hfhard','hf', p.nstock, 'hard','std'];
  else if (c.fam==='TPU') order = [p.nstock==='hf' ? 'std' : p.nstock, p.nstock==='hfhard' ? 'hard' : p.nstock, 'std','hard','hf','hfhard'];
  else order = [p.nstock, 'std','hard','hf','hfhard'];
  return order.find(k => avail.includes(k)) || avail[0];
}
function idealSupType(p, n, mainType, s){
  if (p.sameType) return mainType;
  const avail = typesAt(p, n);
  const sc = s && s.fil ? CLASSES[s.fil.cls] : null;
  if (sc && (sc.cf || sc.cfMild || sc.abr)){ const h = ['hard','hfhard'].find(k => avail.includes(k)); if (h) return h; }
  const order = [p.nstock==='hfhard' ? 'hard' : p.nstock==='hf' ? 'std' : p.nstock, 'std','hard','hf','hfhard'];
  return order.find(k => avail.includes(k)) || avail[0] || mainType;
}
const suggestPrinters = (f, t) => PRINTERS.map(p => scorePrinter(p, f, t)).filter(Boolean).sort((a,b) => b.sc - a.sc);
function idealNozzle(p, f, t){
  const c = CLASSES[f.cls];
  let want = 0.4;
  if (t.id==='mini') want = 0.2;
  if (t.id==='draft' || t.id==='big') want = 0.6;
  if (c.cf || c.cfMild) want = t.id==='mini' ? 0.4 : 0.6;
  if ((c.fam==='TPU' || c.part || c.foam) && want < 0.4) want = 0.4;
  const ok = p.nozzles.filter(n => !((c.cf || c.cfMild || c.part) && n <= 0.25));
  const pool = ok.length ? ok : p.nozzles;
  return pool.reduce((best, n) => Math.abs(n - want) < Math.abs(best - want) - 1e-9 ? n : best, pool[0]);
}
