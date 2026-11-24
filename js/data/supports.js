/* Support materials for multi-tool printers
   Dedicated support filaments plus catalogue filaments that release easily from the main material. */
'use strict';

/* Dedicated support materials for printers with 2 or more tools.
   for: main-material families it works with · kind: how it is removed */
const SUPPORTS = [
  {id:'sup-bbl-pla',     brand:'Bambu Lab', name:'Support for PLA',      ftype:'PLA-S', kind:'breakaway', nozzle:[210,230,220], bed:[35,45],  for:['PLA'],        ifOnly:true,  dry:'dry.pla'},
  {id:'sup-bbl-plapetg', brand:'Bambu Lab', name:'Support for PLA/PETG', ftype:'PVA',   kind:'breakaway', nozzle:[190,220,210], bed:[35,60],  for:['PLA','PETG'], ifOnly:true,  dry:'dry.pva', pva:true},
  {id:'sup-bbl-abs',     brand:'Bambu Lab', name:'Support for ABS',      ftype:'ABS-S', kind:'breakaway', nozzle:[240,270,255], bed:[80,100], for:['ABS'],        ifOnly:true,  dry:'dry.abs'},
  {id:'sup-bbl-pa',      brand:'Bambu Lab', name:'Support for PA/PET',   ftype:'PA-S',  kind:'breakaway', nozzle:[280,300,290], bed:[80,100], for:['PA','PET'],   ifOnly:true,  dry:'dry.supPa', paSup:true},
  {id:'sup-bbl-pva',     brand:'Bambu Lab', name:'PVA',                  ftype:'PVA',   kind:'water',     nozzle:[220,250,230], bed:[35,45],  for:['PLA','PETG'], ifOnly:false, dry:'dry.pva', pva:true},
  {id:'sup-pm-plasup',   brand:'Polymaker', name:'PolySupport for PLA', ftype:'PLA-S', kind:'breakaway', nozzle:[220,230,225], bed:[25,60],  for:['PLA'],        ifOnly:false, dry:'dry.pla'},
  {id:'sup-pm-pa12sup',  brand:'Polymaker', name:'PolySupport for PA12', ftype:'PA-S', kind:'breakaway', nozzle:[270,300,285], bed:[50,80],  for:['PA'],         ifOnly:false, dry:'dry.supPa'},
  {id:'sup-pm-s1',       brand:'Polymaker', name:'PolyDissolve S1 (PVA)', ftype:'PVA', kind:'water',     nozzle:[215,225,220], bed:[25,60],  for:['PLA','PETG','PVB'], ifOnly:false, dry:'dry.pva', pva:true},
  {id:'sup-sunlu-pva',   brand:'Sunlu',     name:'PVA',                  ftype:'PVA',   kind:'water',     nozzle:[200,230,215], bed:[45,60],  for:['PLA','PETG'], ifOnly:false, dry:'dry.pva', pva:true},
  {id:'sup-gen-pva',     brand:'Generic',   name:'PVA',                  ftype:'PVA',   kind:'water',     nozzle:[190,220,205], bed:[45,60],  for:['PLA','PETG'], ifOnly:false, dry:'dry.pva', pva:true},
  {id:'sup-gen-hips',    brand:'Generic',   name:'HIPS',                 ftype:'HIPS',  kind:'limonene',  nozzle:[230,250,240], bed:[90,110], for:['ABS','ASA'],  ifOnly:false, dry:'dry.abs'},
  {id:'sup-gen-bvoh',    brand:'Generic',   name:'BVOH',                 ftype:'BVOH',  kind:'water',     nozzle:[190,220,210], bed:[50,60],  for:['PLA','PETG','ABS','PA'], ifOnly:false, dry:'dry.pva', pva:true},
];
/* Catalogue filaments that barely stick to the main material, so they work as an easy-release support or interface */
const GOOD_PAIRS = {PLA:['PETG'], PETG:['PLA'], TPU:['PLA']};
const LEGACY_SUP = {'sup-x-petg':'fil:gen-petg', 'sup-x-pla':'fil:gen-pla'};
function filSupport(f2, mainFam){
  const c2 = CLASSES[f2.cls];
  return {id:'fil:'+f2.id, fil:f2, fam:c2.fam, ftype:c2.type, kind:'breakaway', nozzle:f2.nozzle, bed:[f2.bed[0], f2.bed[1]],
    for:[mainFam], ifOnly: mainFam!=='TPU', dry:c2.dry, cross:true};
}
function supById(id){
  if (!id) return null;
  id = LEGACY_SUP[id] || id;
  if (id.startsWith('fil:')){ const f2 = byId(FILAMENTS, id.slice(4)); return f2 ? filSupport(f2, null) : null; }
  return byId(SUPPORTS, id);
}
const supName = s => s.fil ? filName(s.fil) : `${brandName(s.brand)} ${s.name}`;
function supportOptions(f){
  const fam = CLASSES[f.cls].fam;
  const ded = SUPPORTS.filter(s => s.for.includes(fam));
  const pairs = GOOD_PAIRS[fam] || [];
  const fils = FILAMENTS.filter(x => x!==f && pairs.includes(CLASSES[x.cls].fam) && !CLASSES[x.cls].cf && !CLASSES[x.cls].cfMild && !CLASSES[x.cls].hard && !CLASSES[x.cls].part && !CLASSES[x.cls].foam && x.cls!=='PLA_SILK')
    .map(x => filSupport(x, fam));
  return ded.concat(fils);
}
const supportsFor = supportOptions;
const getSupport = (id, f) => { if (!id || !f) return null; id = LEGACY_SUP[id] || id; return supportOptions(f).find(s => s.id===id) || null; };
const multiTool = p => (p.tools||1) >= 2;
