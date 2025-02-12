const { Client } = require("pg");
const config = require("../configuration/config");

const client = new Client({
  user: config.DB.USER,
  host: config.DB.HOST,
  database: config.DB.DATABASE,
  password: config.DB.PASSWORD,
  port: config.DB.PORT,
  ssl: config.NODE_ENV !== "local",
});

client.on("error", (err) => {
  console.error("PostgreSQL client error:", err);
});

async function initializeDatabase() {
  try {
    await client.connect();
    console.log("Connected to database");
  } catch (err) {
    console.error("PostgreSQL DB connection error:", err);
  }
}

initializeDatabase();

module.exports = {
  query: (text, params) => client.query(text, params),
};
