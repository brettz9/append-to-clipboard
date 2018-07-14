/* eslint-env browser */

function $ (sel) {
    return document.querySelector(sel);
}

const contentHolderID = 'append-to-clipboard-content-holder';
if ($(contentHolderID)) {
    $(contentHolderID).remove();
}
document.body.append(
    (() => {
        const ta = document.createElement('textarea');
        ta.id = contentHolderID;
        ta.style.display = 'none';
        // ta.hidden = true;
        // ta.contentEditable = true;
        return ta;
    })()
);
const clipboardMethodMap = {
    noSeparator: {
        'text/plain': '',
        'text/html': ''
    },
    lineBreakSeparator: {
        'text/plain': '\n',
        'text/html': '<br />\n'
    },
    doubleLineBreakSeparator: {
        'text/plain': '\n\n',
        'text/html': '<br /><br />\n'
    }
};

// Adapted from MIT-licensed: https://github.com/NiklasGollenstede/es6lib/blob/master/dom.js#L162
function writeToClipboard (data, timeout) {
    return new Promise(function (resolve, reject) {
        const copyText = $('#' + contentHolderID);
        copyText.focus();

        let done = false;
        function onCopy (ev) {
            try {
                if (done) {
                    return;
                }
                done = true;
                document.removeEventListener('copy', onCopy);
                const transfer = ev.clipboardData;
                transfer.clearData();
                if (typeof data === 'string') {
                    transfer.setData('text/plain', data);
                } else {
                    Object.entries(data).forEach(([mimeType, mimeData]) => {
                        transfer.setData(mimeType, mimeData);
                    });
                }
                ev.preventDefault(); // Disallow auto-copying
                resolve();
            } catch (error) {
                reject(error);
            }
        }
        const delay = timeout || 5000;
        window.setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            document.removeEventListener('copy', onCopy);
            reject(new Error('Timeout after ' + delay + 'ms'));
        }, delay);
        document.addEventListener('copy', onCopy);
        document.execCommand('copy', false, null);
    });
}

// Adapted from MIT-licensed: https://github.com/NiklasGollenstede/es6lib/blob/master/dom.js#L192
function readFromClipboard (types, timeout) {
    return new Promise(function (resolve, reject) {
        const pasteText = $('#' + contentHolderID);
        pasteText.focus();
        let done = false;
        function onPaste (ev) {
            try {
                if (done) {
                    return;
                }
                done = true;
                const transfer = ev.clipboardData;
                // transfer.clearData(); // Says no modification allowed; bug in original script?
                if (typeof types === 'string' || !types) {
                    resolve(transfer.getData(types || 'text/plain'));
                } else {
                    resolve(
                        types.reduce((data, mimeType) => {
                            data[mimeType] = transfer.getData(mimeType);
                            return data;
                        }, {})
                    );
                }
                ev.preventDefault();
                document.removeEventListener('paste', onPaste);
            } catch (error) {
                reject(error);
            }
        }
        const delay = timeout || 5000;
        window.setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            document.removeEventListener('paste', onPaste);
            reject(new Error('Timeout after ' + delay + 'ms'));
        }, delay);
        document.addEventListener('paste', onPaste);
        document.execCommand('paste', false, null);
        pasteText.dispatchEvent(new Event('paste', {
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    });
}

async function append (typesToSeparators) {
    // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=85686 , we cannot
    //  use `getSelection` alone
    let typeToSelection;
    const activeElem = document.activeElement;
    if (['textarea', 'input'].includes(activeElem.nodeName.toLowerCase())) {
        const sel = activeElem.value.slice(activeElem.selectionStart, activeElem.selectionEnd);
        typeToSelection = {
            'text/plain': sel,
            'text/html': sel
        };
    } else {
        const sel = window.getSelection();
        const container = document.createElement('div');
        for (let i = 0; i < sel.rangeCount; i++) {
            container.append(sel.getRangeAt(i).cloneContents());
        }
        typeToSelection = {
            'text/plain': sel.toString(),
            'text/html': container.innerHTML
        };
    }

    const currentClipboard = await readFromClipboard(Object.keys(typesToSeparators));
    Object.entries(typesToSeparators).forEach(([type, separator]) => {
        // console.log('currentClipboard', type, separator, '::', currentClipboard[type], '::', typeToSelection[type]);
        currentClipboard[type] += separator + typeToSelection[type];
    });
    return writeToClipboard(currentClipboard);
}

// Get around eslint-config-standard limitation on "exported" directive
//   by exporting as follows:
//   https://github.com/standard/standard/issues/614
window.appendToClipboard = async function appendToClipboard (menuItemId) {
    switch (menuItemId) {
    case 'clearClipboard':
        return writeToClipboard(clipboardMethodMap.noSeparator);
    }
    try {
        await append(clipboardMethodMap[menuItemId]);
    } catch (err) {
        // Timed out
        console.log(`append erred: ${err}`);
    }
};

// Can't clone above export
'end on a note which Firefox approves'; // eslint-disable-line no-unused-expressions
