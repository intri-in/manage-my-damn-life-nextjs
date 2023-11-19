- Altered Task Editor Behaviour
    - On editing tasks, the change is immediately made to local storage, before request being sent to CalDAV
    - Causes flickering in task renders, but that will have to be resolved later.
    - If the CalDAV change fails, the old version is reverted.
    