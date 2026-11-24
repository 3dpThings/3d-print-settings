/* Settings engine
   compute() turns printer + filament + nozzle + print type into slicer settings; checks() produces warnings; paramGroups() lays out the result rows. */
'use strict';

/* Layer heights: usable range is 20–75 % of the nozzle diameter; typical options at 20–70 %. */
const LH_FR = [0.2,0.3,0.4,0.5,0.6,0.7];
const lhRange = n => [r2(Math.max(0.05, n*0.2)), r2(n*0.75)];
function idealLh(n, f, t){
  const c = CLASSES[f.cls], [a,b] = lhRange(n);
  let lh = r2(clamp(n*t.lh, a, b));
  if (c.fam==='TPU' && n>=0.4 && lh<0.12) lh = 0.12;
  return lh;
}
function lhOptions(n, ideal){
  const [a,b] = lhRange(n);
  const set = new Set(LH_FR.map(x => r2(n*x)).filter(v => v >= a-1e-9 && v <= b+1e-9));
  set.add(ideal);
  return [...set].sort((x,y) => x-y);
}
function compute(p, f, n, t, s, sn, nt, snt, lhSel){
  const c = CLASSES[f.cls];
  const lhIdeal = idealLh(n, f, t), [lhMin, lhMax] = lhRange(n);
  let lh = lhIdeal;
  if (lhSel && lhSel >= lhMin-1e-9 && lhSel <= lhMax+1e-9) lh = r2(lhSel);
  const fl = n<=0.25 ? 0.12 : (n>=0.6 ? r2(n*0.5) : 0.2);
  const lwO = r2(n*1.05), lwI = r2(n*1.12), lwF = r2(n*1.25);
  const walls = Math.max(2, Math.round(t.wallMM/lwI));
  const top = Math.max(3, Math.ceil(t.top/lh - 1e-9)), bottom = Math.max(3, Math.ceil(t.bottom/lh - 1e-9));
  const [nmin,nmax,nbase] = f.nozzle;
  let nz = clamp(nbase + t.dT, nmin, nmax), nzLimited = false;
  if (nz > p.maxNozzle){ nz = p.maxNozzle; nzLimited = true; }
  const nz1 = c.fam==='TPU' ? nz : Math.min(nz+5, nmax, p.maxNozzle);
  const [bmin,bmax,bbase] = f.bed;
  let bed = bbase;
  if (bed > p.maxBed) bed = p.maxBed;
  const bed1 = (c.fam==='PLA'||c.fam==='TPU') ? bed : Math.min(bed+5, bmax, p.maxBed);
  let chamber = {value:null, key:null};
  if (c.chamber>0){
    if (p.chamber==='active'){ const v = Math.min(c.chamber, p.maxChamber); chamber = {value:v, key:'ch.active', vars:{t:v}}; }
    else if (p.chamber==='passive') chamber = {value:null, approx:45, key:'ch.passive'};
    else chamber = {value:null, key:'ch.open'};
  } else if (p.chamber!=='open'){
    chamber = {value:null, key: c.fam==='PETG' ? 'ch.closed' : 'ch.doorOpen'};
  }
  const ns = n<=0.25 ? 0.35 : n>=0.8 ? 1.5 : n>=0.6 ? 1.3 : 1;
  nt = nt && (p.ntypes[nt]||[]).includes(n) ? nt : (typesAt(p, n).includes(p.nstock) ? p.nstock : (typesAt(p, n)[0] || p.nstock));
  const tf = NT_FLOW[nt] / NT_FLOW[p.nstock];
  const mf = c.fam==='TPU' ? (c.soft ? 1 : Math.min(NT_FLOW[nt], 1.2)) : NT_FLOW[nt];
  const mvs = r1(Math.min(f.mvs*Math.min(ns,1.3)*mf, p.flow*ns*tf));
  const maxSp = f.maxSpeed ?? c.maxSpeed ?? Infinity;
  const cap = (v, lw, extra=Infinity) => Math.max(10, r5(Math.min(v, maxSp, extra, mvs/(lh*lw))));
  const sf = p.speedF*t.speed;
  const sp = {
    outer: cap(200*p.speedF*t.outer, lwO, c.maxOuter ?? Infinity),
    inner: cap(300*sf, lwI),
    infill: cap(300*sf, lwI),
    top: cap(180*sf, lwI),
    first: Math.max(10, r5(Math.min(50*Math.max(0.6,p.speedF), maxSp*0.6, mvs/(fl*lwF)))),
    travel: r5(500*Math.max(0.5,p.speedF)),
  };
  const fadj = c.fam==='PLA' ? Math.max(0,t.fan) : t.fan;
  const fmin = clamp(c.fan[0] + fadj, 0, 100);
  const fmax = clamp(c.fan[1] + fadj, fmin, 100);
  const ret = p.drive==='bowden' ? c.retB : c.retD;
  const flow = r2(c.flow + (t.flowAdj||0));
  const brim = c.brim + (t.brim||0) + (p.slinger && t.id==='big' ? 2 : 0);
  let sup = null;
  if (s){
    const snz = Math.min(clamp(s.nozzle[2], s.nozzle[0], s.nozzle[1]), p.maxNozzle);
    sup = {nz:snz, standby:Math.max(s.nozzle[0]-60, snz-40), ifLayers: s.ifOnly ? 3 : 2, noz: (p.mix === false || !sn) ? n : sn};
    sup.nt = p.sameType ? nt : (snt && (p.ntypes[snt]||[]).includes(sup.noz) ? snt : idealSupType(p, sup.noz, nt, s));
  }
  return {lh, lhIdeal, lhMin, lhMax, fl, lwO, lwI, walls, top, bottom, infill:t.infill, nz, nz1, nzLimited, bed, bed1, chamber, mvs, sp,
    fan:{min:fmin, max:fmax, off:c.fanOff}, ret, rs:c.rs, zhop:c.zhop, flow, brim, nt,
    ironing: t.ironing && c.fam!=='TPU', adaptive: !!t.adaptive, sup};
}

