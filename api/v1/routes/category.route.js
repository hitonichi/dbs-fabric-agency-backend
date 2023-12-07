const router = require("express").Router();
const db = require("../../../db");

const getCategoryListQuery = `
  USE ASSIGNMENT_2;
  SELECT fcp.*,
    fc.*,
    s.S_Code,
    s.S_Name
  FROM Fabric_Category_Price fcp
  INNER JOIN (
    SELECT 
      fcp.FCP_Category_Code,
      MAX(fcp.FCP_Date) as FCP_Date
    FROM Fabric_Category_Price fcp
    GROUP BY fcp.FCP_Category_Code
  ) grouped
    ON fcp.FCP_Category_Code = grouped.FCP_Category_Code AND
      fcp.FCP_Date = grouped.FCP_Date
  INNER JOIN Fabric_Category fc
    ON fcp.FCP_Category_Code = fc.F_Code
  INNER JOIN (
    SELECT DISTINCT ii.I_Category_Code, ii.I_Supplier_Code
    FROM Import_Information ii
  ) ii
    ON fc.F_Code = ii.I_Category_Code
  INNER JOIN Supplier s
    ON s.S_Code	 = ii.I_Supplier_Code
  ORDER BY fc.F_Code
  FOR JSON PATH
  ;
`;

router.get("/", (req, res) => {
  db.stream(getCategoryListQuery, db.createConnection(), res, "[]");
});

module.exports = router;
