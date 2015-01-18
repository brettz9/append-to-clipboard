/*globals exports, require */
// This is an active module of the Append to Clipboard Add-on

// Todos: Add option to retrieve selection for appending as text or HTML (regardless of original source)

(function () {'use strict';

var cms = {}, destroyMenu = function (pref) {
    cms[pref].destroy();
    delete cms[pref];
};

exports.main = function () {

    var simplePrefs = require('sdk/simple-prefs'),
        prefs = simplePrefs.prefs,
        _ = require('sdk/l10n').get,
        cm = require('./contextMenu'),
        contextMenu = require('sdk/context-menu'),
        clip = require('sdk/clipboard'),
        defineAppendor = function (label, separator) {
            return [label, function (clip, sel, flavor) { // Todo: Could add third data argument and change constructor to CreateClipboardContextMenuGroup
                clip.set(
                    (clip.get(flavor) || '') +
                        (typeof separator === 'object' ? separator[flavor] : separator) +
                        sel, // nodeSel,
                    flavor
                );
            }];
        },
        labels = [
            ['noSeparator', _("append_no_separator"), ''],
            ['lineBreakSeparator', _("append_line_break"), {text: '\n', html: '<br />\n'}],
            ['doubleLineBreakSeparator', _("append_double_line_break"), {text: '\n\n', html: '<br /><br />\n'}]            
        ].reverse().reduce(function (obj, item) {
            obj[item[0]] = defineAppendor(item[1], item[2]);
            return obj;
        }, {}),
        buildMenuItem = function (pref) { // This does not appear to be running, at least using Addons Builder
            if (prefs[pref] && !cms[pref]) {
                if (pref === 'clearClipboard') {
                    cms.clearClipboard = contextMenu.Item({
                        label: _("clear_clipboard"),
                        context: contextMenu.PredicateContext(function () {return true;}),
                        contentScript:  'self.on("click", function (node, data) {' +
                                        '  self.postMessage("");' + // Must send JSON only
                                        '});',
                        onMessage: function () {
                            clip.set('', clip.currentFlavors.indexOf('html') > -1 ? 'html' : 'text');
                        }
                    });
                }
                else {
                    cms[pref] = cm.CreateClipboardContextMenuItem({
                        label: labels[pref][0],
                        onMessage: labels[pref][1]
                    });
                }
            }
            else if (cms[pref]) {
                destroyMenu(pref);
            }
        };
    Object.keys(labels).forEach(buildMenuItem);
    buildMenuItem('clearClipboard');

    simplePrefs.on('', buildMenuItem);
};

exports.onUnload = function () { // reason
    Object.keys(cms).forEach(destroyMenu);
    cms = null;
};

}());
