const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 30
  },

  email: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
    unique: true
  },

  password:{
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, isAdmin:  this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(5)
      .max(30)
      .required(),

    email: Joi.string()
      .min(8)
      .max(255)
      .required()
      .email(),

    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
      .required()
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;