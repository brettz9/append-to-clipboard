import {jml, body} from './jml.js';

/**
 * @param {string} arg
 * @returns {string}
 */
function _ (arg) {
  return browser.i18n.getMessage(arg);
}

document.title = _('extensionName'); // If switch to tabs

jml('section', await Promise.all([
  ['noSeparator'],
  ['lineBreakSeparator'],
  ['doubleLineBreakSeparator'],
  ['noSeparatorSrc'],
  ['lineBreakSeparatorSrc'],
  ['doubleLineBreakSeparatorSrc'],
  ['noSeparatorLinkText'],
  ['lineBreakSeparatorLinkText'],
  ['doubleLineBreakSeparatorLinkText'],
  ['clearClipboard']
].map(async ([preferenceKey]) => {
  let enabled = true;
  try {
    enabled = /** @type {{enabled: boolean}} */ (
      (await browser.storage.local.get(preferenceKey))[
        preferenceKey
      ]
    ).enabled ?? true;
  } catch (err) {}
  return /** @type {import('jamilih').JamilihArray} */ (['label', [
    ['input', {
      type: 'checkbox',
      checked: enabled,
      $on: {
        async change ({target}) {
          await browser.storage.local.set({
            [preferenceKey]: /** @type {HTMLInputElement} */ (target).checked
          });
          const backgroundPage =
            /**
             * @type {Window & {
             *   updateContextMenus: () => void
             * }}
             */ (
              browser.extension.getBackgroundPage()
            );
          backgroundPage.updateContextMenus();
        }
      }
    }],
    ' ',
    _(preferenceKey + '_title'),
    ['section', {class: 'addon-description'}, [
      _(preferenceKey + '_description')
    ]],
    ['br']
  ]]);
})), body);
