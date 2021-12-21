/* eslint-env node */
'use strict';

module.exports = {
  extends: 'standard',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    node: false,
    browser: true
  },
  rules: {
    semi: [2, 'always'],
    indent: ['error', 2, {outerIIFEBody: 0}],
    'object-property-newline': 0,
    'one-var': 0,
    'no-var': 2,
    'prefer-const': 2,
    'object-curly-spacing': ['error', 'never']
  }
};
