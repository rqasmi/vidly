const request = require('supertest');
const { User } = require('../../../models/user');
const { Genre } = require('../../../models/genre');


describe('admin middleware', () => {
  let server;

  beforeEach(async () => server = require('../../../app'));

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  it('should return 403 if the user is not an admin', async () => {
    const genre = new Genre({ name: 'genre1' });
    await genre.save();

    const token = new User({ isAdmin: false }).generateAuthToken();
    const res = await request(server)
      .delete(`/api/genres/${genre._id}`)
      .set('x-auth-token', token);

    expect(res.status).toBe(403);
  }); 
});