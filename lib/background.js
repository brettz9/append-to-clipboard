/* eslint-env webextensions */
'use strict';
function _ (key) {
    return browser.i18n.getMessage(key);
}

const contextMenus = [
    ['noSeparator', 'append_no_separator'],
    ['lineBreakSeparator', 'append_line_break'],
    ['doubleLineBreakSeparator', 'append_double_line_break'],
    ['clearClipboard', 'clear_clipboard', {
        context: 'all'
    }]
];
async function updateContextMenus () {
    await Promise.all(contextMenus.map(async ([menuID, menuI18nKey, {context} = {context: 'selection'}]) => {
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
                contexts: [context]
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
        } catch (err) {}
    }));
    console.log('Append-to-Clipboard add-on unloaded!');
});

browser.contextMenus.onClicked.addListener(async ({menuItemId}, tab) => {
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
        code: `appendToClipboard("${menuItemId}");`,
        runAt: 'document_end'
    });
});
