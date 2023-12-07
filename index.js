const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

const Connection = require("tedious").Connection;
const Request = require("tedious").Request;

const connection = require("./connection");

const utils = require("./utils/index");

const executeStatement = () => {
  const request = new Request(
    "use assignment_2; select * from Supplier",
    (err, rowCount) => {
      if (err) {
        console.log("[REQUEST ERROR]", err);
      } else {
        console.log(`${rowCount} rows`);
      }
      connection.close();
    }
  );

  request.on("row", (columns) => {
    columns.forEach((column) => {
      if (column.value === null) {
        console.log("NULL");
      } else {
        console.log(column.metadata.colName, ":", column.value);
      }
    });
    console.log("------");
  });

  connection.execSql(request);
};

app.use("/orders", require("./api/v1/routes/order.routes"));
app.use("/customers", require("./api/v1/routes/customer.route"));
app.use("/bolts", require("./api/v1/routes/bolt.route"));
app.use("/payments", require("./api/v1/routes/payment.route"));
app.use("/categories", require("./api/v1/routes/category.route"));
app.use("/suppliers", require("./api/v1/routes/supplier.route"));
app.use("/staffs", require("./api/v1/routes/staff.route"));
app.use("/imports", require("./api/v1/routes/import.route"));

app.use("/mock", require("./api/v1/routes/mock.route"));

app.get("/", (req, res) => {
  const connection = require("./connection");
  connection.connect();
  const request = new Request(
    "use assignment_2; select * from Supplier",
    (err, rowCount) => {
      if (err) {
        console.log("[REQUEST ERROR]", err);
      } else {
        console.log(`${rowCount} rows`);
      }
      connection.close();
    }
  );

  connection.execSql(request);
  res.json("hello");
});

app.listen(process.env.PORT, () => {
  console.log("App listening port", process.env.PORT);
});
