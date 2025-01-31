const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB: {
    USER: process.env.DB_USER,
    HOST: process.env.DB_HOST,
    DATABASE: process.env.DB_NAME,
    PASSWORD: process.env.DB_PASSWORD,
    PORT: process.env.DB_PORT,
  },
  JWT: {
    SECRET_KEY: process.env.SECRET,
  },
  NODEMAILER: {
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
  },
  AVATAR_WEBSITE: process.env.AVATAR_WEBSITE,
};

module.exports = config;
