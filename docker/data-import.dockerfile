FROM amazonlinux:2022

RUN dnf -y update \
 && dnf -y install curl \
 && dnf clean all

RUN mkdir -p /database

COPY database /database

CMD sh /database/import.sh
