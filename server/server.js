require("./config/config.js");

const express = require("express");
const bodyParser = require("body-parser");
const mongose = require("mongoose");
const userRouters = require("./routes/user");

mongose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connecte to data base"))
  .catch(() => console.log("Failed to connect to databas"));


const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/api/user',userRouters);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
