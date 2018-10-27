require("./config/config.js");

const express = require("express");
const bodyParser = require("body-parser");
const mongose = require("mongoose");
const userRouters = require("./routes/user");
//test from mac
mongose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connecte to data base"))
  .catch(() => console.log("Failed to connect to databas"));


const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin , X-Requested-With , Content-Type , Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET , POST , PUT , PATCH , DELETE , OPTIONS"
  );
  next();
});
app.use('/api/user',userRouters);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
