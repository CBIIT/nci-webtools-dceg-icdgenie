FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    make \
    gcc-c++ \
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
