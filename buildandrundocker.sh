#!/bin/sh
docker build -t mmdl .
docker run --env-file .env -dp 3000:3000 mmdl