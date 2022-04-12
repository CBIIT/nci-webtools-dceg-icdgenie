# FROM ${BASE_IMAGE:-oraclelinux:8-slim}
FROM quay.io/centos/centos:stream9

RUN dnf -y update \
 && dnf -y install \
    httpd \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/client

WORKDIR /app/client

COPY client/package.json /app/client/

RUN npm install

COPY client /app/client/

RUN npm run build

RUN cp -r /app/client/build/* /var/www/html

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

WORKDIR /var/www/html

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND 