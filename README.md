# append-to-clipboard

A webextensions
([Firefox](https://addons.mozilla.org/en-US/firefox/addon/append-to-clipboard/))
add-on to allow appending to the clipboard, optionally with a single or double
line break in between as well as a "clear clipboard" option.

Note that if the clipboard begins with formatted HTML and you paste the
contents into a text-only environment, the line breaks will be converted
into spaces. To avoid this, consider using
[Copy Plain Text](https://addons.mozilla.org/en-US/firefox/addon/copy-plaintext/)
or
[Copy Plain Text WE](https://addons.mozilla.org/en-US/firefox/addon/copy-plain-text-we/)
when first copying content.

![Screenshot of usage](./screenshots/Screen Shot 2018-03-29 at 5.26.04 PM)

# Todos

1. Add option to retrieve selection for **appending as text or HTML
    or HTMl source (regardless of original source)**
1. Any way with webextensions to support **additional copy flavors**? Could
    support appending multiple images
1. Once Firefox supports, use smoother
    [clipboard API](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/clipboard),
    and, if their webextensions implementation starts to allow for using the
    clipboard in background scripts, do so.
1. Allow appending of **link location or text** (as per
    [this comment of issue #1](https://github.com/brettz9/append-to-clipboard/issues/1#issuecomment-87720293))
1. Allow definition and use of **multiple user-defined separators** (in context
    submenu) (as per issue #1)
1. Allow for appending into (and pasting from) **numbered buffers**
1. **[Key commands](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/commands)**
    for each command slot as in:    
    <https://addons.mozilla.org/en-US/firefox/addon/addmoretexttoclipboard/>;
    allow each to be customizable using <https://github.com/brettz9/key-selector>?
1. Find way for "Clear clipboard" to work, or at least not show up, on
    empty tabs (setting `<all_urls` permission didn't work)
