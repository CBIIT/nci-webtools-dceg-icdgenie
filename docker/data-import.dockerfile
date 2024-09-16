FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    make \
    gcc-c++ \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/database

WORKDIR /app/database

# use build cache for npm packages
COPY database/package.json /app/database/

RUN npm install

# copy the rest of the application
COPY database /app/database/

CMD npm run import
