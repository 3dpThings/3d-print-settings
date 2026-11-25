/* Translations
   Strings live in i18n/<code>.json. T(key, vars) replaces {placeholders} and falls back to English. */
'use strict';

const LANGS = [
  {code:'en', file:'en',   locale:'en-GB', name:'English'},
  {code:'zh', file:'zh',   locale:'zh-CN', name:'中文（简体）'},
  {code:'de', file:'de',   locale:'de-DE', name:'Deutsch'},
  {code:'ja', file:'ja',   locale:'ja-JP', name:'日本語'},
  {code:'es', file:'es',   locale:'es-ES', name:'Español'},
  {code:'ca', file:'ca',   locale:'ca-ES', name:'Català'},
  {code:'fr', file:'fr',   locale:'fr-FR', name:'Français'},
  {code:'pt', file:'pt',   locale:'pt-BR', name:'Português'},
  {code:'it', file:'it',   locale:'it-IT', name:'Italiano'},
  {code:'ko', file:'ko',   locale:'ko-KR', name:'한국어'},
];
/* Languages with no translation of their own that should fall back to another one
   rather than to English (Galician and Basque speakers usually read Spanish). */
const LANG_FALLBACK = {gl:'es', eu:'es'};

/* First visit: pick the first of the browser's preferred languages that the app has.
   prefs is the navigator.languages list (e.g. ["ca-ES", "es", "en-US"]). */
function detectLang(prefs){
  for (const tag of prefs || []){
    const base = String(tag).toLowerCase().split(/[-_]/)[0];
    const code = LANGS.some(l => l.code === base) ? base : LANG_FALLBACK[base];
    if (code) return code;
  }
  return 'en';
}

let EN = {};            // English is the base language and the fallback for missing keys
const DICTS = {};
let LANG = LANGS[0];
let DICT = EN;

async function loadDict(code){
  const L = LANGS.find(l => l.code===code) || LANGS[0];
  if (!DICTS[L.code]){
    const r = await fetch(`i18n/${L.file}.json`, {cache:'no-cache'});
    if (!r.ok) throw new Error(`i18n/${L.file}.json: HTTP ${r.status}`);
    DICTS[L.code] = await r.json();
  }
  return DICTS[L.code];
}

function T(key, vars){
  let s = DICT[key];
  if (s == null) s = EN[key];
  if (s == null) return key;
  if (Array.isArray(s)) return s;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m,k) => vars[k] != null ? vars[k] : m);
  return s;
}
const TA = key => { const v = DICT[key] ?? EN[key]; return Array.isArray(v) ? v : []; };
const numFmt = {};
function fmt(v, digits){
  const k = LANG.locale + '|' + (digits ?? 'a');
  if (!numFmt[k]) numFmt[k] = new Intl.NumberFormat(LANG.locale, digits!=null ? {minimumFractionDigits:digits, maximumFractionDigits:digits} : {maximumFractionDigits:2, useGrouping:false});
  return numFmt[k].format(v);
}
const fmtNozzle = n => fmt(n, n===0.25 ? 2 : 1);
