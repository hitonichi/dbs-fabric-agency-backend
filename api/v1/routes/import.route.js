const router = require("express").Router();
const { Request, TYPES } = require("tedious");
const db = require("../../../db");

router.post("/", (req, res) => {
  let getImportInfoQuery = `
  USE ASSIGNMENT_2;
  SELECT 
    ii.I_Category_Code AS Category,
    fc.F_Name,
	  fc.F_Color,
    ii.I_Date AS Date,
    ii.I_Quantity AS Quantity,
    ii.I_Price AS Price,
    s.S_Code AS Supplier_ID,
    s.S_Name AS Supplier_Name,
    sp.SP_Phones AS Supplier_Phones
  FROM Import_Information ii
  INNER JOIN (
    SELECT STRING_AGG(sp.Phone_number, ', ') SP_Phones,
      sp.Supplier_Code
    FROM Supplier_Phone sp
    GROUP BY sp.Supplier_Code
  ) sp
    ON sp.Supplier_Code = ii.I_Supplier_Code
  INNER JOIN Supplier s
    ON s.S_Code = ii.I_Supplier_Code
  INNER JOIN Fabric_Category fc
		ON fc.F_Code = ii.I_Category_Code
  WHERE ii.I_Date BETWEEN @from AND @to
  `;

  const additionalQuery = ` AND ii.I_Supplier_Code = @supplierID`;

  const body = req.body;
  console.log("Checking body supp", body, body.supplier);
  if (!!body.supplier) {
    // When we also filter supplier
    getImportInfoQuery += additionalQuery;
    // getImportInfoQuery.replace("@supplier", body.supplier);
    // res.json({ ...body, hasSup: true });
  } else {
    // When we don't filter supplier
    // res.json(body);
  }
  // getImportInfoQuery += " FOR JSON PATH";
  // getImportInfoQuery.replace("@from", body.from);
  // getImportInfoQuery.replace("@to", body.to);
  // getImportInfoQuery.replace("PATH", body.to);

  console.log("check query", getImportInfoQuery);

  // db.stream(getImportInfoQuery, db.createConnection(), res, "[]");

  const connection = db.createConnection();

  const sqlReq = new Request(getImportInfoQuery, (error, rowCount, rows) => {
    if (error) {
      console.trace(error);
      console.log("sth wrong with request");
      throw error;
    }

    console.log("about to close add connect", rows);
    const resData = [];
    rows.forEach((r) => {
      // Each row is an array of key-val
      const obj = {};
      r.forEach((pair) => {
        obj[pair.metadata.colName] = pair.value;
      });
      resData.push(obj);
    });
    res.status(200).json({
      message: `finit with ${rowCount} `,
      // meta: rows[0][0].metadata,
      data: resData,
    });
    connection && connection.close();
    console.log("Add connection closed");
  });

  sqlReq.addParameter("from", TYPES.Date, body.from);
  sqlReq.addParameter("to", TYPES.Date, body.to);
  if (!!body.supplier) {
    sqlReq.addParameter("supplierID", TYPES.Char, body.supplier);
  }
  connection.on("connect", function (err) {
    if (err) {
      console.trace(err);
      // throw err;
      res.status(500).json({ message: "error from connection" });
    }
    connection.execSql(sqlReq);
  });
  connection.connect();
});

module.exports = router;
