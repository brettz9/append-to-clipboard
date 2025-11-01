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
          // eslint-disable-next-line @stylistic/max-len -- Long
          // eslint-disable-next-line unicorn/no-useless-fallback-in-spread -- TS
          ...(cfg.languageOptions?.globals ?? {}),
          ...globals.webextensions
        }
      }
    };
  })
];
