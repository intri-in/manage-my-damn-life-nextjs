# Detailed Configuration

Configuration is done by making changes to .env.local file in the root directory.

First, copy the env file in the root directory.
    
```
cp .env.local.sample .env.local
```

## Variables

### NEXT_PUBLIC_BASE_URL

> Required to Change From Default: **Yes**


This is the base URL for the front end. If you're hosting MMDL with a domain name, point it to your domain. 

```
Example:

NEXT_PUBLIC_BASE_URL="http://example.com/"
```

### NEXT_PUBLIC_API_URL

> Required to Change From Default: **Yes**


This is the base URL API. If you're hosting MMDL, point it to your domain. Note that the trailing slash is required.

```
Example:

NEXT_PUBLIC_BASE_URL="http://example.com/api/"
```

### NEXT_PUBLIC_DEBUG_MODE

> Required to Change From Default: **No**


Enable or disable debug mode. Doesn't do much as of now.


### DB_HOST


> Required to Change From Default: **Yes**

Host for your MySQL database.
```
Example:

DB_HOST=localhost
```


### DB_USER

> Required to Change From Default: **Yes**

Host for your MySQL database.
```
Example:

DB_USER=myuser
```

### DB_PASS

> Required to Change From Default: **Yes**

Password for your MySQL user.
```
Example:

DB_PASS=mypassword
```

### DB_NAME

> Required to Change From Default: **Yes**

Name of your MySQL database.
```
Example:

DB_NAME=dbname
```

### AES_PASSWORD

> Required to Change From Default: **Yes**

This password is used to secure CalDAV account passwords of users. Make sure this is long and secure.

```
Example:

AES_PASSWORD = PASSWORD
```

### SMTP_HOST 

> Required to Change From Default: **No**

Your SMTP host server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**
```
Example:

SMTP_HOST = host
```

### SMTP_USERNAME 

> Required to Change From Default: **No**

Your SMTP username.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_USERNAME = username
```

### SMTP_PASSWORD 

> Required to Change From Default: **No**

Your SMTP password.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_PASSWORD = password
```

### SMTP_FROMEMAIL 

> Required to Change From Default: **No**

From email for your SMTP server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_FROMEMAIL = test@example.com
```

### SMTP_PORT 

> Required to Change From Default: **No**

Port for your SMTP server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_PORT = 25
```

### SMTP_USESECURE 

> Required to Change From Default: **No**

Whether or not to use secure port(TLS/STARTTLS) for SMTP.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_USESECURE = false 
```

### NEXT_PUBLIC_DISABLE_USER_REGISTRATION 

> Required to Change From Default: **No**

Allow users to register. If the value is set to **true**, only one user will be allowed to create an account.


```
Example:

NEXT_PUBLIC_DISABLE_USER_REGISTRATION=false
```

### MAX_CONCURRENT_LOGINS_ALLOWED 
> Required to Change From Default: **No**

Max number of active sessions a user can have. Increase the number if you want the user to be able to login to multiple devices.


```
Example:

MAX_CONCURRENT_LOGINS_ALLOWED=3
```

### MAX_OTP_VALIDITY 
> Required to Change From Default: **No**

The maximum validity of OTP for password reset. The values is in seconds.

```
Example:

MAX_OTP_VALIDITY=1800
```

### MAX_SESSION_LENGTH 
> Required to Change From Default: **No**

The maximum validity of a user session. The values is in seconds. Default value is 30 days.

```
Example:

MAX_SESSION_LENGTH=2592000
```


### ENFORCE_SESSION_TIMEOUT
> Required to Change From Default: **No**

Whether or not to enfore session timeout after MAX_SESSION_LENGTH expires.
```
Example:

ENFORCE_SESSION_TIMEOUT=true
```

### NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR

> Required to Change From Default: **No**

Max number of recursions for finding subtasks. Included so the recursive functions for finding subtasks and rendering them doesn't go haywire.

If subtasks are not being rendered properly, try increasing the value.
```
Example:

NEXT_PUBLIC_SUBTASK_RECURSION_CONTROL_VAR=100
```
### NEXT_PUBLIC_TEST_MODE

> Required to Change From Default: **No**

Used for testing of API and the front end. Please keep it to false if you're not actively developing or testing the build.
```
Example:

NEXT_PUBLIC_TEST_MODE=false
```
### DOCKER_INSTALL
> Required to Change From Default: **Maybe**

Whether the user is running via docker.


```
Example:

NEXT_PUBLIC_TEST_MODE=true
```








