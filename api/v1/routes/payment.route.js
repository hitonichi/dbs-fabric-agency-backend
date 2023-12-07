const router = require("express").Router();
const db = require("../../../db");

router.get("/:id", (req, res) => {
  const orderID = req.params.id;

  const getPaymentByOrderQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Order_Payment op
  WHERE op.OP_Order_Code = '${orderID}'
  ORDER BY CONCAT(op.OP_Date, ' ', op.OP_Time) DESC
  FOR JSON PATH`;

  db.stream(getPaymentByOrderQuery, db.createConnection(), res, "[]");
});

module.exports = router;
