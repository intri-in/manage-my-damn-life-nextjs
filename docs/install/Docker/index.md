# Installation with Docker


## With Docker Compose

Pull the repository, or download latest release from Github.

```
git clone https://github.com/intri-in/manage-my-damn-life-nextjs.git
```

Copy sample compose file.

```
cp docker-compose.yml.sample docker-compose.yml 
```

You can make changes to docker compose file using the [Configuration](../Dockerless/Configuration) guide as a help. If you're just running locally, no configuration is required.

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
docker pull intriin/mmdl
```

### Configuration
Docker image of MMDL needs some configuration to run.

You can get a sample configuration file from the github repository.

```
curl https://raw.githubusercontent.com/intri-in/manage-my-damn-life-nextjs/main/sample.env.local.docker > .env.local
```

Make changes to it, using the [Configuration](../Dockerless/Configuration) guide as a help. The most important settings are the database settings.

#### Database Configuration

MMDL uses a MySQL database to store user data. You can either use an existing database, or run a new container of MySQL.

If you choose to use your MySQL without docker, just set the values of DB_HOST, DB_USER, DB_PASS, and DB_NAME in the **.env.local** file you just downloaded.

##### Run a docker container for MySQL 

If you want to start a container for MySQL, you can run

```
docker run -itd  --name mysql  -e MYSQL_ROOT_PASSWORD=123456 mysql --default-authentication-plugin=mysql_native_password
```
This will create a docker container of MySQL with a name **mysql**, user name **root**, and password **123456**.

But that's not all. We need to get the IP of the docker instance.

Use ``` docker ps ``` to get the current running docker container, and find the container ID of the **mysql** container that you just created.

To get the IP, run the following command.
```
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' CONTAINER-ID-OF-MYSQL-CONTAINER
```

Get the IP address from the output.

Now edit the **.env.local** file you downloaded, and the "Database Variables" section will look like:

```
## Database variables.
DB_HOST=IP.FROM.PREVIOUS.STEP
DB_USER=root
DB_PASS=123456
DB_NAME=dbname_you_want
```

In case you want to log into your new dockerised MySQL, you can run:

```
docker exec -it mysql mysql -u root -p123456
```


### Run the MMDL Docker Container

All previous steps completed, you can now spin up the docker container for MMDL.

```
docker run --env-file .env.local -dp 3000:3000 intriin/mmdl
```

Open your browser and go to ```http://localhost:3000/install``` to start the installation process.

