const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },

  isGold: {
    type: Boolean,
    default: false,
  },

  phone: {
    type: String,
    required: true,
    length: 10,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),

    isGold: Joi.boolean(),

    phone: Joi.string().length(10).required(),
  });
  return schema.validate(customer);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
