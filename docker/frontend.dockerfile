FROM ${BASE_IMAGE:-oraclelinux:8-slim}

RUN microdnf -y update \
 && microdnf -y module enable nodejs:14 \
 && microdnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
    npm \
 && microdnf clean all

RUN mkdir -p /app/client

WORKDIR /app/client

COPY client/package.json /app/client/

RUN npm install

COPY client /app/client/

RUN npm run build

ARG APP_PATH=/icdgenie

RUN mkdir -p /var/www/html/${APP_PATH} \
 && cp -r /app/client/build/* /var/www/html/${APP_PATH}

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

WORKDIR /var/www/html

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/apachectl -DFOREGROUND 