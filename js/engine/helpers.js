/* Small helpers shared by the data, the engine and the UI
   No DOM access here: this file also runs in Node (scripts/check.mjs). */
'use strict';

const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const r2 = v => Math.round(v*100)/100;
const r1 = v => Math.round(v*10)/10;
const r5 = v => Math.round(v/5)*5;
const byId = (arr,id) => arr.find(x=>x.id===id);

const typesAt = (p, n) => NTYPES.filter(k => (p.ntypes[k]||[]).includes(n));
const sizesOf = (p, k) => p.ntypes[k] || [];
const ntName = k => T('nt.'+k);
const anyHardened = p => NTYPES.some(k => NT_HARD[k] && sizesOf(p,k).length);
