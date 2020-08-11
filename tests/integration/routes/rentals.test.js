const request = require("supertest");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");
const { Movie } = require("../../../models/movie");
const { Customer } = require("../../../models/customer");

describe("/api/rentals", () => {
  let server, token;

  beforeEach(() => {
    server = require("../../../app");
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Customer.deleteMany({});
    await Movie.deleteMany({});
  });

  describe("GET /", () => {
    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await request(server)
        .get("/api/rentals")
        .set("x-auth-token", token);

      expect(res.status).toBe(401);
    });

    it("should return all rentals", async () => {
      await Rental.collection.insertMany([
        {
          customer: {
            name: "12345",
            phone: "1234567890",
          },
          movie: {
            title: "12345",
            dailyRentalRate: 2,
          },
        },
        {
          customer: {
            name: "67890",
            phone: "0987654321",
          },
          movie: {
            title: "67890",
            dailyRentalRate: 5,
          },
        },
      ]);

      const res = await request(server)
        .get("/api/rentals")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(
          (v) => v.movie.title === "12345" && v.customer.name === "12345"
        )
      ).toBeTruthy();
      expect(
        res.body.some(
          (v) => v.movie.title === "67890" && v.customer.name === "67890"
        )
      ).toBeTruthy();
    });
  });

  describe("POST /", () => {
    let customerId, movieId, customer, movie;

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();
      movieId = mongoose.Types.ObjectId();

      customer = new Customer({
        _id: customerId,
        name: "customer1",
        phone: "1234567890",
      });

      movie = new Movie({
        _id: movieId,
        title: "12345",
        genre: {
          name: "genre1",
        },
        numberInStock: 3,
        dailyRentalRate: 2,
      });

      await customer.save();
      await movie.save();
    });

    const exec = () => {
      return request(server)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is invalid", async () => {
      customerId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is invalid", async () => {
      movieId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer with the given Id is found", async () => {
      customerId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no movie with the given Id is found", async () => {
      movieId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if movie is out of stock", async () => {
      movie.numberInStock = 0;
      await movie.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the rental if input is valid", async () => {
      const rentalInDb = await Rental.find({
        "customer._id": customerId,
        "movie._id": movieId,
      });

      await exec();

      expect(rentalInDb).not.toBeNull();
    });

    it("should decrement the movie stock if input is valid", async () => {
      await exec();

      const movieInDb = await Movie.findById(movieId);

      expect(movieInDb.numberInStock).toBe(movie.numberInStock - 1);
    });

    it("should return the rental if input is valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(["customer", "movie", "dateOut"])
      );
    });
  });
});
