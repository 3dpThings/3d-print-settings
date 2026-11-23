/* Exports
   Plain-text sheet, OrcaSlicer/Bambu Studio filament JSON and PrusaSlicer .ini. */
'use strict';

function exportName(ctx){
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return `${slug(ctx.p.model)}_${slug(ctx.f.brand+' '+ctx.f.name)}_${String(ctx.n).replace('.','')}_${ctx.t.id}`;
}
function buildTxt(ctx){
  const {p,f,n,t,o,c,alerts,tips,groups} = ctx;
  const U = s => s.toLocaleUpperCase(LANG.locale);
  const L = [T('txt.title'),
    `${T('f.printer')}: ${p.brand} ${p.model}   ${T('f.nozzle')}: ${fmtNozzle(n)}`,
    `${T('f.filament')}: ${filName(f)} (${clsLabel(f.cls)})`,
    `${T('f.type')}: ${typeName(t)}`, ''];
  if (alerts.length){ alerts.forEach(a => L.push(`- [${T('lvl.'+a.lvl)}] ${a.text}`)); L.push(''); }
  L.push(U(T('th.aria')));
  L.push(`- ${T('th.nozzle')}: ${o.nz} °C (${T('th.first',{v:o.nz1})}) · ${T('th.range',{a:f.nozzle[0], b:f.nozzle[1]})}`);
  L.push(`- ${T('th.bed')}: ${o.bed} °C (${T('th.first',{v:o.bed1})}) · ${T('th.range',{a:f.bed[0], b:f.bed[1]})}`);
  if (ctx.s) L.push(`- ${T('th.support')} (${supName(ctx.s)}, ${fmtNozzle(o.sup.noz)} mm): ${o.sup.nz} °C · ${T('r.supStandby')} ${o.sup.standby} °C`);
  if (o.chamber.key) L.push(`- ${T('th.chamber')}: ${T(o.chamber.key, o.chamber.vars)}`);
  L.push(`- ${T('txt.soak',{m:p.soak})}`, '');
  groups.forEach(g => { L.push(U(g.title)); g.rows.forEach(([k,v]) => L.push(`- ${k}: ${v}`)); L.push(''); });
  const sec = (title, arr) => { L.push(`${U(T('sec.tips'))} · ${title}`); arr.forEach(x => L.push(`- ${x.text}`)); L.push(''); };
  sec(`${p.brand} ${p.model}`, tips.printer);
  sec(filName(f), tips.material);
  sec(typeName(t), tips.type);
  L.push(T('txt.foot'));
  return L.join('\n');
}
function buildOrca(ctx){
  const {p,f,n,t,o,c} = ctx, S = v => [String(v)];
  const name = `${f.brand==='Generic'?'Generic':f.brand} ${f.name} @${p.model} ${n} (${t.id})`;
  return JSON.stringify({
    type:'filament', name, from:'User', instantiation:'true', inherits:'',
    filament_settings_id:S(name), filament_vendor:S(f.brand), filament_type:S(c.type),
    nozzle_temperature:S(o.nz), nozzle_temperature_initial_layer:S(o.nz1),
    nozzle_temperature_range_low:S(f.nozzle[0]), nozzle_temperature_range_high:S(f.nozzle[1]),
    hot_plate_temp:S(o.bed), hot_plate_temp_initial_layer:S(o.bed1),
    textured_plate_temp:S(o.bed), textured_plate_temp_initial_layer:S(o.bed1),
    eng_plate_temp:S(o.bed), eng_plate_temp_initial_layer:S(o.bed1),
    chamber_temperature:S(o.chamber.value||0), chamber_temperatures:S(o.chamber.value||0),
    fan_min_speed:S(o.fan.min), fan_max_speed:S(o.fan.max), close_fan_the_first_x_layers:S(o.fan.off),
    filament_max_volumetric_speed:S(o.mvs), filament_flow_ratio:S(o.flow.toFixed(2)),
    filament_retraction_length:S(o.ret==null?0:o.ret), filament_retraction_speed:S(o.rs), filament_z_hop:S(o.zhop),
    filament_notes: T('orca.notes', {printer:`${p.brand} ${p.model}`, n:fmtNozzle(n), type:typeName(t), lh:fmt(o.lh), walls:o.walls, infill:o.infill, pattern:T('pat.'+t.pat), outer:o.sp.outer})
  }, null, 2);
}
function buildOrcaSup(ctx){
  const {p,f,n,t,o} = ctx, s = ctx.s, S = v => [String(v)];
  const raw = s.fil ? `${s.fil.brand} ${s.fil.name}` : `${s.brand} ${s.name}`;
  const name = `${raw} @${p.model} ${n} (support)`;
  return JSON.stringify({
    type:'filament', name, from:'User', instantiation:'true', inherits:'',
    filament_settings_id:S(name), filament_vendor:S(s.fil ? s.fil.brand : s.brand), filament_type:S(s.ftype),
    filament_is_support:S(s.cross ? 0 : 1), filament_soluble:S(s.kind==='breakaway' ? 0 : 1),
    nozzle_temperature:S(o.sup.nz), nozzle_temperature_initial_layer:S(o.sup.nz),
    nozzle_temperature_range_low:S(s.nozzle[0]), nozzle_temperature_range_high:S(s.nozzle[1]),
    hot_plate_temp:S(o.bed), textured_plate_temp:S(o.bed), eng_plate_temp:S(o.bed),
    filament_notes: `${supName(s)} · ${T('supk.'+s.kind)} · ${T(s.ifOnly ? 'r.supUse.interface' : 'r.supUse.full')}`
  }, null, 2);
}
function buildPrusa(ctx){
  const {p,f,n,t,o,c} = ctx;
  return [
    `# ${T('prusa.c1')}`,
    `# ${p.brand} ${p.model} | ${filName(f)} | ${n} mm | ${typeName(t)}`,
    `# ${T('prusa.c3')}`,
    `nozzle_diameter = ${n}`, `filament_type = ${c.type}`,
    `layer_height = ${o.lh}`, `first_layer_height = ${o.fl}`,
    `min_layer_height = ${o.lhMin}`, `max_layer_height = ${o.lhMax}`,
    `perimeters = ${o.walls}`, `top_solid_layers = ${o.top}`, `bottom_solid_layers = ${o.bottom}`,
    `fill_density = ${o.infill}%`, `fill_pattern = ${t.pf}`,
    `external_perimeter_speed = ${o.sp.outer}`, `perimeter_speed = ${o.sp.inner}`,
    `infill_speed = ${o.sp.infill}`, `solid_infill_speed = ${o.sp.infill}`, `top_solid_infill_speed = ${o.sp.top}`,
    `first_layer_speed = ${o.sp.first}`, `travel_speed = ${o.sp.travel}`,
    `seam_position = ${t.seamP}`, `support_material = ${t.supOn}`, `support_material_auto = ${t.supOn}`,
    `brim_width = ${o.brim}`, `ironing = ${o.ironing?1:0}`,
    `temperature = ${o.nz}`, `first_layer_temperature = ${o.nz1}`,
    `bed_temperature = ${o.bed}`, `first_layer_bed_temperature = ${o.bed1}`,
    `chamber_temperature = ${o.chamber.value||0}`,
    `min_fan_speed = ${o.fan.min}`, `max_fan_speed = ${o.fan.max}`, `disable_fan_first_layers = ${o.fan.off}`,
    `filament_max_volumetric_speed = ${o.mvs}`,
    `filament_retract_length = ${o.ret==null?0:o.ret}`, `filament_retract_speed = ${o.rs}`, `filament_retract_lift = ${o.zhop}`,
    `extrusion_multiplier = ${o.flow.toFixed(2)}`,
  ].concat(ctx.s ? [
    `# ${T('g.support')}: ${supName(ctx.s)} (extruder 2)`,
    `support_material_extruder = ${ctx.s.ifOnly ? 1 : 2}`,
    `support_material_interface_extruder = 2`,
    `support_material_contact_distance = 0`,
    `support_material_interface_layers = ${o.sup.ifLayers}`,
    `support_material_interface_spacing = 0`,
    `nozzle_diameter = ${n},${o.sup.noz}`,
    `min_layer_height = ${o.lhMin},${lhRange(o.sup.noz)[0]}`, `max_layer_height = ${o.lhMax},${lhRange(o.sup.noz)[1]}`,
    `temperature = ${o.nz},${o.sup.nz}`,
    `first_layer_temperature = ${o.nz1},${o.sup.nz}`,
    `filament_type = ${c.type};${ctx.s.ftype}`,
    `filament_soluble = 0,${ctx.s.kind==='breakaway' ? 0 : 1}`,
    `ooze_prevention = 1`,
    `standby_temperature_delta = -40`,
  ] : []).join('\n');
}
function exportContent(ctx, tab){
  const base = exportName(ctx) + (LANG.code==='en' ? '' : '_' + LANG.code);
  if (tab==='orca') return {text:buildOrca(ctx), filename:`${exportName(ctx)}_orca.json`};
  if (tab==='orcaSup' && ctx.s) return {text:buildOrcaSup(ctx), filename:`${exportName(ctx)}_support_orca.json`};
  if (tab==='prusa') return {text:buildPrusa(ctx), filename:`${exportName(ctx)}_prusaslicer.ini`};
  return {text:buildTxt(ctx), filename:`${base}.txt`};
}
function setupExport(ctx){
  const area = $('expText'), st = $('expStatus');
  const show = () => {
    const e = exportContent(ctx, exportTab);
    area.value = e.text;
    document.querySelectorAll('.tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab===exportTab)));
    st.className = 'status'; st.textContent = e.note || '';
  };
  show();
  document.querySelectorAll('.tabs [data-tab]').forEach(b => b.addEventListener('click', () => { exportTab = b.dataset.tab; show(); }));
  document.querySelector('[data-jump]').addEventListener('click', () => {
    document.querySelector('.export').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  });
  $('cpBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(area.value); st.className='status ok'; st.textContent=T('exp.copied'); }
    catch(e){ area.focus(); area.select(); st.className='status'; st.textContent=T('exp.copyFail'); }
  });
  $('dlBtn').addEventListener('click', () => {
    const e = exportContent(ctx, exportTab);
    try {
      const url = URL.createObjectURL(new Blob([e.text], {type:'text/plain;charset=utf-8'}));
      const a = document.createElement('a');
      a.href = url; a.download = e.filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      st.className = 'status ok'; st.textContent = T('exp.saved', {f:e.filename});
    } catch(err){ st.className = 'status'; st.textContent = T('exp.fail'); }
  });
}
