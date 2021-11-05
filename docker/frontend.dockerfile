FROM ${FRONTEND_BASE_IMAGE:-oraclelinux:8-slim}

RUN microdnf -y update \
 && microdnf -y module enable nodejs:14 \
 && microdnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
    npm \
 && microdnf clean all

# Add custom httpd configuration
COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

RUN mkdir -p /app/client

WORKDIR /app/client

COPY client/package.json /app/client/

RUN npm install

COPY client /app/client/

RUN npm run build \
 && mv /app/client/dist/icdgenie-client /var/www/html/icdgenie

WORKDIR /var/www/html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/apachectl -DFOREGROUND