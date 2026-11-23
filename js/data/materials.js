/* Material classes
   Shared behaviour of each family of filaments (cooling, retraction, enclosure, abrasiveness…). Each class needs cls.<CLASS> and mt.<CLASS> strings in i18n/*.json. */
'use strict';

const CLASSES = {
  PLA:  {fam:'PLA', type:'PLA', fan:[80,100], fanOff:1, retD:0.8, retB:3.5, rs:40, zhop:0.2, flow:0.98, brim:0, chamber:0, hyg:false, warp:1, plate:'plate.pla', dry:'dry.pla', hdt:'≈ 55 °C'},
  PETG: {fam:'PETG', type:'PETG', fan:[20,50], fanOff:3, retD:1.0, retB:5, rs:30, zhop:0.4, flow:0.95, brim:0, chamber:0, hyg:true, warp:2, plate:'plate.petg', dry:'dry.petg', hdt:'≈ 70 °C'},
  ABS:  {fam:'ABS', type:'ABS', fan:[0,20], fanOff:3, retD:0.8, retB:5, rs:40, zhop:0.2, flow:0.95, brim:5, chamber:50, hyg:false, needsEncl:true, warp:3, plate:'plate.abs', dry:'dry.abs', hdt:'≈ 95 °C'},
  ASA:  {fam:'ASA', type:'ASA', fan:[10,30], fanOff:3, retD:0.8, retB:5, rs:40, zhop:0.2, flow:0.95, brim:5, chamber:45, hyg:false, needsEncl:true, warp:3, plate:'plate.abs', dry:'dry.abs', hdt:'≈ 95 °C'},
  PC:   {fam:'PC', type:'PC', fan:[0,10], fanOff:3, retD:1.0, retB:6, rs:30, zhop:0.2, flow:0.95, brim:8, chamber:55, hyg:true, needsEncl:true, warp:4, plate:'plate.pc', dry:'dry.pc', hdt:'≈ 115 °C'},
  PA_CF:{fam:'PA', type:'PA-CF', fan:[0,30], fanOff:3, retD:1.0, retB:6, rs:30, zhop:0.2, flow:0.96, brim:5, chamber:55, hyg:true, cf:true, needsEncl:true, warp:3, plate:'plate.pc', dry:'dry.pa', hdt:'≈ 150–190 °C', hdtDry:true},
  TPU95:{fam:'TPU', type:'TPU', shore:'95A', fan:[40,80], fanOff:1, retD:0.4, retB:null, rs:20, zhop:0, flow:1.0, brim:0, chamber:0, hyg:true, maxSpeed:50, warp:1, plate:'plate.tpu', dry:'dry.tpu', hdt:'—'},
};
CLASSES.PLA_MATTE = {...CLASSES.PLA};
CLASSES.PA      = {...CLASSES.PA_CF, type:'PA', cf:false, warp:4, hdt:'≈ 60–80 °C'};
CLASSES.PA_GF   = {...CLASSES.PA_CF, type:'PA-GF'};
CLASSES.ABS_GF  = {...CLASSES.ABS, type:'ABS-GF', cfMild:true, warp:2, dry:'dry.abs8'};
CLASSES.ASA_CF  = {...CLASSES.ASA, type:'ASA-CF', cf:true, warp:2, dry:'dry.abs8'};
CLASSES.PC_CF   = {...CLASSES.PC, type:'PC-CF', cf:true, warp:3};
CLASSES.PET_CF  = {...CLASSES.PA_CF, fam:'PET', type:'PET-CF', chamber:45, warp:2, hdt:'≈ 150 °C+', hdtDry:false};
CLASSES.PPA_CF  = {...CLASSES.PA_CF, fam:'PPA', type:'PPA-CF', chamber:60, brim:5, warp:3, hdt:'≈ 200 °C+', hdtDry:false};
CLASSES.PPS_CF  = {...CLASSES.PA_CF, fam:'PPS', type:'PPS-CF', chamber:60, brim:5, warp:3, hyg:false, hdt:'≈ 230 °C+', hdtDry:false, dry:'dry.pps'};
CLASSES.PCTG    = {...CLASSES.PETG, type:'PCTG', fan:[20,50], warp:2};
CLASSES.PLA_SILK  = {...CLASSES.PLA, maxOuter:60};
CLASSES.PLA_CF    = {...CLASSES.PLA, fan:[60,100], cf:true, retD:1.0};
CLASSES.PETG_CF   = {...CLASSES.PETG, type:'PETG-CF', fan:[10,40], cf:true, zhop:0.2};
CLASSES.TPU85     = {...CLASSES.TPU95, shore:'85A', retD:0, maxSpeed:30, soft:true};
CLASSES.TPU70     = {...CLASSES.TPU95, shore:'70–75A', retD:0, maxSpeed:20, soft:true, verySoft:true};
CLASSES.TPU_HARD  = {...CLASSES.TPU95, shore:'68D', retD:0.8, maxSpeed:120, hard:true};
CLASSES.PLA_TOUGH = {...CLASSES.PLA, hdt:'≈ 60 °C'};
CLASSES.PLA_PART  = {...CLASSES.PLA, part:true};
CLASSES.PLA_GLOW  = {...CLASSES.PLA, part:true, abr:true, amsLiteNo:true};
CLASSES.PLA_WOOD  = {...CLASSES.PLA, part:true, wood:true, amsLiteNo:true, retD:0.6};
CLASSES.PLA_AERO  = {...CLASSES.PLA, foam:true, flow:0.6, retD:0.5, amsLiteNo:true, fan:[30,60], dry:'dry.aero'};
CLASSES.ASA_AERO  = {...CLASSES.ASA, type:'ASA Aero', foam:true, flow:0.6, retD:0.5, dry:'dry.abs8'};
CLASSES.PETG_CF.amsLiteNo = true;
const clsLabel = cls => T('cls.'+cls);