function checks(p, f, n, t, o, s){
  const c = CLASSES[f.cls], A = [];
  const add = (lvl, key, vars) => A.push({lvl, text:T(key, vars)});
  const fil = filName(f);
  if (f.nozzle[0] > p.maxNozzle) add('crit','a.noTemp',{model:p.model, max:p.maxNozzle, fil, min:f.nozzle[0]});
  else if (o.nzLimited) add('warn','a.nzLimited',{max:p.maxNozzle, model:p.model});
  if (f.bed[0] > p.maxBed) add('warn','a.bed',{max:p.maxBed, b0:f.bed[0], b1:f.bed[1]});
  if (c.cf){
    if (!NT_HARD[o.nt]){
      if (o.nt===p.nstock && p.hardened==null) add('warn','a.cfUnk',{fil:f.name});
      else add('crit', anyHardened(p) ? 'a.cfPickHard' : 'a.cfSoft', {fil:f.name, model:p.model});
    }
    if ((o.nt==='hf' || o.nt==='hfhard') && n <= 0.4) add('info','a.cfHf');
    if (n<=0.25) add('crit','a.cfSmall');
  }
  if (c.cfMild){ if (!NT_HARD[o.nt]) add('info','a.gfMild',{fil:f.name}); if (n<=0.25) add('crit','a.cfSmall'); }
  if (c.abr && !NT_HARD[o.nt]) add('warn','a.glowSoft',{fil:f.name});
  if (c.part && n<=0.25) add('crit','a.partSmall',{fil:f.name});
  if (c.foam) add('info','a.foam',{fil:f.name});
  if (c.needsEncl && p.chamber==='open') add('warn','a.open',{mat:c.type});
  if (c.fam==='TPU' && p.drive==='bowden') add(c.soft ? 'crit' : 'warn', c.soft ? 'a.tpuSoftBowden' : 'a.tpuBowden', {shore:c.shore});
  if (t.id==='car' && c.fam==='PLA') add('crit','a.carPla');
  if (t.id==='car' && c.fam==='PETG') add('info','a.carPetg');
  if (t.id==='car' && c.fam==='TPU') add('info','a.carTpu');
  if (t.id==='outdoor' && c.fam==='PLA') add('warn','a.outPla');
  if (t.id==='outdoor' && c.fam==='ABS') add('info','a.outAbs');
  if (t.id==='flex' && c.fam!=='TPU') add('warn','a.flexNo',{fil:f.name});
  if (t.id==='mini' && n>=0.6) add('info','a.miniBig',{n:fmtNozzle(n)});
  if (t.id==='mini' && c.cf) add('info','a.miniCf');
  if (t.id==='deco' && c.cf) add('info','a.decoCf');
  if (t.id==='water') add('info','a.water');
  if (c.verySoft && p.speedF < 0.6) add('info','a.verySoft');
  if (c.soft && (o.nt==='hf' || o.nt==='hfhard')) add('info','a.hfTpu');
  if (s){
    const sn = supName(s);
    if (s.nozzle[0] > p.maxNozzle) add('crit','a.supTemp',{sup:sn, min:s.nozzle[0], model:p.model, max:p.maxNozzle});
    if (p.id==='bbl-x2d' && s.paSup) add('warn','a.supX2dPa');
    if (o.sup.noz !== n) add('info','a.supNozMix', {model:p.model});
    if (o.sup.noz !== n && p.mix === 'exp' && p.brand === 'Bambu Lab') add('warn','a.supNozMixBbl', {model:p.model});
    const [, supMax] = lhRange(o.sup.noz);
    if (o.lh > supMax + 1e-9) add('warn','a.supLh', {lh:fmt(o.lh), n:fmtNozzle(o.sup.noz), max:fmt(supMax)});
    const sc = s.fil ? CLASSES[s.fil.cls] : null;
    if (sc && (sc.cf || sc.cfMild || sc.abr) && !NT_HARD[o.sup.nt]) add('warn','a.supAbr', {sup:sn});
    if (sc && (sc.cf || sc.cfMild || sc.part) && o.sup.noz <= 0.25) add('crit','a.supSmall', {sup:sn});
    if (s.tier === 'other'){
      if (s.fil && sc.fam === c.fam) add('warn','a.supSameFam', {sup:sn, mat:c.type});
      else add('info','a.supOther', {sup:sn, mat:c.type});
    }
    if (s.pva && c.fam==='PETG' && o.bed > 60) add('warn','a.supPvaPetg',{sup:sn});
    else if (o.bed > s.bed[1] + 20) add('info','a.supBed',{mat:c.type, bed:o.bed, sup:sn, b1:s.bed[1]});
  }
  return A;
}

