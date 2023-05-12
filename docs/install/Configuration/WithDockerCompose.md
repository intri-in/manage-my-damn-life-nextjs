# Configuration: With Docker Compose

This guide will help you setup MMDL with basic configuration if you want to run MMDL with Docker Compose. 

Copy sample docker compose file.

```
cp docker-compose.yml.sample docker-compose.yml 
```



## Variables that you absolutely need to change

These are the variables that you need to change for MMDL to function properly. If you're running 

### NEXT_PUBLIC_BASE_URL

> Required to Change From Default: **Yes**


This is the base URL for the front end. If you're hosting MMDL with a domain name, point it to your domain. 

```
Example:

NEXT_PUBLIC_BASE_URL:"http://example.com/"
```

### DB_PASS

> Required to Change From Default: **Yes**

Password for your MySQL user.
```
Example:

DB_PASS:mypassword
```

**Note: DB_PASS and [MYSQL_ROOT_PASSWORD](#MYSQL_ROOT_PASSWORD) must be the same.**

### DB_NAME

> Required to Change From Default: **Yes**

Name of your MySQL database.
```
Example:

DB_NAME:dbname
```
**Note: Variable DB_NAME and MYSQL_DATABASE must be the same.**

### AES_PASSWORD

> Required to Change From Default: **Yes**

This password is used to secure CalDAV account passwords of users. Make sure this is long and secure.

```
Example:

AES_PASSWORD : PASSWORD
```

### MYSQL_DATABASE

> Required to Change From Default: **Yes**

This is the name of the database in your new MySQL container.

```
Example:

MYSQL_DATABASE : dbname
```

**Note: Variable DB_NAME and MYSQL_DATABASE must be the same.**

### MYSQL_ROOT_PASSWORD

> Required to Change From Default: **Yes**

Password for your MySQL user on the new docker MySQL which will be created.

```
Example:

MYSQL_ROOT_PASSWORD:root
```

**Note: DB_PASS and MYSQL_ROOT_PASSWORD must be the same.**


## Variables that you may need to change

The following variables aren't required for basic functionality, but might be required to be set for some additional features like sending password reset emails.

### SMTP_HOST 

> Required to Change From Default: **No**

Your SMTP host server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**
```
Example:

SMTP_HOST : host
```

### SMTP_USERNAME 

> Required to Change From Default: **No**

Your SMTP username.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_USERNAME : username
```

### SMTP_PASSWORD 

> Required to Change From Default: **No**

Your SMTP password.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_PASSWORD : password
```

### SMTP_FROMEMAIL 

> Required to Change From Default: **No**

From email for your SMTP server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_FROMEMAIL : test@example.com
```

### SMTP_PORT 

> Required to Change From Default: **No**

Port for your SMTP server.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_PORT : 25
```

### SMTP_USESECURE 

> Required to Change From Default: **No**

Whether or not to use secure port(TLS/STARTTLS) for SMTP.

** Note: SMTP details are used to send emails during password reset. They are not required, but you might end up getting locked out of your account if you lose the password, and the only option in that case would be to manually reset the password in database.**

```
Example:

SMTP_USESECURE : false 
```

## Additional Variables

There are some additional variables that you don't really need to get into to get a basic setup  running. You can learn more about them [here.](DetailedConfiguration.md)