# FROM ${BASE_IMAGE:-oraclelinux:8-slim}
FROM quay.io/centos/centos:stream9

RUN dnf -y update \
 && dnf -y install \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/server /app/database /app/logs

WORKDIR /app/server

# use build cache for npm packages
COPY server/package.json /app/server/

RUN npm install

# copy the rest of the application
COPY server /app/server/

# copy the database
COPY database/database.db /app/database/

CMD npm start
