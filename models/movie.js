const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { genreSchema } = require('./genre');


const movieSchema = new mongoose.Schema({
  title: { 
    type: String,
    requried: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  genre: { 
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
});

movieSchema.methods.outOfStock = function() {
  return this.numberInStock === 0;
};

const Movie = mongoose.model('Movie', movieSchema);


function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(50)
      .required(),

    genreId: Joi.objectId().required(),

    numberInStock: Joi.number()
      .min(0)
      .required(),

    dailyRentalRate: Joi.number()
      .min(0)
      .required()
  });

  return schema.validate(movie);
}

exports.movieSchema = movieSchema;
exports.Movie = Movie;
exports.validateMovie = validateMovie;