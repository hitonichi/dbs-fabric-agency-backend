const { Connection } = require("tedious");

const config = {
  server: process.env.SQL_SERVER_SERVER_NAME,
  database: process.env.SQL_SERVER_DATABASE_NAME,
  authentication: {
    type: "default",
    options: {
      userName: process.env.SQL_SERVER_USER_NAME,
      password: process.env.SQL_SERVER_PASSWORD,
    },
  },
  options: {
    // port: 1434,
    trustServerCertificate: true,
  },
};

const connection = new Connection(config);

connection.on("connect", (err) => {
  if (err) {
    console.log("[DB ERROR]", err);
  } else {
    console.log("connected");
    // executeStatement();
  }
});

module.exports = connection;
