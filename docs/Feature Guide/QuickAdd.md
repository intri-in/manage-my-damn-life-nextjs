# Quick Add

To make it quicker to add tasks,  we have a quick add syntax that you can use to assign a due date, labels, or priority to a task.

These will be only triggered if you try to add tasks via add task bar.

**Examples:**

```
// Task will be due today at 4:07PM, and will have a priority of 3, and labels "New" and "Focus"
Mow the lawn @:today 16:07 !:3 #:New #:Focus 

// Task will be due tomorrow at 11:59PM, and will have a label of "maybe"
Take out the trash @:tomorrow #:maybe  

// Task will be due on Jan 01, 2024 
Throw up @:2024-01-01   

```

## Due Date

> Syntax: **@:date**


To quick assign a due date, you can use the operator ```@:``` followed by a date or "today" or "tomorrow". You can follow this up with a time (HH:mm 24hr format) to assign a due time.


**Examples:**

```
// Task will be due today at 4:07PM
@:today 16:07 

// Task will be due tomorrow at 11:59PM
@:tomorrow  

// Task will due on April 22, 2023 at 11:59PM
@:22/04/23 

// Task will due on Sept 17, 2023 at 04:03AM.
@:09/17/23 4:3 
```

**Recognised Date Formats**

The following date formats are recognised.
```
    "MM/DD/YYYY"
    "M/D/YYYY"
    "M/D/YY"                          
    "MM/DD/YY"
    "DD/MM/YY"
    "D/M/YYYY"
    "DD/MM/YYYY"
    "D/M/YY"
    "YYYY-MM-DD"
    "YYYY/MM/DD"
```

For time, only 24hr format is recognised.

## Priority

> Syntax: **!:priority**


To quick assign a priority, you can use the operator ```!:``` followed by priority, which has to be a number ranging from 1-10, where 1 denotes the highest priority, and 10 the lowest.

**Examples:**

```
// Task will have a priority of 2 (high)
!:2 

// Task will have a priority of 8 (low)
!:8
```

## Labels

> Syntax: **#:label**


To quick assign a label, you can use the operator ```#:``` followed by a label/category.

This can be used to assign multiple labels.

**Examples:**

```
// Assign a label "Important" 
#:Important

// Assign mutiple labels 
#:Important #:InProgress
```