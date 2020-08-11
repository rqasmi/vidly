const request = require("supertest");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let server;

describe("/api/users", () => {
  beforeEach(() => (server = require("../../../app")));
  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("GET /me", () => {
    let user, token;

    beforeEach(async () => {
      user = new User({
        _id: mongoose.Types.ObjectId(),
        name: "123",
        email: "1234@user.ca",
        password: "12345",
        isAdmin: false,
      });
      await user.save();

      token = user.generateAuthToken();
    });

    const exec = () => {
      return request(server).get("/api/users/me").set("x-auth-token", token);
    };

    it("should return 401 if no token is provided", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      token = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return the user if token is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        _id: user._id.toHexString(),
        name: user.name,
        email: user.email,
      });
    });
  });

  describe("POST /", () => {
    let email, password, name, salt, id, user;

    const exec = () => {
      return request(server).post("/api/users").send({ email, password, name });
    };

    beforeEach(async () => {
      _id = mongoose.Types.ObjectId();
      email = "12345@test.ca";
      password = "12345";
      name = "123";
      salt = await bcrypt.genSalt(10);

      user = new User({
        _id: id,
        name,
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

    it("should return 400 if user is already registered", async () => {
      email = "12345@test.ca";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return the user if input is valid", async () => {
      await User.deleteMany({});

      const res = await exec();

      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
    });
  });
});
