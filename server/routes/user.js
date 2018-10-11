const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const _ = require("lodash");

const { authenticate } = require("../middleware/authenticate");

const router = express();

router.post("/signup", (req, res) => {
  var body = _.pick(req.body, [
    "email",
    "password",
    "firstName",
    "lastName",
    "userName",
    "phoneNumber"
  ]);
  const user = new User(body);
  console.log(user);
  user
    .save()
    .then(result => {
      res.json(_.pick(user, ["_id", "userName", "email"]));
    })
    .catch(error => {
      return res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  var body = _.pick(req.body, ["userName", "password"]);
  User.findByCredentials(body.userName, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(error => {
      return res.status(401).json(error);
    });
});

router.delete("/logout", authenticate, (req, res) => {
  console.log(req.user);
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
    });
});

router.get("/:id", (req, res) => {
  var id = req.params.id;
  User.getUserByUserName(id)
    .then(user => {
      return res.status(200).json(user);
    })
    .catch(error => {
      return res.status(404).json({ error });
    });
});

module.exports = router;
