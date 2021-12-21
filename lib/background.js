/* eslint-env webextensions */
'use strict';
function _ (key) {
  return browser.i18n.getMessage(key);
}

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
  ['clearClipboard', 'clear_clipboard', {
    contexts: ['all']
  }]
];
async function updateContextMenus () {
  await Promise.all(contextMenus.map(async ([menuID, menuI18nKey, {contexts} = {contexts: ['selection', 'link']}]) => {
    try { // Errs at least in Chrome when not present
      await browser.contextMenus.remove(menuID);
    } catch (err) {}
    let enabled = true;
    try {
      ({[menuID]: enabled = true} = await browser.storage.local.get(menuID));
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
updateContextMenus();

// Not yet supported in Firefox (though seems to be handled automatically anyways)
browser.runtime.onSuspend && browser.runtime.onSuspend.addListener(async () => {
  await Promise.all(contextMenus.map(([menuID]) => {
    try { // Errs at least in Chrome when not present
      return browser.contextMenus.remove(menuID);
    } catch (err) {
      return undefined;
    }
  }));
  console.log('Append-to-Clipboard add-on unloaded!');
});

const esc = (str) => {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r|\n/g, '');
};

browser.contextMenus.onClicked.addListener(async ({menuItemId, linkText, linkUrl}, tab) => {
  // Unfortunately, Firefox doesn't allow clipboard APIs (except image
  //   setting) from background scripts, so we have to go through this
  const results = await browser.tabs.executeScript({
    code: "typeof appendToClipboard === 'function';"
  });
  if (!results || results[0] !== true) {
    await browser.tabs.executeScript({
      allFrames: true,
      file: '/content-scripts/contextMenu.js', // Cross-browser to use absolute path
      runAt: 'document_end'
    });
  }
  await browser.tabs.executeScript({
    allFrames: true,
    code: `appendToClipboard("${menuItemId}", "${esc(linkText || '')}", "${esc(linkUrl || '')}");`,
    runAt: 'document_end'
  });
});
