const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const UserSchema = mongoose.Schema({
  userName: {
    type: String,
    minlength: 1,
    trim: true,
    required: true,
    unique: true
  },
  email: {
    type: String,
    minlength: 1,
    trim: true,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{Value} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    minlength: 1
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1
  },
  points: {
    type: Number
  },
  rank: {
    type: Number
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ],
  promotionsIDs: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  phoneNumber: {
    type: Number,
    required: true
  },
  verfied: {
    type: Boolean,
    default: false
  },
  verficationHash: {
    type: String
  }
});

UserSchema.pre("save", function(next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.hash(user.password, 10).then(hash => {
      user.password = hash;
      next();
    });
  } else next();
});

UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();
  user.tokens = user.tokens.concat([{ access, token }]);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.statics.findByCredentials = function(userName, password) {
  var User = this;
  return User.findOne({ userName }).then(user => {
    if (!user)
      return Promise.reject({
        error: "Wrong username"
      });
    return new Promise((resoleve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resoleve(user);
        } else
          reject({
            error: "Wrong password"
          });
      });
    });
  });
};
UserSchema.methods.removeToken = function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

UserSchema.statics.getUserByUserName = function(userName) {
  var User = this;
  return User.findOne({ userName }).then(user => {
    if (!user)
      return Promise.reject({
        error: "User not found"
      });
    return Promise.resolve(user);
  });
};

UserSchema.statics.validateUser = function(hash) {
  User = this;
  return User.findOneAndUpdate(
    { verficationHash: hash },
    {
      $set: {
        verfied: true,
        verficationHash: ""
      }
    }
  );
};

module.exports = mongoose.model("User", UserSchema);
