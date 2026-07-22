# ---- Builder: compile the React app ----
FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023 AS builder

# Pin Node to a specific major (nodejs20) instead of the unpinned `nodejs` package, whose version
# drifts as the base image updates and previously broke the build (ReferenceError: crypto is not
# defined) with no code change. On Amazon Linux 2023, node + npm for a major come from the
# nodejs<major> and nodejs<major>-npm packages.
RUN dnf -y install \
    make \
    nodejs20 \
    nodejs20-npm \
 && dnf clean all

WORKDIR /app/client

# Copy the lockfile too and use `npm ci` for a reproducible dependency tree (npm install against only
# package.json re-resolves the latest semver-compatible versions on every build).
COPY client/package.json client/package-lock.json /app/client/
RUN npm ci

COPY client /app/client/
RUN npm run build

# ---- Runtime: httpd serving only the static build ----
# The runtime image carries NO Node, npm, or build toolchain — only httpd and the compiled static
# output. This removes the entire class of nodejs / npm-bundle and build-time (python) findings that
# scanners flag inside the toolchain but that never run in production.
FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023

# Cache-bust so OS security patches actually apply on each deploy. Without this the registry build
# cache freezes the `dnf update` layer (its instruction text never changes) and OS packages stay
# pinned at an old build. The deploy workflow feeds CACHEBUST (e.g. the build datetime).
ARG CACHEBUST=unset
RUN dnf -y update \
 && dnf -y install httpd \
 && dnf clean all

COPY --from=builder /app/client/build/ /var/www/html/
COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

WORKDIR /var/www/html

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
