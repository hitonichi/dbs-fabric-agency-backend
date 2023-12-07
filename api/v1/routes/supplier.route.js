const router = require("express").Router();
const { Request, TYPES } = require("tedious");
const db = require("../../../db");
const { parsePhoneNumber } = require("../../../utils/strings");

const getSupplierListQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Supplier
  FOR JSON PATH
  ;
`;

router.get("/", (req, res) => {
  db.stream(getSupplierListQuery, db.createConnection(), res, "[]");
});

router.post("/", (req, res) => {
  // req.json().then((body) => console.log("BODY:", body));
  console.log("REQ", req.body);
  const reqBody = req.body;
  const reqPhones = parsePhoneNumber(req.body.phone);
  console.log("phone from req:", reqPhones);

  // Checking phone number uniqueness
  const getSupplierPhoneListQuery = `
  USE ASSIGNMENT_2;
  SELECT * FROM Supplier_Phone
  `;

  const phones = [];
  const phoneConnection = db.createConnection();

  const phoneReq = new Request(getSupplierPhoneListQuery, function (
    err,
    rowCount,
    rows
  ) {
    if (err) {
      console.trace(err);
      console.log("sth wrong with request");
      throw err;
    }

    // console.log("got phones", rows);
    rows.forEach((r) => {
      // console.log("row:", r[2]);
      phones.push(r[1].value);
    });
    console.log("pushed phones", phones);

    // Check logic here:
    const existedPhone = phones.filter((p) => reqPhones.includes(p));
    console.log("existed match:", existedPhone);

    console.log("about to close connect");
    phoneConnection && phoneConnection.close();
    console.log("Phone connection closed");
  });

  phoneReq.on("done", (rowCount, more, rows) => {
    console.log("got phones", rows);
  });

  phoneConnection.on("connect", function (err) {
    if (err) {
      console.trace(err);
      console.log("sth wrong with connection");
      // throw err;
      // res.status(500).json({ message: "error from phoneConnection" });
    }
    phoneConnection.execSql(phoneReq);
  });
  phoneConnection.connect();

  // -----------------------------------------------------------------
  // Getting New Supplier ID:
  // -----------------------------------------------------------------
  let nextID;
  let curID;
  const getSupplierIDQuery = `
    USE ASSIGNMENT_2;
    SELECT MAX(s.S_Code) FROM Supplier s
    `;

  const IDConnection = db.createConnection();

  const IDReq = new Request(getSupplierIDQuery, function (err, rowCount, rows) {
    if (err) {
      console.trace(err);
      res.status(400).json({ message: "ID request failed" });
    }
    // output.json(rows);
    console.log("got Sup ID rows", rows);
    nextID = getNextID(rows[0][0].value);
    curID = rows[0][0].value;
    console.log("Next ID generated", nextID, typeof nextID);
    console.log("about to close connect");
    IDConnection && IDConnection.close();
    console.log("IDConnection closed");

    // .....................................
    // Adding Supplier - vulnerable
    // const addSupplierQuery = `
    //   USE ASSIGNMENT_2;
    //   Insert Into Supplier(S_Code, S_Name, S_Address, S_Taxcode, S_BankAccount, S_Pstaff_code)
    //   values ('${getNextID(rows[0][0].value)}','${reqBody.name}','${
    //   reqBody.address
    // }','${reqBody.taxCode}','${reqBody.bank}', '${reqBody.staffID}');
    //   ${generatePhoneQuery(reqPhones, getNextID(rows[0][0].value))}
    // `;

    // protected
    const addSupplierQuery = `
      USE ASSIGNMENT_2;
      Insert Into Supplier(S_Code, S_Name, S_Address, S_Taxcode, S_BankAccount, S_Pstaff_code)
      values (@supID, @supName, @address, @taxCode, @bank, @staffID);
      ${generatePhoneQuery(reqPhones, getNextID(rows[0][0].value))}
    `;

    const connection = db.createConnection();
    const sqlRequest = new Request(addSupplierQuery, function (
      err,
      rowCount,
      rows
    ) {
      if (err) {
        console.trace(err);
        res.status(400).json({ message: "Add request failed", err });
      }
      // output.json(rows);
      console.log("about to close add connect");
      res.status(200).json({ message: "finished" });
      connection && connection.close();
      console.log("Add connection closed");
    });

    sqlRequest.addParameter("supID", TYPES.Char, getNextID(rows[0][0].value));
    sqlRequest.addParameter("supName", TYPES.VarChar, reqBody.name);
    sqlRequest.addParameter("address", TYPES.VarChar, reqBody.address);
    sqlRequest.addParameter("taxCode", TYPES.VarChar, reqBody.taxCode);
    sqlRequest.addParameter("bank", TYPES.VarChar, reqBody.bank);
    sqlRequest.addParameter("staffID", TYPES.VarChar, reqBody.staffID);

    sqlRequest.on("done", function (rowCount, more, rows) {
      console.log("got res", rows);
      // res.status(200).json({ hehe: "hehe" });
      // _OnDone(empty, defaultContent, output);
    });

    connection.on("connect", function (err) {
      if (err) {
        console.trace(err);
        // throw err;
        res.status(500).json({ message: "error from connection" });
      }
      connection.execSql(sqlRequest);
    });
    connection.connect();
  });

  IDConnection.on("connect", function (err) {
    if (err) {
      console.trace(err);
      // throw err;
      res.status(500).json({ message: "error from IDConnection" });
    }
    IDConnection.execSql(IDReq);
  });
  IDConnection.connect();
});

module.exports = router;

const getSupplierID = () => {
  const getSupplierIDQuery = `
    USE ASSIGNMENT_2;
    SELECT MAX(s.S_Code) FROM Supplier s
    `;

  const IDConnection = db.createConnection();

  const IDReq = new Request(getSupplierIDQuery, function (err, rowCount, rows) {
    if (err) {
      console.trace(err);
      res.status(400).json({ message: "ID request failed" });
    }
    // output.json(rows);
    console.log("got Sup ID rows", rows);
    console.log("about to close connect");
    IDConnection && IDConnection.close();
    console.log("IDConnection closed");
    return rows[0][0].value;
  });

  IDConnection.on("connect", function (err) {
    if (err) {
      console.trace(err);
      // throw err;
      res.status(500).json({ message: "error from IDConnection" });
    }
    IDConnection.execSql(IDReq);
  });
  IDCconnection.connect();
};

const getNextID = (id) => {
  const newID = `${parseInt(id) + 1}`;
  console.log("parsed newID", newID);
  return newID.padStart(6, "0");
};

const generatePhoneQuery = (phones, id) => {
  console.log("------------ Generating rows");
  let res = ``;
  phones.forEach((p) => {
    res += `
    Insert Into Supplier_Phone(Supplier_Code, Phone_number)
    values ('${id}','${p}');
  `;
  });
  return res;
};
