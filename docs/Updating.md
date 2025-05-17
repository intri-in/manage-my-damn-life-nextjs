# Updating

## General Instructions

Procedure to update MMDL will depend on how you've installed it. Depending on the version, some additional steps might need to be taken.

Once you install the new version, by using the following instructions, visit ```example.com/install``` to make changes to the front end.


### If MMDL has been Installed using Github


```
# Pull latest changes
git pull

# Examine the difference in .env file that you have, and if there have been any changes made upstream. Include relevant variables in your file, if required.
diff .env.local sample.env.local

# Install dependencies
npm i 

# Run database migrations
npm run migrate

# Build 
npm run build

# Run
npm run start
```

### If MMDL is Being Run With Docker

Since the variables in .env might have been changed, make the relevant changes to your file. More details can be found [here](install/Docker/index.md).

```docker-compose.yml``` has also changed in v0.3.0. You can find more details [here](install/Docker/index.md).


### Frontend Troubleshooting

MMDL using Dexie database in your browser for data storage. Sometimes, after updating your MMDL version, the browser database may not migrate successfully. To troubleshoot most of the frontend issues after an update:

- Visit the settings page ```accounts/settings```.
- Look for a setting named "Nuke Local Data on Logout?" and flip it on.
- Logout and Log back in.
- Turn this setting off to speed up login time.

## Updating to v0.6.0

### Breaking changes

There are some breaking changing in this version, both at the backend and the front end.

Additionally, some new environment variables must be added to the .env and they must be set before you run this version. They are:

#### DB_DIALECT 
Depending on your database backend, DB_DIALECT can be one of the following:'mysql' | 'postgres' | 'sqlite'.

#### DB_PORT
DB_PORT must specify the port of your database. For Mysql it is usually 3306 and for PostgreSQL it is usually 5433.

## Updating to v0.3.0 from earlier versions

> ⚠️ **Instructions have changed since v0.3.0**

> This guide is useful for installation of v0.3.0 or above. Guide for older versions is available [here](https://manage-my-damn-life-nextjs.readthedocs.io/en/v0.2.0/).


