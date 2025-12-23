Fixed #271
    - Bug was caused because Jotai was only getting a static value. It now fetches value from setting.
Other Bug Fixes
    - Username is now extracted correctly. It was being taken from session data, regardless of whether NextAuth was enabled or not.
