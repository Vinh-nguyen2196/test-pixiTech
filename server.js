const express = require("express");
require("dotenv").config();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const db = require("./config/connection");
const axios = require("axios");
const dbConn = require("./config/connection");
const schedule = require("node-schedule");

// create express app
const app = express();

// Setup server port
const port = process.env.PORT || 5000;
const COIN = process.env.COIN || "BTC";

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// Cập nhật giá coin
app.post("/api/data", async (req, res) => {
  try {
    const query = `SELECT * FROM coin WHERE coinName='${COIN}'`;
    const response = await axios.get(
      "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT"
    );
    let { mins, price, closeTime } = response.data;
    dbConn.query(query, (err, results) => {
      if (err) {
        console.error("Error querying MySQL database: ", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      price = parseFloat(price);
      if (results.length > 0) {
        // Coin đã tồn tại, cập nhật giá
        const updateQuery = `UPDATE coin SET mins = ${mins}, price = ${price}, closeTime = ${closeTime} WHERE coinName = '${COIN}'`;
        dbConn.query(updateQuery, (err, updateResult) => {
          if (err) {
            console.error("Error updating coin: ", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          res.send("Coin updated successfully");
        });
      } else {
        // Coin chưa tồn tại, tạo mới
        const insertQuery = `INSERT INTO coin (coinName, mins, price,closeTime) VALUES ('${COIN}', ${mins}, ${price}, ${closeTime})`;
        dbConn.query(insertQuery, (err, insertResult) => {
          if (err) {
            console.error("Error inserting coin: ", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          res.send("Coin created successfully");
        });
      }
    });
  } catch (error) {
    console.error("Error fetching data from API: ", error);
    // Trả về lỗi nếu có vấn đề xảy ra
    res.status(500).send("Internal Server Error");
  }
});

//Lấy giá coin
app.get("/api/data", async (req, res) => {
  try {
    const query = `SELECT * FROM coin WHERE coinName='${COIN}'`;
    dbConn.query(query, (err, results) => {
      if (results) {
        res.json({
          data: results,
        });
      }
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

const job = schedule.scheduleJob("*/1 * * * *", async () => {
  try {
    // Thực hiện cuộc gọi API
    await axios.post(`http://localhost:${port}/api/data`);
    console.log("API called successfully");
    return "Success";
  } catch (error) {
    console.error("Error calling API: ", error);
  }
});

// listen for requests

//Yêu cầu đề bài không ghi rõ là có cần lưu lại lịch sử giá coin hay k nên em chỉ dùng 1 bản ghi

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
