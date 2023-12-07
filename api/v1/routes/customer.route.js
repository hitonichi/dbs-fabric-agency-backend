const router = require("express").Router();
const db = require("../../../db");

const getCustomerQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Customer
  FOR JSON PATH;
`;

router.get("/", (req, res) => {
  db.stream(getCustomerQuery, db.createConnection(), res, "[]");
});

module.exports = router;
