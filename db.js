function createConnection() {
  const config = {
    server: process.env.SQL_SERVER_SERVER_NAME,
    database: process.env.SQL_SERVER_DATABASE_NAME,
    authentication: {
      type: "default",
      options: {
        userName: process.env.SQL_SERVER_USER_NAME,
        password: process.env.SQL_SERVER_PASSWORD,
      },
    },
    options: {
      // port: 1434,
      trustServerCertificate: true,
      rowCollectionOnRequestCompletion: true,
    },
  };

  const Connection = require("tedious").Connection;
  const connection = new Connection(config);

  return connection;
}

function createRequest(query, connection, output) {
  console.log("creating request...");
  const Request = require("tedious").Request;
  const req = new Request(query, function (err, rowCount, rows) {
    // const req = new Request("use assignment_2; select * from Supplier", function (
    // err,
    // rowCount
    // ) {
    if (err) {
      console.trace(err);
      throw err;
    }
    // output.json(rows);
    console.log("got rows", rows);
    console.log("about to close connect");
    connection && connection.close();
    console.log("Connection closed");
  });
  return req;
}

function stream(query, connection, output, defaultContent) {
  console.log("running query");
  let request = query;
  if (typeof query == "string") {
    console.log("query is string! creating request");
    request = createRequest(query, connection, output);
  }

  let empty = true;
  // Maybe figuring out this
  request.on("row", function (columns) {
    if (empty) {
      console.log("Response fetched from SQL Database!");
      empty = false;
    }
    columns.forEach((col) => {
      if (col.value) output.write(col.value);
      else output.write("_null_");
      // output.write("\t | ");
    });
    // output.write("\n");
  });

  request.on("done", function (rowCount, more, rows) {
    console.log("got res", rows);
    _OnDone(empty, defaultContent, output);
  });

  request.on("doneProc", function (rowCount, more, rows) {
    console.log("got res from doneProc", rows);
    _OnDone(empty, defaultContent, output);
  });

  executeRequest(request, connection);
}

function _OnDone(empty, defaultContent, output) {
  if (empty) {
    output.write(defaultContent);
    console.log("No results from database - default content is returned.");
  }
  try {
    console.log("Closing Http Response output.");
    output.end();
  } catch (err) {
    console.error(err);
  }
}

function executeRequest(request, connection) {
  connection.on("connect", function (err) {
    if (err) {
      console.trace(err);
      throw err;
    }
    connection.execSql(request);
  });
  connection.connect();
}

module.exports.createConnection = createConnection;
module.exports.createRequest = createRequest;
module.exports.executeRequest = executeRequest;
module.exports.stream = stream;
