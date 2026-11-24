/* Site configuration: edit this file after forking. */
'use strict';

const CONFIG = {
  // Public URL of the GitHub repository, e.g. 'https://github.com/your-user/3d-print-settings'.
  // When set, the footer shows "Source code" and "Suggest a printer or filament" links.
  repoUrl: 'https://github.com/3dpThings/3d-print-settings',

  // Visual styles shown in the Display menu. Each id needs a [data-style="id"] block in css/themes.css
  // (the first one is the default and uses the plain :root block). `label` is an i18n key or plain text.
  styles: [
    {id:'default',   label:'style.default'},
    {id:'contrast',  label:'style.contrast'},
    {id:'lowvision', label:'style.lowvision'},
  ],

  // Font pairs shown in the Display menu. Each id needs a [data-fonts="id"] block in css/themes.css.
  fontPairs: [
    {id:'tech',    label:'fonts.tech'},
    {id:'serif',   label:'fonts.serif'},
    {id:'legible', label:'fonts.legible'},
  ],
};
