const request = require("supertest");
const { Customer } = require("../../../models/customer");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");

describe("/api/customers", () => {
  let server, token;

  beforeEach(() => {
    server = require("../../../app");
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Customer.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      await Customer.collection.insertMany([
        { name: "customer1", phone: "1234567890" },
        { name: "customer2", phone: "0987654321" },
      ]);

      const res = await request(server)
        .get("/api/customers")
        .set("x-auth-token", token);

      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toMatch("1");
      expect(res.body.some((c) => c.name === "customer1")).toBeTruthy();
      expect(res.body.some((c) => c.name === "customer2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let customer;

    // const exec = async () => {
    //   return await request(server)
    //     .get(`/api/customers/${customer._id}`)
    //     .set("x-auth-token", token);
    // };

    it("should return a customer if valid id is passed", async () => {
      const customer = new Customer({
        name: "customer1",
        phone: "1234567890",
      });
      await customer.save();

      // const res = await exec();
      const res = await request(server)
        .get(`/api/customers/${customer._id}`)
        .set("x-auth-token", token);

      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });

    it("should return 404 if invalid id is passed", async () => {
      // const res = await exec();

      const res = await request(server)
        .get("/api/customers/1")
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server)
        .get("/api/customers/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let name, phone;

    const exec = async () => {
      return await request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, phone });
    };

    beforeEach(() => {
      // token = new User().generateAuthToken();
      name = "customer1";
      phone = "1234567890";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if name is less than 3 characters", async () => {
      name = "12";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 30 characters", async () => {
      name = new Array(32).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 10 characters", async () => {
      phone = new Array(12).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is more than 10 characters", async () => {
      phone = new Array(9).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the customer if input is valid", async () => {
      await exec();

      const customer = await Customer.find({ name: "customer1" });

      expect(customer).not.toBeNull();
    });

    it("should return the customer if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "customer1");
    });
  });

  describe("PUT /:id", () => {
    let customer, id, newName, newPhone;

    const exec = async () => {
      return await request(server)
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({ name: newName, phone: newPhone });
    };

    beforeEach(async () => {
      customer = new Customer({ name: "customer1", phone: "1234567890" });
      await customer.save();

      // token = new User().generateAuthToken();
      id = customer._id;
      newName = "updatedName";
      newPhone = "0987654321";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if name is less than 3 characters", async () => {
      newName = "12";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 30 characters", async () => {
      newName = new Array(32).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 10 characters", async () => {
      newPhone = new Array(9).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is more than 10 characters", async () => {
      newPhone = new Array(12).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the customer if input is valid", async () => {
      await exec();

      const updatedCustomer = await Customer.findById(customer._id);

      expect(updatedCustomer.name).toBe(newName);
      expect(updatedCustomer.phone).toBe(newPhone);
    });

    it("should return the updated customer if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("name", newName);
      expect(res.body).toHaveProperty("phone", newPhone);
    });
  });

  describe("DELETE /:id", () => {
    let customer, id;

    const exec = async () => {
      return await request(server)
        .delete("/api/customers/" + id)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      customer = new Customer({ name: "customer1", phone: "1234567890" });
      await customer.save();

      id = customer._id;
      // token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    // it('should return 403 if the user is not an admin', async () => {
    //   token = new User({ isAdmin: false }).generateAuthToken();

    //   const res = await exec();

    //   expect(res.status).toBe(403);
    // });

    it("should return 404 if invalid id is passed", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the customer if input is valid", async () => {
      const res = await exec();

      const customerInDb = await Customer.findById(customer._id);

      expect(res.status).toBe(200);
      expect(customerInDb).toBeNull();
    });

    it("should return the deleted customer", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("_id", customer._id.toHexString());
    });
  });
});
