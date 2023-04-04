# CHANGES for `append-to-clipboard`

## 2.3.2

- fix: issue with build

## 2.3.1

- fix: issue with build

## 2.3.0

- refactor: Manifest v3

## 2.2.3

- Security fix: Escape backslashes (courtesy @lgtmco)
- Refactoring: Use new Jamilih API, object shorthand
- Refactoring: Resume using ES6 module import
- Linting (ESLint): Override "standard"'s new object-curly-spacing rule
- Linting (LGTM): Avoid error for "useless expression" (`executeScript`
    actually gets the return value, so it is useful in our situation)
- npm: Add `copy` script
- npm: Update devDeps and copied files

## 2.2.2

- Revert to non-ES6 module import due to
    [Firefox add-on linter issue](https://github.com/mozilla/addons-linter/issues/1775)

## 2.2.1

- Fix: Include `manifest.json` version update

## 2.2.0

- Enhancement: Support appending link text or location (or
    both for `text/html` format)

## 2.1.0

- Enhancement: Support appending from textareas/input
- Enhancement: Add disabling code for any users disabling add-on
- npm: Add ignore file to minimize npm package size
- npm: Update devDeps
- Yarn: Add `yarn.lock`

## 2.0.0

- webextensions (and Chrome) support
- License: Rename license file to reflect type (MIT)
- Linting: Markdown, ESLint
- Docs: Update Copy Link Text references and to-dos

## 1.1.0
- Add support for private window browsing

## 1.0.1
- jpm packaging

## 1.0.0
- Fix bug with "null" being added when append is used with an empty clipboard
- Feature: Add optional "Clear clipboard" menu item

## 0.1.1
- Internationalize

## 0.1.0
- Updated to SDK 1.16 and updated deprecated APIs
