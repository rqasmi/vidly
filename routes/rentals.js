const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const { Rental, validateRental } = require("../models/rental");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const express = require("express");
const router = express.Router();

Fawn.init(mongoose);

router.get("/", auth, async (req, res) => {
  const rentals = await Rental.find().select("-__v").sort("-dateOut");
  res.send(rentals);
});

router.post("/", [auth, validate(validateRental)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Invalid customer.");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("Invalid movie.");

  if (movie.outOfStock()) return res.status(400).send("Movie is out of stock");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie.id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // Implement a DB transaction
  try {
    await new Fawn.Task()
      .save("rentals", rental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(rental);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id).select("-__v");

  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");

  res.send(rental);
});

module.exports = router;
