## Adding Calendars to MMDL

MMDL supports the use of Baikal and Nextflow CalDav contents. Although, this may not be "out of the box" due to the default settings of these servers.

### Baikal

In order to use the Baikal server the `Authentication Type` must be changed from 'Digest' to 'Basic'. Without this change, any attempt to log into the Baikal server from MMDL will result in an error that looks like:

```
app-1  | Executing (default): SELECT `users_id`, `username`, `email`, `password`, `created`, `level`, `userhash`, `mobile`, `id`, `expires`, `session_token`, `name`, `email_verified`, `emailVerified`, `image` FROM `users` AS `i` WHERE `i`.`userhash` = '8a03a942b844fd4b88a4405dafc6a9029cb8339cdec869e5b50de695de4d656c96425943af5c8ab0605693fbd6a313d91a1287be837561b5c7fe0a401f1471de' LIMIT 1;
app-1  | =====================
app-1  | Error: Invalid credentials
app-1  |     at async m (.next/server/pages/api/v2/caldav/register.js:1:3331)
app-1  | api/caldav/register client:
app-1  | =====================
```

Now, in MMDL, head to Settings --> Manage CalDav accounts and click 'Add'

'Account Name' is how you want the calendar referenced in MMDL.

'Server Url' is self explanitory and should look something like: `http://{IP or DOMAIN}/dav.php` or `http://{IP or DOMAIN}/cal.php`.

The last to fields are your credentials used to sign into baikal.

On save, it should then give you a view of the calendars associated with that account. Which will now be viewable in the rest of the App.