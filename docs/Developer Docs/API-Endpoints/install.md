# Install

All API endpoints for dealing with installation.

## install/check

Check if MMDL has been installed.
 
```
> Method: GET
> Authentication Required: No
```
** Parameters**

None





** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|null | 200|true |Returned if installed.|
|null | 200|false |Returned if not completely installed.|

---

## install/go

Installs MMDL's backend database and tables.


```
> Method: GET
> Authentication Required: No
```
** Parameters**

None


** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Node-mysql's response of create/alter table query | 200|true | Returned when install finishes.|
|ERROR_MMDL_ALREADY_INSTALLED |409|false | Returned when MMDL is already installed.|



---


