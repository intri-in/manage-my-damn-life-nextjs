# Introduction 

Manage my Damn Life (MMDL) is a self hosted front end for managing your CalDAV tasks and calendars.

**This project is in beta state, so be careful if you're working with production data.**

![Demo](pics/screenRecord.gif)
![Task View](pics/screenshots/TaskView.png "Task View")
![Home](pics/screenshots/HomeView.png "Task View")
![GanttView](pics/screenshots/GanttView.png "Task View")

More screenshots are available in the directory '/docs/pics/screenshots'

## Features

1. Manage your CalDAV tasks.
    - Supports sub tasks.
    - Supports many fields like due, status, description, recurrence, and more
2. Manage calendar events.  
3. Supports multiple CalDAV accounts, and multiple user accounts.
4. View your tasks as a list, in a gantt view, or on a calendar.  
1. Create and manage task filters to view your tasks as you see fit.
1. "Reponsive-ish" view. This is a desktop first project, as multiple clients like JTX Boards, OpenTasks exist for mobile.
1. OAUTH support

### Planned features

1. Support all fields for VTODO and VEVENT as described in [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).
1. More flexible ways to view tasks, and customisable views.
1. Drag and drop capability for tasks
1. Ability to create external plugins.

## Compatibility

This client has been tested with Nextcloud and Baikal.

As of now, it only supports basic authentication, and not OAUTH for CalDAV Accounts. See [here](Feature Guide/AddingCalendars.md)

## Getting Started

To get started, you can checkout installation documentation [here](install/index.md).





