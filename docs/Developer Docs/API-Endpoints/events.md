# Events

All API endpoints to get event information.


## events/search

Search events in a calendar.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|calendar_id|ID of calendar to search|Yes|
|search_term|Search term to search in event|Yes|
|type|Type of events to search. Possible values: VTODO, VEVENT|No|



** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|Array of events| 200|true |Search results. Empty array if no event matches search criteria|
|ERROR_NO_ACCESS_TO_CALENDAR|401|false |User doesn't have access to the requested calendar|


---
