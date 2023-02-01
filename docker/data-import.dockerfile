FROM amazonlinux:2022

RUN dnf -y update \
 && dnf clean all

RUN mkdir -p /database

COPY database /database

CMD sh /database/import.sh
