FROM ${BASE_IMAGE:-oraclelinux:8-slim}

RUN microdnf -y update \
 && microdnf -y module enable nodejs:14 \
 && microdnf -y install \
    gcc-c++ \
    make \
    nodejs \
    npm \
 && microdnf clean all 

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
