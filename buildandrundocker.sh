#!/bin/sh
docker build -t mmdl .
docker run -dp 3000:3000 mmdl