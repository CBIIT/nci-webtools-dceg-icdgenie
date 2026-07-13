FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023

# The import runs entirely through import.sh, which uses only curl + coreutils to bulk-load the
# committed data/*.json files into OpenSearch — there is no Node runtime, npm, or build toolchain in
# the deployed container, which removes the whole class of nodejs/npm-bundle and python findings.
# curl ships in the base image; `dnf update` keeps the OS packages patched.
#
# Cache-bust so OS security patches actually apply on each deploy (see frontend.dockerfile).
ARG CACHEBUST=unset
RUN dnf -y update \
 && dnf clean all

WORKDIR /app/database

# node_modules is excluded via .dockerignore, so only the scripts, data, and import.sh are copied.
COPY database /app/database/

CMD sh import.sh
