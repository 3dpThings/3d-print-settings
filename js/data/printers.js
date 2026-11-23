/* Printer catalogue
   See CONTRIBUTING.md › "Adding a printer" for what each field means. */
'use strict';

const PRINTERS = [
  {id:'bbl-x2d', brand:'Bambu Lab', model:'X2D', maxNozzle:300, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'256 × 256 × 260 mm', flow:32, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:5, dual:true, tools:2, mm:'dual', mix:false},
  {id:'bbl-h2d', brand:'Bambu Lab', model:'H2D', maxNozzle:350, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'325 × 320 × 325 mm', flow:40, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:6, dual:true, tools:2, mm:'dual', mix:false},
  {id:'bbl-h2c', brand:'Bambu Lab', model:'H2C', maxNozzle:350, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'325 × 320 × 325 mm', flow:40, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:6, dual:true, tools:7, mm:'nozzle', mix:false},
  {id:'bbl-h3c', brand:'Bambu Lab', model:'H3C', maxNozzle:350, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'330 × 320 × 325 mm', flow:40, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:6, tools:9, mm:'changer', mix:true},
  {id:'bbl-x1c', brand:'Bambu Lab', model:'X1 Carbon', maxNozzle:300, maxBed:110, chamber:'passive', hardened:true, drive:'direct', vol:'256 × 256 × 256 mm', flow:32, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:5},
  {id:'bbl-p1s', brand:'Bambu Lab', model:'P1S', maxNozzle:300, maxBed:100, chamber:'passive', hardened:false, drive:'direct', vol:'256 × 256 × 256 mm', flow:32, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:5},
  {id:'bbl-a1', brand:'Bambu Lab', model:'A1', maxNozzle:300, maxBed:100, chamber:'open', hardened:false, drive:'direct', vol:'256 × 256 × 256 mm', flow:28, speedF:0.9, nozzles:[0.2,0.4,0.6,0.8], soak:3, slinger:true},
  {id:'bbl-a1m', brand:'Bambu Lab', model:'A1 mini', maxNozzle:300, maxBed:80, chamber:'open', hardened:false, drive:'direct', vol:'180 × 180 × 180 mm', flow:28, speedF:0.9, nozzles:[0.2,0.4,0.6,0.8], soak:2, slinger:true},
  {id:'prusa-core1', brand:'Prusa Research', model:'CORE One', maxNozzle:290, maxBed:120, chamber:'passive', hardened:false, drive:'direct', vol:'250 × 220 × 270 mm', flow:30, speedF:0.85, nozzles:[0.25,0.4,0.6,0.8], soak:4, prusa:true},
  {id:'prusa-mk4s', brand:'Prusa Research', model:'MK4S', maxNozzle:290, maxBed:120, chamber:'open', hardened:false, drive:'direct', vol:'250 × 210 × 220 mm', flow:30, speedF:0.75, nozzles:[0.25,0.4,0.6,0.8], soak:3, slinger:true, prusa:true},
  {id:'prusa-mini', brand:'Prusa Research', model:'MINI+', maxNozzle:280, maxBed:100, chamber:'open', hardened:false, drive:'bowden', vol:'180 × 180 × 180 mm', flow:15, speedF:0.45, nozzles:[0.25,0.4,0.6], soak:2, slinger:true, prusa:true},
  {id:'prusa-xl', brand:'Prusa Research', model:'XL', maxNozzle:290, maxBed:120, chamber:'open', hardened:false, drive:'direct', vol:'360 × 360 × 360 mm', flow:25, speedF:0.7, nozzles:[0.25,0.4,0.6,0.8], soak:6, prusa:true, tools:5, mm:'changer', mix:'exp'},
  {id:'cr-k1c', brand:'Creality', model:'K1C', maxNozzle:300, maxBed:100, chamber:'passive', hardened:true, drive:'direct', vol:'220 × 220 × 250 mm', flow:32, speedF:1, nozzles:[0.4,0.6,0.8], soak:4},
  {id:'cr-k2p', brand:'Creality', model:'K2 Plus', maxNozzle:350, maxBed:120, chamber:'active', maxChamber:60, hardened:true, drive:'direct', vol:'350 × 350 × 350 mm', flow:40, speedF:1, nozzles:[0.4,0.6,0.8], soak:8},
  {id:'cr-k3', brand:'Creality', model:'K3', maxNozzle:300, maxBed:100, chamber:'open', hardened:null, drive:'direct', vol:'260 × 260 × 260 mm', flow:32, speedF:0.9, nozzles:[0.2,0.4,0.6,0.8], soak:4, tools:4, mm:'changer', mix:false},
  {id:'cr-e3v3se', brand:'Creality', model:'Ender-3 V3 SE', maxNozzle:260, maxBed:100, chamber:'open', hardened:false, drive:'direct', vol:'220 × 220 × 250 mm', flow:18, speedF:0.5, nozzles:[0.4,0.6], soak:3, slinger:true},
  {id:'el-cc', brand:'Elegoo', model:'Centauri Carbon', maxNozzle:320, maxBed:110, chamber:'passive', hardened:true, drive:'direct', vol:'256 × 256 × 256 mm', flow:32, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:5},
  {id:'el-n4p', brand:'Elegoo', model:'Neptune 4 Pro', maxNozzle:300, maxBed:110, chamber:'open', hardened:null, drive:'direct', vol:'225 × 225 × 265 mm', flow:25, speedF:0.7, nozzles:[0.2,0.4,0.6,0.8], soak:4, slinger:true},
  {id:'ac-ks1', brand:'Anycubic', model:'Kobra S1', maxNozzle:320, maxBed:120, chamber:'passive', hardened:null, drive:'direct', vol:'250 × 250 × 250 mm', flow:32, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:5},
  {id:'qd-plus4', brand:'Qidi', model:'Plus4', maxNozzle:370, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'305 × 305 × 280 mm', flow:35, speedF:1, nozzles:[0.2,0.4,0.6,0.8], soak:6},
  {id:'qd-q1p', brand:'Qidi', model:'Q1 Pro', maxNozzle:350, maxBed:120, chamber:'active', maxChamber:60, hardened:true, drive:'direct', vol:'245 × 245 × 240 mm', flow:32, speedF:1, nozzles:[0.4,0.6,0.8], soak:5},
  {id:'sm-u1', brand:'Snapmaker', model:'U1', maxNozzle:300, maxBed:100, chamber:'open', hardened:false, drive:'direct', vol:'270 × 270 × 270 mm', flow:32, speedF:0.9, nozzles:[0.2,0.4,0.6,0.8], soak:4, tools:4, mm:'changer', mix:false},
  {id:'ff-c5', brand:'Flashforge', model:'Creator 5', maxNozzle:320, maxBed:120, chamber:'open', hardened:true, drive:'direct', vol:'256 × 256 × 256 mm', flow:32, speedF:1, nozzles:[0.25,0.4,0.6,0.8], soak:5, tools:4, mm:'changer', mix:true},
  {id:'ff-c5p', brand:'Flashforge', model:'Creator 5 Pro', maxNozzle:320, maxBed:120, chamber:'active', maxChamber:65, hardened:true, drive:'direct', vol:'256 × 256 × 256 mm', flow:32, speedF:1, nozzles:[0.25,0.4,0.6,0.8], soak:5, tools:4, mm:'changer', mix:true},
  {id:'voron-24', brand:'Voron', model:'2.4 (350)', maxNozzle:300, maxBed:120, chamber:'passive', hardened:null, drive:'direct', vol:'350 × 350 × 340 mm', flow:30, speedF:0.9, nozzles:[0.4,0.6], soak:10, preheat:45},
];

