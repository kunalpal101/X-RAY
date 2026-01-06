const crypto = require("crypto");

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

module.exports = { generateId, now };
