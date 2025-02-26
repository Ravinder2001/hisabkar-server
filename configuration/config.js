const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB: {
    USER: process.env.DB_USER,
    HOST: process.env.DB_HOST,
    DATABASE: process.env.DB_NAME,
    PASSWORD: process.env.DB_PASSWORD,
    PORT: process.env.DB_PORT,
    PG_CA_CERT: process.env.PG_CA_CERT,
  },
  JWT: {
    SECRET_KEY: process.env.SECRET,
  },
  CRYPTO: {
    SECRET_KEY: process.env.CRYPTO_SECRET_KEY ?? "",
    IV_KEY: process.env.CRYPTO_IV ?? "",
  },
  NODEMAILER: {
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
  },
  AVATAR_WEBSITE: process.env.AVATAR_WEBSITE,
  VAPID: {
    PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  },
  GOOGLE: {
    GOOGLE_INFO_ENDPOINT: process.env.GOOGLE_USER_INFO_ENDPOINT,
  },
};

module.exports = config;
