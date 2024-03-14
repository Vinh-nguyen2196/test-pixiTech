const mysql = require("mysql");
require("dotenv").config();

//local mysql db connection
const dbConn = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.PASSWORD || "",
  database: process.env.DB_DATABASE || "test",
});

dbConn.connect(function (err) {
  if (err) throw err;
  console.log("Database Connectedddddddđ!");

  // tạo bảng lưu coin
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS coin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      coinName VARCHAR(255) NOT NULL,
      mins float NOT NULL,
      price DECIMAL(16,8) NOT NULL,
      closeTime VARCHAR(255) NOT NULL
  )
`;
  dbConn.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating table: ", err);
      return;
    }
    console.log("Table created successfully");
  });
});

module.exports = dbConn;
