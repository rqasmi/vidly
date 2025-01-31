const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Customer, validateCustomer } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const customers = await Customer.find().select("-__v").sort("name");
  res.send(customers);
});

router.post("/", [auth, validate(validateCustomer)], async (req, res) => {
  let customer = await Customer.findOne({ name: req.body.name });
  if (customer)
    return res
      .status(400)
      .send("This name has already been taken. Please use a different name.");

  customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });

  await customer.save();
  res.send(customer);
});

router.put(
  "/:id",
  [auth, validate(validateCustomer), validateObjectId],
  async (req, res) => {
    let customer = await Customer.findOne({ name: req.body.name });
    if (customer)
      return res
        .status(400)
        .send("This name has already been taken. Please use a different name.");

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
      },
      { new: true }
    );

    if (!customer)
      return res
        .status(404)
        .send("The customer with the given ID was not found.");

    res.send(customer);
  }
);

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.get("/:id", auth, validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

module.exports = router;
