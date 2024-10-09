const dev = {
  app: {
    port: process.env.APP_PORT_DEV || 3001,
  },
  db: {
    host: process.env.DB_HOST_DEV || "localhost",
    port: process.env.DB_PORT_DEV || 27017,
    name: process.env.DB_NAME_DEV || "kltn-dev",
  },
};

const pro = {
  app: {
    port: process.env.APP_PORT_PROD || 3000,
  },
  db: {
    host: process.env.DB_HOST_PROD || "localhost",
    port: process.env.DB_PORT_PROD || 27017,
    name: process.env.DB_NAME_PROD || "kltn-prod",
  },
};

const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];
