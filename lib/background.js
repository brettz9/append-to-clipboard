import '../polyfills/browser-polyfill.min.js';

/**
 * @import {Menus} from 'webextension-polyfill';
 */

/**
 * @param {string} key
 * @returns {string}
 */
function _ (key) {
  return browser.i18n.getMessage(key);
}

/**
 * @type {[
 *   id: string,
 *   i18n: string,
 *   info?: {contexts: Menus.ContextType[]}
 * ][]}
 */
const contextMenus = [
  ['noSeparator', 'append_no_separator'],
  ['lineBreakSeparator', 'append_line_break'],
  ['doubleLineBreakSeparator', 'append_double_line_break'],
  ['noSeparatorLinkText', 'append_no_separator_linktext', {
    contexts: ['link']
  }],
  ['lineBreakSeparatorLinkText', 'append_line_break_linktext', {
    contexts: ['link']
  }],
  ['doubleLineBreakSeparatorLinkText', 'append_double_line_break_linktext', {
    contexts: ['link']
  }],

  ['noSeparatorSrc', 'append_no_separator_src', {
    contexts: ['audio', 'image', 'video']
  }],
  ['lineBreakSeparatorSrc', 'append_line_break_src', {
    contexts: ['audio', 'image', 'video']
  }],
  ['doubleLineBreakSeparatorSrc', 'append_double_line_break_src', {
    contexts: ['audio', 'image', 'video']
  }],

  ['clearClipboard', 'clear_clipboard', {
    contexts: ['all']
  }]
];

/**
 * @returns {Promise<void>}
 */
async function updateContextMenus () {
  await Promise.all(contextMenus.map(async ([
    menuID, menuI18nKey, {contexts} = {
      contexts: /** @type {Menus.ContextType[]} */ (['selection', 'link'])
    }
  ]) => {
    try { // Errs at least in Chrome when not present
      await browser.contextMenus.remove(menuID);
    } catch (err) {}
    let enabled = true;
    try {
      enabled = /** @type {{enabled: boolean}} */ (
        (await browser.storage.local.get(menuID))[
          menuID
        ]
      ).enabled ?? true;
    } catch (err) {}
    if (enabled) {
      browser.contextMenus.create({
        id: menuID,
        title: _(menuI18nKey),
        contexts
      });
    }
  }));
}
browser.runtime.onInstalled.addListener(updateContextMenus);
browser.runtime.onStartup.addListener(updateContextMenus);

// Was running without unloading the add-on
// // Not yet supported in Firefox (though seems to be handled
// //   automatically anyways)
// if (browser.runtime.onSuspend) {
//   browser.runtime.onSuspend.addListener(async () => {
//     await Promise.all(contextMenus.map(([menuID]) => {
//       try { // Errs at least in Chrome when not present
//         return browser.contextMenus.remove(menuID);
//       } catch (err) {
//         return undefined;
//       }
//     }));
//     // eslint-disable-next-line no-console -- Debugging
//     console.log('Append-to-Clipboard add-on unloaded!');
//   });
// }

browser.contextMenus.onClicked.addListener(
  async ({menuItemId, linkText, linkUrl, srcUrl}, tab) => {
    // Unfortunately, Firefox doesn't allow clipboard APIs (except image
    //   setting) from background scripts, so we have to go through this
    const results = await browser.scripting.executeScript({
      target: {
        tabId: /** @type {number} */ (tab?.id),
        allFrames: false
      },
      func: () => typeof appendToClipboard === 'function'
    });

    if (!results || !results[0] || results[0].result !== true) {
      await browser.scripting.executeScript({
        target: {
          tabId: /** @type {number} */ (tab?.id),
          allFrames: true
        },
        // Cross-browser to use absolute path
        files: ['/content-scripts/contextMenu.js'],
        injectImmediately: false
      });
    }

    await browser.scripting.executeScript({
      target: {
        tabId: /** @type {number} */ (tab?.id),
        allFrames: true
      },
      args: [menuItemId, linkText || '', linkUrl || '', srcUrl || ''],
      /**
       * @param {keyof
       *   import('../content-scripts/contextMenu.js').ClipboardMethodMap|
       *   "clearClipboard"} mnuItemId
       * @param {string} lnkText
       * @param {string} lnkUrl
       * @param {string} sourceUrl
       */
      // eslint-disable-next-line object-shorthand -- Webextension expectation
      func: (mnuItemId, lnkText, lnkUrl, sourceUrl) => {
        globalThis.appendToClipboard(mnuItemId, lnkText, lnkUrl, sourceUrl);
      },
      injectImmediately: false
    });
  }
);
