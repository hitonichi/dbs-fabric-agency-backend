const router = require("express").Router();
const db = require("../../../db");

router.get("/partner", (req, res) => {
  const getOpStaffRequest = `
  USE ASSIGNMENT_2;
  SELECT * FROM Employee e
    WHERE e.E_Type = 'Partner staff'
  FOR JSON PATH
  ;
`;

  db.stream(getOpStaffRequest, db.createConnection(), res, "[]");
});

module.exports = router;
