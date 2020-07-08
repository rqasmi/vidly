const request = require('supertest');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');

let server; 

describe('/api/users', () => {
  beforeEach(() => server = require('../../../app'));
  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe('GET /me', () => {
    let user
    ,token;

    beforeEach(async () => {
      
      user = new User({
      _id: mongoose.Types.ObjectId(),
      username: '12345',
      email: '1234@user.ca',
      password: '12345678',
      isAdmin: false
      });
      await user.save();

      token = user.generateAuthToken();
    });
    
    const exec = () => {
      return request(server)
        .get('/api/users/me')
        .set('x-auth-token', token);
    };

    it('should return 401 if no token is provided', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if token is invalid', async () => {
      token = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return the user if token is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ _id: user._id.toHexString(), username: user.username, email: user.email });
    });
  });
});