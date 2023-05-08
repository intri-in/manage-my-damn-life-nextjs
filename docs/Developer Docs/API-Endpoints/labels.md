# Labels

All API endpoints to interact with labels.


## labels/modifycolor

Modify colour of the label for the current user.

```
> Method: POST
> Authentication Required: Yes
```
** Parameters**

| Parameter | Description | Required |
| ----------- | ----------- |  ----------- |
|labelname|Name of the label to modify|Yes|
|colour|New colour of label|Yes|




** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|LABEL_UPDATED| 200|true |Label was successfully modified.|





---

## labels/updatecache

Updates lable cache in database. Searches for all labels for all events across added by the user.

```
> Method: GET
> Authentication Required: Yes
```
** Parameters**

None



** Response **

| Message | HTTP Status | Success | Description |  
| ----------- | ----------- |  ----------- |----------- |
|LABELS_UPDATED| 200|true |Label cache updated.|



---
