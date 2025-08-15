## Troubleshooting

As with any selfhosted project, troubleshooting can be more complicated than expected. So here are some notes.

### I keep running into the same errors when restarting the containers!

In cases where you are restarting the containers between making changes to the env values you should delete the container (the image will still be cached so it won't be downloaded again). Some changes effect the container it self and so you need to wipe the slate clean.

Stop the container in question and then run:

```
sudo docker container prune
```

Now try running the container again with the updated environment values.

### The database is complaining and then crashing!

Currently, MMDL uses the library `mysql2` which doesn't support Mysql versions > 9 to fix this you need to update the docker-compose.yaml from:

```
  db:
    image: mysql
    command: --default-authentication-plugin=mysql_native_password
```

to:

```
  db:
    image: mysql:8.4
    command: --mysql-native-password=ON
```

This can also be worked around by using another db type as MMDL suppots 'mysql', 'postgres' and 'sqlite'.

This issue is a point of future developement, see GitHub issues [#241](https://github.com/intri-in/manage-my-damn-life-nextjs/issues/241), [#231](https://github.com/intri-in/manage-my-damn-life-nextjs/issues/231) and [#251](https://github.com/intri-in/manage-my-damn-life-nextjs/issues/251) for more details.