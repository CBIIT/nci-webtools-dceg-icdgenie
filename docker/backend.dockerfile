# ---- Builder: install production deps + compile the better-sqlite3 native addon ----
FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023 AS builder

# Pin nodejs20 (was the unpinned `nodejs`, which resolves to the near-EOL node18 and drifts). The
# runtime stage below installs the same major so the better-sqlite3 native ABI stays compatible.
# python3/make/gcc-c++ are here only in case better-sqlite3 has to compile from source (node-gyp);
# none of them ship in the runtime image.
RUN dnf -y install \
    make \
    gcc-c++ \
    python3 \
    nodejs20 \
    nodejs20-npm \
 && dnf clean all

WORKDIR /app/server

# Copy the lockfile too and use `npm ci` for a reproducible tree. --omit=dev drops jest/supertest,
# which are the only source of the jsdom / formidable / @tootallnate/once findings — none of them
# run in production.
COPY server/package.json server/package-lock.json /app/server/
RUN npm ci --omit=dev

COPY server /app/server/

# ---- Runtime: Node only — npm and build toolchain excluded ----
# nodejs20-npm is only a weak (Recommends) dependency of nodejs20, and the npm CLI bundles its own
# vulnerable deps (tar, minimatch, glob, brace-expansion, sigstore, ip-address, diff) — the bulk of
# the scanner findings. We never run npm at runtime (the app's node_modules are copied from the
# builder and started via `node`), so --setopt=install_weak_deps=False drops npm entirely. python3
# stays — it is a hard dependency of dnf in the base image and is covered by a scan waiver.
FROM --platform=linux/amd64 public.ecr.aws/amazonlinux/amazonlinux:2023

# Cache-bust so OS security patches actually apply on each deploy (see frontend.dockerfile).
ARG CACHEBUST=unset
RUN dnf -y update \
 && dnf -y install --setopt=install_weak_deps=False nodejs20 \
 && dnf clean all

RUN mkdir -p /app/server /app/database /app/logs

WORKDIR /app/server

# Bring over the already-installed app (including node_modules with the compiled better-sqlite3).
COPY --from=builder /app/server /app/server

# copy the database
COPY database/database.db /app/database/

# Run node directly — npm is intentionally not installed in this stage.
CMD ["node", "--require", "dotenv/config", "server.js"]
