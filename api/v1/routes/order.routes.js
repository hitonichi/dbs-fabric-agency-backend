const router = require("express").Router();
const db = require("../../../db");

const getOrderListQuery = `
  USE ASSIGNMENT_2;
  SELECT
    os.OS_Code,
    os.OS_Status,
    os.OS_Cancel_Reason,
    grouped.OS_Timestamp,
    oc.O_Total_Price,
    CONCAT(c.C_FName, ' ', c.C_LName) as C_Customer_Name,
    CONCAT(e.E_FName, ' ', e.E_LName) as C_Staff_Name,
    c.C_Code
  FROM Order_Status os
  INNER JOIN (
    SELECT 
      os.OS_Code, 
      MAX(CONCAT(os.OS_Date, ' ', os.OS_Time)) as OS_Timestamp
    FROM Order_Status os
    INNER JOIN Order_Customer oc
      ON os.OS_Code = oc.O_Code
    GROUP BY os.OS_Code
  ) grouped
    ON os.OS_Code = grouped.OS_Code
  INNER JOIN Order_Customer oc
    ON oc.O_Code = os.OS_Code
  INNER JOIN Employee e
    ON oc.O_Ostaff_code = e.E_Code
  INNER JOIN Customer c
    ON oc.O_Customer_Code = c.C_Code
  WHERE 
    os.OS_Code = grouped.OS_Code AND
    CONCAT(os.OS_Date, ' ', os.OS_Time) = grouped.OS_Timestamp
  FOR JSON PATH
  ;
`;

router.get("/", (req, res) => {
  db.stream(getOrderListQuery, db.createConnection(), res, "[]");
});

// router.get("/:id", (req, res) => {
//   const orderID = req.params.id;

//   const getOrderQuery = `
//   USE ASSIGNMENT_2;
//   SELECT
//     os.OS_Code,
//     os.OS_Status,
//     grouped.OS_Timestamp,
//     oc.O_Total_Price,
//     CONCAT(c.C_FName, ' ', c.C_LName) as C_Customer_Name,
//     CONCAT(e.E_FName, ' ', e.E_LName) as C_Staff_Name,
//     c.C_Code
//   FROM Order_Status os
//   INNER JOIN (
//     SELECT
//       os.OS_Code,
//       MAX(CONCAT(os.OS_Date, ' ', os.OS_Time)) as OS_Timestamp
//     FROM Order_Status os
//     INNER JOIN Order_Customer oc
//       ON os.OS_Code = oc.O_Code
//     GROUP BY os.OS_Code
//   ) grouped
//     ON os.OS_Code = grouped.OS_Code
//   INNER JOIN Order_Customer oc
//     ON oc.O_Code = os.OS_Code
//   INNER JOIN Employee e
//     ON oc.O_Ostaff_code = e.E_Code
//   INNER JOIN Customer c
//     ON oc.O_Customer_Code = c.C_Code
//   WHERE
//     os.OS_Code = grouped.OS_Code AND
//     CONCAT(os.OS_Date, ' ', os.OS_Time) = grouped.OS_Timestamp
//     oc.O_Code = ${orderID}
//   FOR JSON PATH
//   ;
// `;

//   db.stream(getOrderQuery, db.createConnection(), res, "[]");
// });

module.exports = router;