function buildTips(p, f, n, t, o, s){
  const c = CLASSES[f.cls], x = {p,f,n,t,o,c,s};
  const mat = TA('mt.'+f.cls).map(v => ({tag:c.type, raw:true, text:v}));
  mat.push({tag:'drying', text:T('mt.dry', {dry:T(c.dry)})});
  const sup = [];
  if (s){
    const sn = supName(s);
    if (s.ifOnly) sup.push({tag:'support', key:true, text:T('st.interfaceOnly',{sup:sn})});
    if (s.cross) sup.push({tag:'support', text:T(c.fam==='TPU' ? 'st.tpuPla' : 'st.cross')});
    if (s.tier === 'other') sup.push({tag:'support', key:true, text:T('st.other')});
    sup.push({tag:'support', text:T('st.'+s.kind)});
    if (s.pva) sup.push({tag:'drying', text:T('st.pva')});
    if (s.paSup) sup.push({tag:'support', text:T('st.supPa')});
    sup.push({tag:'support', text:T('st.prime')});
  }
  return {printer:printerTips(x), material:mat, support:sup, type:typeTips(x)};
}

/* Parameter rows: shared by the results sheet and the .txt export */
function paramGroups(ctx){
  const {p,o,c,t} = ctx;
  const mm = v => `${fmt(v)} mm`, mms = v => `${v} mm/s`;
  const retTxt = o.ret==null ? T('r.ret.na') : (o.ret===0 ? T('r.ret.off') : `${fmt(o.ret)} mm · ${o.rs} mm/s`);
  const s = ctx.s;
  let sup = T('sup.'+t.sup); if (s && t.supOn) sup += '. ' + T('sup.withMat', {sup:supName(s)});
  return [
    {title:T('g.quality'), rows:[
      [T('r.nozzle'), `${fmtNozzle(ctx.n)} mm · ${ntName(o.nt)}`],
      [T('r.lh'), mm(o.lh), Math.abs(o.lh-o.lhIdeal) > 1e-9 ? T('r.lh.custom', {v:fmt(o.lhIdeal)}) : (o.adaptive ? T('r.lh.adaptive') : T('r.lh.rec'))],
      [T('r.lhRange', {n:fmtNozzle(ctx.n)}), `${fmt(o.lhMin)}–${fmt(o.lhMax)} mm`, T(o.adaptive ? 'r.lhRange.adaptive' : 'r.lhRange.note')],
      [T('r.fl'), mm(o.fl)],
      [T('r.lw'), `${fmt(o.lwO)} / ${fmt(o.lwI)} mm`, T('r.lw.note')],
      [T('r.walls'), String(o.walls)],
      [T('r.tb'), `${o.top} / ${o.bottom}`],
      [T('r.infill'), `${o.infill} % · ${T('pat.'+t.pat)}`],
      [T('r.seam'), T('seam.'+t.seam), null, true],
      [T('r.ironing'), o.ironing ? T('r.ironing.yes') : T('no')],
    ]},
    {title:T('g.speed'), rows:[
      [T('r.outer'), mms(o.sp.outer)],
      [T('r.inner'), mms(o.sp.inner)],
      [T('r.infillSp'), mms(o.sp.infill)],
      [T('r.top'), mms(o.sp.top)],
      [T('r.firstSp'), mms(o.sp.first)],
      [T('r.travel'), mms(o.sp.travel)],
      [T('r.mvs'), `${fmt(o.mvs)} mm³/s`, T('r.mvs.note')],
    ]},
    {title:T('g.cool'), rows:[
      [T('r.fan'), `${o.fan.min}–${o.fan.max} %`],
      [T('r.fanOff'), o.fan.off===1 ? T('r.fanOff.one') : T('r.fanOff.many', {n:o.fan.off})],
      [T('r.ret'), retTxt, T(p.drive==='bowden' ? 'r.drive.bowden' : 'r.drive.direct')],
      [T('r.zhop'), o.zhop ? mm(o.zhop) : T('no')],
      [T('r.flow'), fmt(o.flow, 2), T('r.flow.note')],
    ]},
    {title:T('g.plate'), rows:[
      [T('r.plate'), T(c.plate), null, true],
      [T('r.brim'), o.brim ? `${o.brim} mm` : T('no')],
      [T('r.supports'), sup, null, true],
      [T('r.dry'), T(c.dry), null, true],
      [T('r.hdt'), c.hdt + (c.hdtDry ? ' ' + T('r.hdt.dry') : ''), T('r.hdt.note')],
    ]},
  ].concat(s ? [{title:T('g.support'), rows:[
      [T('r.supMat'), `${supName(s)} · ${T('supk.'+s.kind)}`, null, true],
      [T('r.supNoz'), `${fmtNozzle(o.sup.noz)} mm · ${ntName(o.sup.nt)}`],
      [T('r.supNz'), `${o.sup.nz} °C`],
      [T('r.supStandby'), `${o.sup.standby} °C`],
      [T('r.supUse'), T(s.ifOnly ? 'r.supUse.interface' : 'r.supUse.full'), null, true],
      [T('r.supIfLayers'), String(o.sup.ifLayers)],
      [T('r.supZ'), '0 mm', T('r.supZ.note')],
      [T('r.supDensity'), '100 %'],
      [T('r.supRemove'), T('rm.'+s.kind), null, true],
      [T('r.dry'), T(s.dry), null, true],
    ]}] : []);
}
