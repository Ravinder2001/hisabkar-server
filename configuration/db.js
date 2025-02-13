const { Client } = require("pg");
const config = require("../configuration/config");

const isProduction = process.env.NODE_ENV === "prod";

const clientConfig = {
  user: config.DB.USER,
  host: config.DB.HOST,
  database: config.DB.DATABASE,
  password: config.DB.PASSWORD,
  port: config.DB.PORT,
};

if (isProduction && process.env.PG_CA_CERT) {
  const pem = Buffer.from(process.env.PG_CA_CERT, "base64").toString("utf-8");
  clientConfig.ssl = {
    rejectUnauthorized: true,
    ca: pem,
  };
}

const client = new Client(clientConfig);

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
