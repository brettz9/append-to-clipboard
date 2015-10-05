# append-to-clipboard

A restartless
[Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/append-to-clipboard/)
to allow appending to the clipboard, optionally with a single or double
line break in between as well as a "clear clipboard" option.

Note that if the clipboard begins with formatted HTML and you paste the
contents into a text-only environment, the line breaks will be converted
into spaces. To avoid this, consider using
[Copy Plain Text 2](https://addons.mozilla.org/en-US/firefox/addon/copy-plain-text-2/)
when first copying content.

# Todos

1. Allow definition and use of multiple user-defined separators (in context submenu) (as per issue #1)
1. Allow appending of link location or text (as per [this comment of issue #1](https://github.com/brettz9/append-to-clipboard/issues/1#issuecomment-87720293))

# Possible todos

1. As per [this comment](https://ask.mozilla.org/question/443/preserving-line-breaks-when-pasting-formatted-clipboard-to-unformatted/)
I might try avoiding the SDK and supporting additional flavors.
