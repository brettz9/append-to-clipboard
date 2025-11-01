/* eslint-disable import/unambiguous -- Ok */

/**
 * @param {string} sel
 * @returns {Node}
 */
function $ (sel) {
  return document.querySelector(sel);
}

const contentHolderID = 'append-to-clipboard-content-holder';
if ($('#' + contentHolderID)) {
  $('#' + contentHolderID).remove();
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
clipboardMethodMap.noSeparatorLinkText = clipboardMethodMap.noSeparator;
clipboardMethodMap.lineBreakSeparatorLinkText =
  clipboardMethodMap.lineBreakSeparator;
clipboardMethodMap.doubleLineBreakSeparatorLinkText =
  clipboardMethodMap.doubleLineBreakSeparator;

clipboardMethodMap.noSeparatorSrc = clipboardMethodMap.noSeparator;
clipboardMethodMap.lineBreakSeparatorSrc =
  clipboardMethodMap.lineBreakSeparator;
clipboardMethodMap.doubleLineBreakSeparatorSrc =
  clipboardMethodMap.doubleLineBreakSeparator;

/**
 * Adapted from MIT-licensed:
 *   https://github.com/NiklasGollenstede/es6lib/blob/master/dom.js#L162
 * .
 * @param {string|{[key: string]: string}} data
 * @param {number} timeout
 * @returns {Promise<void>}
 */
function writeToClipboard (data, timeout) {
  // eslint-disable-next-line promise/avoid-new -- Need to convert
  return new Promise(function (resolve, reject) {
    const copyText = $('#' + contentHolderID);
    copyText.focus();

    let done = false;

    /**
     * @param {Event} ev
     * @returns {void}
     */
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
    globalThis.setTimeout(() => {
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

/**
 * Adapted from MIT-licensed: https://github.com/NiklasGollenstede/es6lib/blob/master/dom.js#L192
 * .
 * @param {string|string[]} types
 * @param {number} timeout
 * @returns {Promise<void>}
 */
function readFromClipboard (types, timeout) {
  // eslint-disable-next-line promise/avoid-new -- Need to convert
  return new Promise(function (resolve, reject) {
    const pasteText = $('#' + contentHolderID);
    pasteText.focus();
    let done = false;

    /**
     * @param {Event} ev
     * @returns {void}
     */
    function onPaste (ev) {
      try {
        if (done) {
          return;
        }
        done = true;
        const transfer = ev.clipboardData;

        ev.preventDefault();
        document.removeEventListener('paste', onPaste);

        // Says no modification allowed; bug in original script?
        // transfer.clearData();
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
      } catch (error) {
        reject(error);
      }
    }
    const delay = timeout || 5000;
    globalThis.setTimeout(() => {
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

/**
 * @param {{[key: string]: string}} typesToSeparators
 * @param {string} linkText
 * @param {string} linkUrl
 * @param {string} srcUrl
 * @param {string} menuItemId
 * @returns {Promise<void>}
 */
async function append (
  typesToSeparators, linkText, linkUrl, srcUrl, menuItemId
) {
  // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=85686 , we cannot
  //  use `getSelection` alone
  let typeToSelection;
  if (linkText && menuItemId.endsWith('LinkText')) {
    typeToSelection = {
      'text/plain': linkText,
      'text/html': linkText
    };
  } else if (srcUrl && menuItemId.endsWith('Src')) {
    typeToSelection = {
      'text/plain': srcUrl,
      'text/html': `<a href="${srcUrl}">${linkText || srcUrl}</a>`
    };
  } else if (linkUrl) {
    typeToSelection = {
      'text/plain': linkUrl,
      'text/html': `<a href="${linkUrl}">${linkText || linkUrl}</a>`
    };
  } else {
    const activeElem = document.activeElement;
    if (['textarea', 'input'].includes(activeElem.nodeName.toLowerCase())) {
      const sel = activeElem.value.slice(
        activeElem.selectionStart, activeElem.selectionEnd
      );
      typeToSelection = {
        'text/plain': sel,
        'text/html': sel
      };
    } else {
      const sel = globalThis.getSelection();
      const container = document.createElement('div');
      for (let i = 0; i < sel.rangeCount; i++) {
        container.append(sel.getRangeAt(i).cloneContents());
      }
      typeToSelection = {
        'text/plain': sel.toString(),
        'text/html': container.innerHTML
      };
    }
  }

  const currentClipboard = await readFromClipboard(
    Object.keys(typesToSeparators)
  );
  Object.entries(typesToSeparators).forEach(([type, separator]) => {
    // eslint-disable-next-line @stylistic/max-len -- Long
    // console.log('currentClipboard', type, separator, '::', currentClipboard[type], '::', typeToSelection[type]);
    currentClipboard[type] += separator + typeToSelection[type];
  });
  return writeToClipboard(currentClipboard);
}

// Get around eslint-config-standard limitation on "exported" directive
//   by exporting as follows:
//   https://github.com/standard/standard/issues/614
globalThis.appendToClipboard = async function appendToClipboard (
  menuItemId, linkText, linkUrl, srcUrl
) {
  switch (menuItemId) {
  case 'clearClipboard':
    return writeToClipboard(clipboardMethodMap.noSeparator);
  default:
    break;
  }
  try {
    await append(
      clipboardMethodMap[menuItemId], linkText, linkUrl, srcUrl, menuItemId
    );
  } catch (err) {
    // Timed out
    // eslint-disable-next-line no-console -- Debugging
    console.log(`append erred: ${err}`);
  }
  return undefined;
};

// Can't clone above export
/* eslint-disable no-unused-expressions -- Firefox requires */
'end on a note which Firefox approves'; // lgtm [js/useless-expression]
/* eslint-enable no-unused-expressions -- Firefox requires */
