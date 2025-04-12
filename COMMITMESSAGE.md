v0.6.0
- Fixed deleteExtraEventsFromDexie function being called on each array iteration in saveAPIEventReponseToDexie
- Changes to dexie db structure!
- Improved rendering:
    - Now uses stored parent data, rather than looping over the tasks.
- Added a way to view RAW ICS data in both TaskEditor and Event Editor
- Now has a user table in dexie
 - Manages mutiple user locally
 - Removed the default feature of Nuking Dexie on logout. Now the user can set it in Settings.
 - Made login setup a bit more smoother -- if the user has saved data, the setup page doesn't wait for sync.