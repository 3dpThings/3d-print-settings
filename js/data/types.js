/* Print types (section 03)
   lh is the recommended layer height as a fraction of the nozzle diameter; minWalls (optional) is the least number of walls whatever the nozzle. Each type needs type.<id>.name/.desc/.mats strings. */
'use strict';

const TYPES = [
  {id:'mini', lh:0.2, wallMM:1.2, top:0.6, bottom:0.5, infill:15, pat:'gyroid', pf:'gyroid', speed:0.45, outer:0.3, dT:-5, fan:20, seam:'mini', seamP:'rear', sup:'mini', supOn:1, brim:0, ironing:false},
  {id:'car', lh:0.5, wallMM:1.8, top:1.0, bottom:0.8, infill:35, pat:'gyroid', pf:'gyroid', speed:0.8, outer:0.6, dT:5, fan:-10, seam:'edge', seamP:'aligned', sup:'edge', supOn:1, brim:0, ironing:false},
  {id:'deco', lh:0.25, wallMM:1.2, top:0.8, bottom:0.6, infill:12, pat:'gyroid', pf:'gyroid', speed:0.6, outer:0.35, dT:0, fan:0, seam:'deco', seamP:'rear', sup:'tree', supOn:1, brim:0, ironing:true, adaptive:true},
  {id:'eng', lh:0.5, wallMM:2.0, top:1.0, bottom:0.8, infill:40, pat:'gyrcub', pf:'gyroid', speed:0.75, outer:0.55, dT:5, fan:-15, seam:'eng', seamP:'aligned', sup:'eng', supOn:1, brim:0, ironing:false},
  {id:'draft', lh:0.7, wallMM:0.9, top:0.6, bottom:0.6, infill:10, pat:'lightning', pf:'lightning', speed:1, outer:0.9, dT:5, fan:0, seam:'nearest', seamP:'nearest', sup:'draft', supOn:1, brim:0, ironing:false},
  {id:'flex', lh:0.5, wallMM:1.2, top:0.8, bottom:0.8, infill:20, pat:'gyroid', pf:'gyroid', speed:0.6, outer:0.5, dT:0, fan:0, seam:'aligned', seamP:'aligned', sup:'flex', supOn:0, brim:0, ironing:false},
  {id:'outdoor', lh:0.5, wallMM:1.6, minWalls:4, top:1.0, bottom:0.8, infill:30, pat:'gyroid', pf:'gyroid', speed:0.8, outer:0.6, dT:5, fan:-10, seam:'edge', seamP:'aligned', sup:'normal', supOn:1, brim:0, ironing:false},
  {id:'big', lh:0.6, wallMM:1.2, minWalls:3, top:0.8, bottom:0.6, infill:10, pat:'adaptive', pf:'adaptivecubic', speed:1, outer:0.8, dT:0, fan:0, seam:'rear', seamP:'rear', sup:'big', supOn:1, brim:3, ironing:false},
  {id:'water', lh:0.5, wallMM:1.8, minWalls:4, top:1.2, bottom:1.0, infill:25, pat:'gyroid', pf:'gyroid', speed:0.6, outer:0.5, dT:5, fan:-10, flowAdj:0.03, seam:'aligned', seamP:'aligned', sup:'water', supOn:0, brim:0, ironing:false},
];
const typeName = t => T(`type.${t.id}.name`);
