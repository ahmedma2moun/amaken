const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const _ = require("lodash");
var nodemailer = require("nodemailer");

const { authenticate } = require("../middleware/authenticate");

const router = express();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amakenapplication@gmail.com",
    pass: "amakenapp2018"
  }
});

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
  bcrypt
    .hash(user.email, 10)
    .then(hash => {
      user.verficationHash = hash.split("$")
      .join("").split(".")
      .join("").split('\\')
      .join("").split('/')
      .join("");
      user.save().then(result => {
        var mailOptions = {
          from: "Dont Replay <amakenapplication@gmail.com>",
          to: body.email,
          subject: "One more step",
          html: `
          <p>Hello ${user.userName}<p>
          <p>Please click on the bellow link to complete your registration<p>
          <a href="http://localhost:4200/validate;hash=${user.verficationHash}">Verifiy<a>
          <p>Regards<p>
          `
        };
        transporter.sendMail(mailOptions, function(error, info) {});
        res.json(_.pick(user, ["_id", "userName", "email"]));
      });
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
router.get("/verify/:hash", (req, res) => {
  var hash = req.params.hash;
  User.validateUser(hash)
    .then(user => {
      return res.status(200).json(user);
    })
    .catch(error => {
      return res.status(500).json(error);
    });
});

module.exports = router;
