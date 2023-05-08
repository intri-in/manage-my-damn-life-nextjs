# Settings

All API endpoints for dealing with settings.

## settings/get

Gets all settings keys from database. If the user is admin, gets the global settings too.
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

None





** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|User settings object with user and global settings {user: {}, admin:{}}| 200|true ||


---

## settings/getone

Gets one setting key from database.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|name|Name of the key required|Yes|





** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Value of the key| 200|true ||
|ONLY_ADMIN_CAN_REQUEST_GLOBAL|401|false |Sent when any user other than admin requests a GLOBAL (admin level) setting.|

---

## settings/modify

Modifies a setting.

```
> Method: POST
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|name|Name of the key to modify|Yes|
|value|New value of the key|Yes|




** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|null| 200|true |Sent when key is modified.|
|ONLY_ADMIN_CAN_SET_GLOBAL| 401|false |Sent when any user other than admin tries to modify a GLOBAL (admin level) setting.|

