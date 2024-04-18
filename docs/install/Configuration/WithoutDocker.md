# Configuration: Setting up .env File

> ⚠️ **Configuration instructions have changed since v0.3.0**

> This guide is useful for installation of v0.3.0 or above. Guide for older versions is available [here](https://manage-my-damn-life-nextjs.readthedocs.io/en/v0.2.0/).


This guide will help you setup MMDL with basic configuration. 

Configuration will be done by making changes to ```.env.local``` file in the root directory.

If you have cloned the git repository, clone the env file.
    
```
cp sample.env.local .env.local
```
If you are running via docker image, or Docker Compose, fetch the ```.env.local.sample``` file as follows:

```
curl https://raw.githubusercontent.com/intri-in/manage-my-damn-life-nextjs/main/sample.env.local >  .env.local
```


## Variables that you absolutely need to change

These are the variables that you need to change for MMDL to function properly. If you're running 


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


### DB_PORT

> Required to Change From Default: **Yes**

Port for your MySQL server.
```
Example:

DB_PORT=3306
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

## Variables that you may need to change

The following variables aren't required for basic functionality, but might be required to be set for some additional features like sending password reset emails.

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

### OAUTH Variables

> Required to Change From Default: **No**

The variables USE_NEXT_AUTH, NEXTAUTH_URL, NEXTAUTH_SECRET, and more are required for OAUTH to work.

Please refer to this [detailed guide](OAuth.md) to set them.

## Additional Variables

There are some additional variables that you don't really need to get into to get a basic setup  running. You can learn more about them [here.](DetailedConfiguration.md)
