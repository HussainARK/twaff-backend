if (process.env.NODE_ENV !== "production") require("dotenv").config();

const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
});

module.exports = pool;
