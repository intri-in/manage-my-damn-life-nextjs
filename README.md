# Introduction 

Manage my Damn Life (MMDL) is a self hosted front end for managing your CalDAV tasks and calendars.

**This project is in beta state, so be careful if you're working with production data.**

![Demo](docs/pics/screenRecord.gif)
![Task View](docs/pics/screenshots/TaskView.png "Task View")
![Home](docs/pics/screenshots/HomeView.png "Home View")
![GanttView](docs/pics/screenshots/GanttView.png "Gantt View")

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
1. [OAUTH support](docs/install/Configuration/OAuth.md)


### Planned features

1. Support all fields for VTODO and VEVENT as described in [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).
1. More flexible ways to view tasks, and customisable views.
1. Drag and drop capability for tasks
1. Ability to create external plugins.

## Compatibility

This client has been tested with Nextcloud, Radicale, and Baikal. MMDL uses "tsdav" library for CalDAV access, so it should support all servers supported by [tsdav](https://tsdav.vercel.app/docs/).

MMDL also supports OAuth authentication for CalDAV Accounts. As of now, Google Calendars is supported. To get started, checkout the guide [here](docs/Feature%20Guide/GoogleCaldav.md)

## Getting Started

To get started, you can checkout installation documentation [here](install/index.md).


## Translation

This project uses [Weblate](https://hosted.weblate.org/projects/mmdl-manage-my-damn-life/) for managing translations.

<a href="https://hosted.weblate.org/engage/mmdl-manage-my-damn-life/">
<img src="https://hosted.weblate.org/widget/mmdl-manage-my-damn-life/multi-auto.svg" alt="Translation status" />
</a>

