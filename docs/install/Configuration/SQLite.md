# Configuration: Using SQLite

MMDL supports SQLite as a database backend, in addition to MySQL and PostgreSQL. SQLite needs no separate database server, which makes it a good fit for small or single-user installs.

When using SQLite, only two database variables are used:

| Variable | Value |
| --- | --- |
| `DB_DIALECT` | `sqlite` |
| `DB_NAME` | Path to the SQLite database file. |

`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_PORT`, `DB_CHARSET` and `DB_COLLATE` are ignored. All other variables (for example `AES_PASSWORD`) must still be set as described in the [configuration guide](WithoutDocker.md).

You do not need to create the database file yourself. MMDL creates the file and the tables when you run the installation. The directory that will contain the file must exist, and the user running MMDL must be able to write to it.

## Without Docker

Set the following in your `.env.local` file:

```
DB_DIALECT=sqlite
DB_NAME=/path/to/mmdl.sqlite
```

Then follow the normal [installation guide](../Dockerless/Install.md). When running the migrations, use the SQLite version of the command:

```
npm run migrate-sqlite
```

Alternatively, you can skip this step and open ```http://localhost:3000/install``` in your browser, which runs the migrations for you.

## With Docker Compose

The sample ```docker-compose.yml.sample``` includes a MySQL container. You don't need it for SQLite, so remove the ```db``` service and the ```depends_on``` entry (and ```DB_HOST```) of the ```app``` service. Mount a directory to store the database file:

```
networks:
  app-tier:
    driver: bridge

services:
  app:
    image: intriin/mmdl:latest
    ports:
      - 3000:3000
    volumes:
      - ./data:/app/data
    networks:
      - app-tier
    restart: always
    env_file:
      - .env.local
    extra_hosts:
    - "host.docker.internal:host-gateway"
```

In your `.env.local` file, set:

```
DB_DIALECT=sqlite
DB_NAME=/app/data/mmdl.sqlite
```

`DB_NAME` is a path **inside the container**, so it must be inside the mounted directory.

### Permissions

MMDL runs inside the container as the user `nextjs` (uid `1001`). The mounted directory must be writable by this user, otherwise the installation fails with `SQLITE_CANTOPEN: unable to open database file`. Docker creates missing host directories as `root`, so create the directory yourself and change its owner:

```
mkdir -p data
sudo chown -R 1001:1001 data
```

Mount the whole directory and not just the database file. SQLite also creates temporary files next to the database while it is in use.

## Without Docker Compose (Docker image)

Run the image with the same `.env.local` and a mounted directory:

```
docker run -p 3000:3000 \
  --env-file .env.local \
  -v "$(pwd)/data:/app/data" \
  intriin/mmdl:latest
```

Make sure `DB_NAME` points inside the mounted directory and that the directory is writable by uid `1001`, as described above.

## Finishing the installation

Open ```http://localhost:3000/install``` in your browser to complete the installation.

## Troubleshooting

- **`SQLITE_CANTOPEN: unable to open database file`**: The directory in `DB_NAME` doesn't exist inside the container/host, or it isn't writable by the user running MMDL. See [Permissions](#permissions).
- **Installation fails but there are no errors in the log**: Check the permissions of the database file and its directory first.
