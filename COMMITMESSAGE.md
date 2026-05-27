Fixed Oauth Bug:
    - Now added capability to refresh access token when it expires. It was causing 401 for Google Calendars.
    - Made necessary changes to database schema.
Added new env variable SEQUELIZE_DEBUG_LOGGING to control logging for sequelize