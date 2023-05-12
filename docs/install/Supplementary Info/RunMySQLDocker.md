# Run a docker container for MySQL 
MMDL uses a MySQL database to store user data. You can either use an existing database, or run a new container of MySQL.

This basic guide will help you get started with setting up a MySQL Docker container.

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

To use this database in MMDL, you will need to change the **.env.local** file and make the "Database Variables" section will look like:

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

