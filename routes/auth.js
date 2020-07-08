const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const validate = require('../middleware/validate');
const _= require('lodash');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validateReq(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send(token);
});

function validateReq(req) {
  const schema = Joi.object({
    email: Joi.string()
      .min(8)
      .max(255)
      .required()
      .email(),

    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
      .required()
  });

  return schema.validate(req);
}

module.exports = router;