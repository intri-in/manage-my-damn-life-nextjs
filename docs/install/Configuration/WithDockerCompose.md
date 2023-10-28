# Configuration: With Docker Compose

This guide will help you setup MMDL with basic configuration if you want to run MMDL with Docker Compose. 

> ⚠️ **Configuration instructions have changed since v0.3.0**

> This guide is useful for installation of v0.3.0 or above. Guide for older versions is available [here](https://manage-my-damn-life-nextjs.readthedocs.io/en/v0.2.0/).

**MMDL no longer needs you to provide most of the environment variables in the ```docker-compose.yml``` file. You can instead reference a ```.env.local``` file in ```docker-compose.yml```.**

Configuration with Docker Compose will be required in two parts:

1. [Changing ```docker-compose.yml``` file.](#changing-docker-compose-configuration)
2. [Creating and setting up a ```.env.local``` file.](#configuring-env)


## Changing Docker Compose Configuration

Copy sample docker compose file.

```
cp docker-compose.yml.sample docker-compose.yml 
```



## Variables that you need to change

These are the variables that you need to change for MMDL to function properly. 

### env_file:

> Required to Change From Default: **Maybe**


This is the name of the file with your environment variables. Path is relative to the ```docker-compose.yml``` file. To learn more about creating a .env.local file, you can refer to the [guide here](WithoutDocker.md). 


### MYSQL_DATABASE

> Required to Change From Default: **Yes**

This is the name of the database in your new MySQL container. 

```
Example:

MYSQL_DATABASE : dbname
```
### MYSQL_USER
> Required to Change From Default: **Yes**

This is the name of the user in your new MySQL container. 

```
Example:

MYSQL_USER : myuser
```

**Note: Variable DB_USER in your .env file and MYSQL_USER in docker-compose.yml must be the same.**

### MYSQL_PASSWORD
> Required to Change From Default: **Yes**

This is the password of the user in your new MySQL container. 

```
Example:

MYSQL_PASSWORD : mypassword
```

**Note: Variable DB_PASS in your .env file and MYSQL_PASSWORD in docker-compose.yml must be the same.**


### MYSQL_ROOT_PASSWORD

> Required to Change From Default: **Maybe**

Password for your root user on the new docker container MySQL which will be created.

```
Example:

MYSQL_ROOT_PASSWORD:root
```

**Note: DB_PASS in your .env file and MYSQL_ROOT_PASSWORD in docker-compose.yml must be the same if you plan on using the root user.**



## Configuring .env

Now that your ```docker-compose.yml``` is ready you can go ahead and setup a ```.env.local``` file. To learn more, visit [this guide](WithoutDocker.md).
