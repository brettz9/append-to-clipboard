import {jml, body} from './jml.js';

/**
 * @param {...string} args
 * @returns {string}
 */
function _ (...args) {
  return browser.i18n.getMessage(...args);
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
    ({[preferenceKey]: enabled = true} =
      await browser.storage.local.get(preferenceKey));
  } catch (err) {}
  return ['label', [
    ['input', {
      type: 'checkbox',
      checked: enabled,
      $on: {
        async change ({target}) {
          await browser.storage.local.set({
            [preferenceKey]: target.checked
          });
          const backgroundPage = browser.extension.getBackgroundPage();
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
  ]];
})), body);
