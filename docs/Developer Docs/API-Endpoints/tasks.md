# Tasks

All API endpoints for dealing with tasks.

## tasks/rrule/getrepeatobj

Posts the meta key to work with repeating tasks.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|calendar_event_id|Event ID of the repeating task|Yes|



** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Value of meta key "REPEAT_META" | 200|true | |

## tasks/rrule/postrepeatobj

Posts the meta key to work with repeating tasks.

```
> Method: POST
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|calendar_event_id|Event ID of the repeating task|Yes|
|value|Value of the meta property "REPEAT_META"|Yes|




** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|null | 202|true | Returned when user is insert of the value is accepted.|


---