/* Nozzle types per printer: the sizes available for each type, and the type fitted from the factory (stock).
   std = standard (brass/stainless) · hard = hardened · hf = high flow · hfhard = hardened high flow */
const NTYPES = ['std','hard','hf','hfhard'];
const NT_HARD = {std:false, hard:true, hf:false, hfhard:true};
const NT_FLOW = {std:1, hard:1, hf:1.6, hfhard:1.6};
const BBL_DUAL = {std:[0.2], hard:[0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]};
const PRUSA_NX = {std:[0.25,0.4,0.6,0.8], hf:[0.4,0.6,0.8], hard:[0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]};
const NOZZLE_TYPES = {
  'bbl-x2d': {stock:'hard', types:BBL_DUAL, sameType:true},
  'bbl-h2d': {stock:'hard', types:BBL_DUAL, sameType:true},
  'bbl-h2c': {stock:'hard', types:BBL_DUAL, sameType:true},
  'bbl-h3c': {stock:'hard', types:{hard:[0.2,0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]}},
  'bbl-x1c': {stock:'hard', types:{std:[0.2], hard:[0.4,0.6,0.8]}},
  'bbl-p1s': {stock:'std',  types:{std:[0.2,0.4], hard:[0.4,0.6,0.8]}},
  'bbl-a1':  {stock:'std',  types:{std:[0.2,0.4], hard:[0.4,0.6,0.8]}},
  'bbl-a1m': {stock:'std',  types:{std:[0.2,0.4], hard:[0.4,0.6,0.8]}},
  'prusa-core1': {stock:'hf', types:PRUSA_NX},
  'prusa-mk4s':  {stock:'hf', types:PRUSA_NX},
  'prusa-xl':    {stock:'hf', types:PRUSA_NX},
  'prusa-mini':  {stock:'std', types:{std:[0.25,0.4,0.6], hard:[0.4,0.6]}},
  'cr-k1c':    {stock:'hard', types:{hard:[0.4,0.6,0.8], hf:[0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]}},
  'cr-k2p':    {stock:'hard', types:{hard:[0.4,0.6,0.8], hfhard:[0.4,0.6,0.8]}},
  'cr-k3':     {stock:'std',  types:{std:[0.2,0.4,0.6,0.8]}},
  'cr-e3v3se': {stock:'std',  types:{std:[0.4,0.6], hard:[0.4,0.6]}},
  'el-cc':     {stock:'hard', types:{hard:[0.2,0.4,0.6,0.8]}},
  'el-n4p':    {stock:'std',  types:{std:[0.2,0.4,0.6,0.8], hard:[0.4,0.6,0.8]}},
  'ac-ks1':    {stock:'std',  types:{std:[0.2,0.4,0.6,0.8], hard:[0.4,0.6,0.8]}},
  'qd-plus4':  {stock:'hard', types:{hard:[0.2,0.4,0.6,0.8]}},
  'qd-q1p':    {stock:'hard', types:{hard:[0.4,0.6,0.8]}},
  'voron-24':  {stock:'std',  types:{std:[0.4,0.6], hard:[0.4,0.6], hf:[0.4,0.6], hfhard:[0.4,0.6]}},
  'sm-u1':     {stock:'std',  types:{std:[0.4], hard:[0.2,0.4,0.6,0.8]}},
  'ff-c5':     {stock:'hard', types:{hard:[0.25,0.4,0.6,0.8]}},
  'ff-c5p':    {stock:'hard', types:{hard:[0.25,0.4,0.6,0.8]}},
};
PRINTERS.forEach(p => {
  const nt = NOZZLE_TYPES[p.id];
  p.ntypes = nt ? nt.types : {[p.hardened ? 'hard' : 'std']: p.nozzles};
  p.nstock = nt ? nt.stock : (p.hardened ? 'hard' : 'std');
  p.sameType = !!(nt && nt.sameType);
  p.nozzles = [...new Set(Object.values(p.ntypes).flat())].sort((a,b) => a-b);
});
