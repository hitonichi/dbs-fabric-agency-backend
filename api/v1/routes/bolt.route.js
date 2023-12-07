const router = require("express").Router();
const db = require("../../../db");

getBoltByOrderQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Customer
  FOR JSON PATH;
`;

router.get("/:id", (req, res) => {
  const orderID = req.params.id;

  const getBoltByOrderQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Order_Bolt ob
  INNER JOIN Bolt b
    ON ob.OB_Bolt_Code = b.B_Code AND ob.OB_Category_Code = b.B_Category_Code
  INNER JOIN Fabric_Category fc
      ON ob.OB_Category_Code = fc.F_Code
  INNER JOIN Fabric_Category_Price fcp
    ON fcp.FCP_Category_Code = fc.F_Code
  WHERE ob.OB_Order_Code = '${orderID}'
  ORDER BY fc.F_Code
  FOR JSON PATH`;

  db.stream(getBoltByOrderQuery, db.createConnection(), res, "[]");
});

module.exports = router;
