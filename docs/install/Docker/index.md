# Installation with Docker

If you want to run MMDL in a docker container, you have two options:

1. [Run with Docker Compose](#with-docker-compose)
2. [Run with a Docker Image](#without-docker-compose)

## With Docker Compose
> ⚠️ **Installation instructions have changed since v0.3.0**

Visit the repository, and download the ```docker-compose.yml.sample` file from Github.

```
https://github.com/intri-in/manage-my-damn-life-nextjs.git
```

Copy sample compose file.

```
cp docker-compose.yml.sample docker-compose.yml 
```

You can make changes to docker compose file using the [Configuration](../Configuration/WithDockerCompose.md) guide as a help. 

After making the required changed, run:

```
docker compose up
```

Docker compose will start two containers : one with MMDL, and one with MySQL.
MMDL should be now up and running. 


Open your browser and go to ```http://localhost:3000/install``` to start the installation process.


## Without Docker Compose

### Fetch the image.

Get the latest docker image

```
docker pull intriin/mmdl:latest
```

### Configuration
Docker image of MMDL needs some configuration to run.

You can get a sample configuration file from the github repository.


```
curl https://raw.githubusercontent.com/intri-in/manage-my-damn-life-nextjs/main/sample.env.local > .env.local
```

Make changes to it, using the [Configuration](../Configuration/WithoutDocker.md) guide as a help. The most important settings are the database settings.

#### Database Configuration

MMDL uses a database to store user data. You can either use an existing database, or run a new container of MySQL.

If you choose to use your MySQL without docker, just set the values of DB_HOST, DB_USER, DB_PASS, and DB_NAME in the **.env.local** file you just downloaded.

If you need a basic guide to run a MySQL container, you can read one [here](../Supplementary/RunMySQLDocker.md).

### Run the MMDL Docker Container

All previous steps completed, you can now spin up the docker container for MMDL.

```
docker run --env-file .env.local -dp 3000:3000 intriin/mmdl
```

Open your browser and go to ```http://localhost:3000/install``` to start the installation process.

