const { Client } = require("@opensearch-project/opensearch");
const { ADMIN, PASSWORD, DOMAIN } = process.env;

// A single shared OpenSearch client, reused across requests. Creating a new Client per request (as
// search.js / batch.js still do) opens a fresh connection pool each time; under fan-out — e.g. a
// batch translate of thousands of codes — that exhausts sockets/file descriptors and requests start
// failing with EAGAIN. Constructing one client here and importing it keeps a bounded, reused pool.
//
// Credentials are passed via `auth` rather than interpolated into the node URL so that special
// characters in the password (e.g. "@" or ":") can't corrupt the URL.
const client = new Client({
  node: `https://${DOMAIN}`,
  auth: {
    username: ADMIN,
    password: PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = { client };
