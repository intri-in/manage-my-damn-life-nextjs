# Admin

All API endpoints for dealing with admin settings.

## admin/getusers

Gets all registered users. 
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

None





** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Object with user data | 200|true ||


---

## admin/deleteuser

Delete user, except admin. Removes all active sessions too.

```
> Method: DELETE
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|userid|ID of the user to delete|Yes|






** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|null | 200|true | Returned when user is deleted.|
|CANT_DELETE_ADMIN |405|false | Returned when an admin account is the one targeted to be deleted.|
|ONLY_ADMIN_CAN_DELETE_USER |401|false | Only admin can delete other users.|


---


