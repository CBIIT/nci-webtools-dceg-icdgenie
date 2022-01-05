function getStatus(database) {
  return database.prepare(`SELECT 1`).pluck().get() == 1;
}

module.exports = {
  getStatus,
};
