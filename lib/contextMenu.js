/*globals require, exports*/
/*jslint sloppy: true */

// context-menu.js - Append to Clipboard's module
// author: brettz9

var contextMenu = require('sdk/context-menu');

function BuildSelectionContextMenuItem(config) {
    if (config) {
        this.setConfig(config);
    }
    this.context = [
        contextMenu.SelectionContext()
    ];
}
BuildSelectionContextMenuItem.prototype.setConfig = function (config) {
    this.label = config.label;
    this.userOnMessage = config.onMessage;
};
BuildSelectionContextMenuItem.prototype.getOnMessage = function () {
    if (this.setOnMessage) {
        this.setOnMessage();
    }
    return this.onMessage || this.userOnMessage;
};
BuildSelectionContextMenuItem.prototype.build = function () {
    var that = this;
    return contextMenu.Item({
        label: that.label,
        context: that.context,
        contentScript:  'self.on("click", function (node, data) {' +
                        '  self.postMessage({outerHTML:node.outerHTML,textContent:node.textContent}, data);' + // Must send JSON only
                        '});',
        onMessage: that.getOnMessage()
    });
};


function BuildClipboardContextMenuItem(config) {
    if (config) {
        this.setConfig(config);
    }
}
BuildClipboardContextMenuItem.prototype = new BuildSelectionContextMenuItem();
BuildClipboardContextMenuItem.prototype.setOnMessage = function () {
    var that = this,
        clip = require('sdk/clipboard'),
        selected = require('sdk/selection'); // Todo: Need to iterate if non-contiguous?
    this.onMessage = function (node, data) {
        var htmlMode = clip.currentFlavors.indexOf('html') > -1,
            flavor = htmlMode ? 'html' : 'text',
            selText = selected.text,
            nodeSel = htmlMode ? node.outerHTML : selText; // node.textContent;
        that.userOnMessage(clip, selText, flavor, data, nodeSel, node, htmlMode); // Last 2 args hopefully not needed with nodeSel and sel/flavor behavior
    };
};


// Todo: Could abstract this inheritance pattern of the next two classes (also instanceof checks)

function CreateSelectionContextMenuItem(config) {
    if (!(this instanceof CreateSelectionContextMenuItem)) {
        return new CreateSelectionContextMenuItem(config);
    }
    this.setConfig(config);
    return this.build();
}
CreateSelectionContextMenuItem.prototype = new BuildSelectionContextMenuItem();

function CreateClipboardContextMenuItem(config) {
    if (!(this instanceof CreateClipboardContextMenuItem)) {
        return new CreateClipboardContextMenuItem(config);
    }
    this.setConfig(config);
    return this.build();
}
CreateClipboardContextMenuItem.prototype = new BuildClipboardContextMenuItem();


// EXPORTS (BUILDERS - for extension)
exports.BuildSelectionContextMenuItem = BuildSelectionContextMenuItem;
exports.BuildClipboardContextMenuItem = BuildClipboardContextMenuItem;
// EXPORTS (CONSTRUCTORS - for usage)
exports.CreateSelectionContextMenuItem = CreateSelectionContextMenuItem;
exports.CreateClipboardContextMenuItem = CreateClipboardContextMenuItem;
