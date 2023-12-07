exports.mapRowsToJson = (rows) => {
  const res = rows.map((row) => {
    const obj = {};
    row.forEach((col) => (obj[col.metadata.colName] = col.value));
    return obj;
  });

  return res;
};
