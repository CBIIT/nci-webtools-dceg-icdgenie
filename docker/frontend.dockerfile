# Build stage — compile the React app with a pinned Node version. Using the official node image
# (instead of the unpinned `nodejs` package on Amazon Linux, whose version drifts as the base image
# updates) keeps the build toolchain deterministic; the drift previously broke the build with
# "ReferenceError: crypto is not defined" with no code change. The build output is static files, so
# this stage's architecture doesn't matter.
FROM node:20-bookworm-slim AS build

WORKDIR /app/client

# Copy the manifest + lockfile first and use `npm ci` for a reproducible dependency tree (npm install
# against only package.json re-resolves the latest semver-compatible versions on every build).
COPY client/package.json client/package-lock.json /app/client/
RUN npm ci

COPY client /app/client/
RUN npm run build

# Serve stage — Apache on Amazon Linux 2023 serving the pre-built static files.
FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
 && dnf -y install \
    httpd \
 && dnf clean all

COPY --from=build /app/client/build/ /var/www/html/

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

WORKDIR /var/www/html

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
