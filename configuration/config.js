const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  jwt: {
    secretKey: process.env.SECRET,
  },
  google: {
    google_client_id: process.env.GOOGLE_CLIENT_ID,
  },
  nodemailer: {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  },
};

module.exports = config;
