const { Client } = require("pg");

const config = require("../configuration/config");

let client;

async function initializeDatabase() {
  try {
    if (process.env.NODE_ENV == "local") {
      const { user, host, database, password, port } = config.DB;
      client = new Client({
        user: user,
        host: host,
        database: database,
        password: password,
        port: port,
      });

      // Connection events
      client.on("error", (err) => {
        // Handle the error
        console.error("PostgreSQL client error:", err);
      });
      client
        .connect()
        .then(() => {
          console.log("Connected to database");
        })
        .catch((err) => {
          // Connection error
          console.error("PostgreSQL DB connection error:", err);
        });
    } else {
      console.log("Will do server db setup here");
    }
  } catch (error) {
    console.error("Error on database connection", error.message);
  }
}

// Call the asynchronous function to initialize the database
module.exports = initializeDatabase();

// module.exports = client;
module.exports = {
  query: (text, params) => client.query(text, params),
};
