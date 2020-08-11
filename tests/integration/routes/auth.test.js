const request = require("supertest");
const { User } = require("../../../models/user");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("/api/auth", () => {
  let server;

  beforeEach(async () => (server = require("../../../app")));

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("POST /", () => {
    let email, password, salt, id, user;

    const exec = () => {
      return request(server).post("/api/auth").send({ email, password });
    };

    beforeEach(async () => {
      _id = mongoose.Types.ObjectId();
      email = "12345@test.ca";
      password = "12345";
      salt = await bcrypt.genSalt(10);

      user = new User({
        _id: id,
        name: "123",
        email,
        password: await bcrypt.hash(password, salt),
        isAdmin: false,
      });
      await user.save();
    });

    it("should return 400 if email is an invalid email", async () => {
      email = "123";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is less than 8 characters", async () => {
      email = "12@t.ca";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 255 characters", async () => {
      email = new Array(250).join("a") + "@test.ca";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is less than 5 characters", async () => {
      password = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is more than 20 characters", async () => {
      password = new Array(22).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      email = "54321@test.ca";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is invalid", async () => {
      password = "54321";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return a token if input is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
  });
});
