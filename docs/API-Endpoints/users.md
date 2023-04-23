# Users

All API endpoints to get user info and more.


## users/login

Login user.

```
> Method: POST
> Authentication Required: No
```
** Parameters **

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|username|Username|Yes|
|password|Password for the user|Yes|

** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Object with userhash and user ssid |200| true |Sent when the login was successful.|
|INVALID_PASSWORD|401|false |Password or username is invalid.|
|REGISTER_FOR_A_PASSWORD|401|false |Sent if settings don't allow creation of a new user.|


-----------


## users/register

Registers a new user.

```
> Method: POST
> Authentication Required: No
```
** Parameters **

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|username|Username|Yes|
|password|Password for the user|Yes|

** Response **

|Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|USER_INSERT_OK|200| true |Sent when the user was succesfully added.|
|ERROR_LOGIN_WITH_PASSWORD|200|false |User is already registered and should rather log in.|
|CANT_CREATE_USER|401|false |Sent if settings don't allow creation of a new user.|

## users/requestotp

Sends an OTP to user if a valid email is in database.

```
> Method: POST
> Authentication Required: No
```
** Parameters **

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|username|Username|Yes|


** Response **

|Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Object with userhash and reqid|200| true |Sent when OTP to reset password is successfully sent.|
|ERROR_EMAIL_SENDING_FAILED|500|false |Sent when there was some problem sending OTP email. Check server logs for details.|
|ERROR_NO_EMAIL_SET|200|false |No email was set for user, therefore password cannot be reset.|
|ERROR_INVALID_USERNAME|403|false| Username provided isn't present in database.\

--------------


## users/modifypassword

Modifies user password.

```
> Method: POST
> Authentication Required: No
```
** Parameters **

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|userhash|Hash of username|Yes|
|OTP|One time password sent to user's email|Yes|
|reqid|Request id to reset password which was received in users/requestotp response. |Yes|
|password|New userpassword.|Yes|

** Response **

|Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Object with userhash and reqid|200| true |Sent when OTP to reset password is successfully sent.|
|ERROR_EMAIL_SENDING_FAILED|500|false |Sent when there was some problem sending OTP email. Check server logs for details.|
|ERROR_NO_EMAIL_SET|200|false |No email was set for user, therefore password cannot be reset.|
|ERROR_INVALID_USERNAME|403|false| Username provided isn't present in database.\

--------------


## users/info



Gets user info for the logged in user from the database.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters **

None

** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Object with userdata |200| true ||



-----------


