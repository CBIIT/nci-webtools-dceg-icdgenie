FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf clean all

RUN mkdir -p /database

WORKDIR /database

COPY database /database

CMD sh /database/import.sh
