# Caldav

A quick guide to server API.

## Endpoints


### caldav

Gets all registered CalDAV accounts and calendars.
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

None.

---



### caldav/register

Registers a remote CalDAV account.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|url|URL of CalDav server.|Yes|
|username|Username for CalDav server.|Yes|
|password|Password of CalDav server.|Yes|
|accountname|Account name to identify CalDav server.|Yes|

---

### caldav/calendars

Gets all calendars in CalDAV account that are stored in database.
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|url|URL of CalDav server.|Yes|
|username|Username for CalDav server.|Yes|
|password|Password of CalDav server.|Yes|
|accountname|Account name to identify CalDav server.|Yes|

### caldav/calendars/labels

Return all lables from database. 

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

None


### caldav/calendars/events/all

Get events on particular added CalDAV account from its id.
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|caldav_accounts_id|Account ID of CalDAV account|Yes|
|filter|Filter for type. Possible values: todo, null |No|


### caldav/calendars/events/db/all

Get all events from database..
```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|filter|Filter for type. Possible values: todo, null |No|

