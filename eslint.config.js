import ashNazg from 'eslint-config-ash-nazg';
import globals from 'globals';

export default [
  {
    ignores: [
      'options/jml.js',
      'polyfills/browser-polyfill.min.js'
    ]
  },
  ...ashNazg(['sauron', 'browser']).map((cfg) => {
    return {
      ...cfg,
      languageOptions: {
        ...cfg.languageOptions,
        globals: {
          ...cfg.languageOptions?.globals,
          ...globals.webextensions
        }
      }
    };
  })
];
