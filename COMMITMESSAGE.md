Translation enhancement
- Added a select menu for the user to select desired language.
- Remove browser detection feature added in Pull request #191. Browser detection is choppy, at least in my experience. It's just better to give user an option and save it in localstorage. Removed relevant dependency.
- Moved translations to a file of their own to make it easier to add future translations.