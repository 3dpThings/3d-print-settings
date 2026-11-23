/* Printer- and type-specific recommendations
   tp(tag, i18nKey, condition, vars, isKey). Conditions receive {p, f, n, t, o, c, s}. */
'use strict';

const isFam = (x, ...fams) => fams.includes(x.c.fam);
const hot = x => !!x.c.needsEncl;
const softTpu = x => x.c.fam==='TPU' && !x.c.hard;
const BAMBU_AUX_CAUTION = ['PLA_SILK','PETG_CF','PA_CF','TPU_HARD'];
const tp = (tag, key, when, vars, isKey) => ({tag, key, when, vars, isKey});

const PRINTER_TIPS = {
  'bbl-x2d': {soak:'pt.x2d.soak', tips:[
    tp('dual','pt.x2d.aux', x=>BAMBU_AUX_CAUTION.includes(x.f.cls), x=>({fil:x.f.name}), true),
    tp('dual','pt.x2d.support', x=>!isFam(x,'TPU','PA','PC','PET','PPA','PPS')),
    tp('dual','pt.x2d.paSupport', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
    tp('AMS','pt.x2d.amsDry', x=>x.c.hyg && !softTpu(x)),
    tp('AMS','pt.tpuExtAms', softTpu),
    tp('nozzle','pt.x2d.cf', x=>x.c.cf),
    tp('plate','pt.platePaPc', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
  ]},
  'bbl-h2d': {soak:'pt.h2d.soak', tips:[
    tp('dual','pt.h2d.dual', x=>!isFam(x,'TPU')),
    tp('hotend','pt.h2d.hotend', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
    tp('AMS','pt.tpuExtAms', softTpu),
    tp('plate','pt.platePaPc', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
  ]},
  'bbl-x1c': {tips:[
    tp('auxfan','pt.auxfan', x=>isFam(x,'ABS','ASA','PC','PA','PET','PPA','PPS')),
    tp('nozzle','pt.cfStockHard', x=>x.c.cf),
    tp('AMS','pt.tpuRearAms', softTpu),
  ]},
  'bbl-p1s': {tips:[
    tp('nozzle','pt.p1s.cf', x=>x.c.cf, null, true),
    tp('auxfan','pt.auxfan', x=>isFam(x,'ABS','ASA','PC','PA','PET','PPA','PPS')),
    tp('AMS','pt.tpuRearAms', softTpu),
  ]},
  'bbl-a1': {tips:[
    tp('AMS lite','pt.amslite', softTpu),
    tp('AMS lite','pt.amsliteNo', x=>!!x.c.amsLiteNo, x=>({fil:x.f.name})),
    tp('calib','pt.a1.calib'),
  ]},
  'bbl-a1m': {tips:[
    tp('bed','pt.a1m.bed', x=>x.f.bed[0] > 80, x=>({fil:x.f.name, b:x.f.bed[0]})),
    tp('AMS lite','pt.amslite', softTpu),
    tp('AMS lite','pt.amsliteNo', x=>!!x.c.amsLiteNo, x=>({fil:x.f.name})),
  ]},
  'prusa-core1': {tips:[
    tp('chamber','pt.core1.hot', hot),
    tp('chamber','pt.core1.cool', x=>!hot(x)),
  ]},
  'prusa-mk4s': {tips:[ tp('enclosure','pt.mk4s.encl', hot) ]},
  'prusa-mini': {tips:[ tp('Bowden','pt.mini.bowden') ]},
  'prusa-xl': {tips:[ tp('segbed','pt.xl.segbed') ]},
  'bbl-h2c': {soak:'pt.bigbed.soak', tips:[
    tp('multitool','pt.h2c.left', null, null, true),
    tp('multitool','pt.h2c.heat'),
    tp('hotend','pt.h2d.hotend', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
    tp('AMS','pt.tpuExtAms', softTpu),
    tp('plate','pt.platePaPc', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
  ]},
  'bbl-h3c': {soak:'pt.bigbed.soak', tips:[
    tp('multitool','pt.h3c.temps', x=>true, null, true),
    tp('multitool','pt.h3c.swap'),
    tp('plate','pt.platePaPc', x=>isFam(x,'PA','PC','PET','PPA','PPS')),
  ]},
  'cr-k3': {tips:[
    tp('enclosure','pt.k3.open', hot, null, true),
    tp('multitool','pt.k3.swap'),
  ]},
  'sm-u1': {tips:[
    tp('enclosure','pt.u1.cover', null, null, true),
  ]},
  'ff-c5': {tips:[
    tp('enclosure','pt.c5.open', hot, null, true),
    tp('bed','pt.c5.bed', x=>x.f.bed[1] >= 100),
  ]},
  'ff-c5p': {tips:[
    tp('chamber','pt.c5p.chamber', hot, null, true),
    tp('bed','pt.c5.bed', x=>x.f.bed[1] >= 100),
  ]},
  'cr-k1c': {tips:[ tp('nozzle','pt.cfStockHard', x=>x.c.cf) ]},
  'cr-k2p': {soak:'pt.k2p.soak', tips:[ tp('CFS','pt.k2p.cfs', softTpu) ]},
  'cr-e3v3se': {tips:[ tp('hotend','pt.e3.hotend', null, null, true), tp('speed','pt.e3.speed') ]},
  'el-cc': {tips:[ tp('nozzle','pt.cfStockHard', x=>x.c.cf) ]},
  'el-n4p': {tips:[ tp('bed','pt.n4p.bed') ]},
  'qd-plus4': {tips:[ tp('hotend','pt.plus4.hotend', x=>isFam(x,'PA','PC','PET','PPA','PPS')) ]},
  'voron-24': {soak:'pt.voron.soak', tips:[ tp('Klipper','pt.voron.fw') ]},
};
// Tags: translated when a tag.<x> key exists; otherwise (AMS, CFS, Bowden, Klipper) shown as is
const tagText = tag => (DICT['tag.'+tag] ?? EN['tag.'+tag]) ?? tag;

function printerTips(x){
  const {p,c,o} = x, out = [];
  const mat = c.type;
  const conf = PRINTER_TIPS[p.id] || {};
  let soak = conf.soak ? T(conf.soak, {bed:o.bed, model:p.model, w:p.vol.split(' × ').slice(0,2).join(' × '), m:p.soak}) : T('gt.soak', {model:p.model, bed:o.bed, m:p.soak});
  if (!conf.soak && c.warp>=3) soak += ' ' + T('gt.soakWarp', {mat});
  out.push({tag:'bed', key:true, text:soak});
  if (p.chamber==='active' && hot(x)) out.push({tag:'chamber', key:true, text:T('gt.chActiveHot', {t:o.chamber.value})});
  if (p.chamber==='active' && isFam(x,'PLA','TPU')) out.push({tag:'chamber', text:T('gt.chActiveCool', {mat})});
  if (p.chamber==='passive' && hot(x)) out.push({tag:'chamber', key:true, text:T('gt.chPassiveHot', {bed:p.maxBed, m:p.preheat||15})});
  if (p.chamber==='passive' && isFam(x,'PLA','TPU')) out.push({tag:'chamber', text:T('gt.chPassiveCool', {mat})});
  if (p.chamber!=='open' && isFam(x,'PETG')) out.push({tag:'chamber', text:T('gt.chPetg')});
  if (p.chamber==='open' && hot(x)) out.push({tag:'enclosure', text:T('gt.openHot', {mat})});
  if (p.slinger) out.push({tag:'kin', text:T('gt.slinger')});
  if (p.prusa && isFam(x,'PETG')) out.push({tag:'plate', key:true, text:T('gt.prusaPetg')});
  if (p.prusa) out.push({tag:'first', text:T('gt.loadcell')});
  (conf.tips||[]).forEach(t => { if (!t.when || t.when(x)) out.push({tag:t.tag, key:t.isKey, text:T(t.key, t.vars ? t.vars(x) : null)}); });
  if (p.mm==='changer'){
    out.push({tag:'multitool', text:T('mt2.ooze')});
    out.push({tag:'multitool', text:T('mt2.standby')});
  }
  if (p.mm==='changer' || p.mm==='nozzle') out.push({tag:'multitool', text:T('mt2.offsets')});
  if (multiTool(p) && !x.s && x.t.supOn && supportsFor(x.f).length) out.push({tag:'support', key:true, text:T('mt2.pickSupport')});
  return out;
}

function typeTips(x){
  const out = [];
  if (x.t.id==='mini'){
    out.push(T(x.n > 0.25 ? 'tt.miniBig' : 'tt.miniSmall'));
    out.push(...TA('tt.mini'));
    if (multiTool(x.p) && !x.s) out.push(T('tt.miniDual'));
  } else out.push(...TA('tt.'+x.t.id));
  return out.map(s => ({tag:'part', text:s}));
}
