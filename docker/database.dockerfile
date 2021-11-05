FROM ${DATABASE_BASE_IMAGE:-oraclelinux:8-slim}

RUN microdnf -y update \
 && microdnf -y module enable nodejs:14 \
 && microdnf -y install \
    gcc-c++ \
    make \
    nodejs \
    npm \
 && microdnf clean all 

RUN mkdir -p /app/database /app/logs

WORKDIR /app/database

# use build cache for npm packages
COPY database/package*.json /app/database/

RUN npm install

# copy the rest of the application
COPY database /app/database/

CMD npm start
