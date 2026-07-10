FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023

# Pin Node to a specific major (nodejs20) instead of the unpinned `nodejs` package, whose version
# drifts as the base image updates and previously broke the build (ReferenceError: crypto is not
# defined) with no code change. On Amazon Linux 2023, node + npm for a major come from the
# nodejs<major> and nodejs<major>-npm packages.
RUN dnf -y update \
 && dnf -y install \
    httpd \
    make \
    nodejs20 \
    nodejs20-npm \
 && dnf clean all

RUN mkdir -p /app/client

WORKDIR /app/client

# Copy the lockfile too and use `npm ci` for a reproducible dependency tree (npm install against only
# package.json re-resolves the latest semver-compatible versions on every build).
COPY client/package.json client/package-lock.json /app/client/

RUN npm ci

COPY client /app/client/

RUN npm run build

# Only the built static output is served (from /var/www/html). Remove the build scaffolding —
# node_modules and sources — so the deployed image doesn't carry build/dev dependencies (and the
# vulnerabilities scanners flag in them) that never run in production.
RUN cp -r /app/client/build/* /var/www/html \
 && rm -rf /app/client

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

WORKDIR /var/www/html

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
