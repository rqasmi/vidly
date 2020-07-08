const request = require('supertest');
const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');
const mongoose = require('mongoose');
const { Genre } = require('../../../models/genre');

let server;

describe('/api/movies', () => {
  beforeEach(() => { server = require('../../../app'); });
  afterEach(async () => {
    await server.close();
    await Movie.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: 'movie1',
          genre: { name: 'genre1' },
          numberInStock: 1,
          dailyRentalRate: 1
        },
        {
          title: 'movie2',
          genre: { name: 'genre2' },
          numberInStock: 1,
          dailyRentalRate: 1
        }
      ]);

      const res = await request(server).get('/api/movies');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.title === 'movie1')).toBeTruthy();
      expect(res.body.some(m => m.title === 'movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a movie if valid id is passed', async () => {
      const movie = new Movie({
        title: 'movie1',
        genre: {
          name: 'genre1'
        },
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await movie.save();

      const res = await request(server).get(`/api/movies/${movie._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/movies/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/movies/' + id);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token
    , title
    , genreId
    , genre
    , numberInStock
    , dailyRentalRate;

    const exec = async () => {
      return await request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      genreId = mongoose.Types.ObjectId();

      genre = new Genre({
        _id: genreId,
        name: 'genre1'
      });
      await genre.save();

      title = 'movie1';
      numberInStock = 1;
      dailyRentalRate = 1;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 3 characters', async () => {
      title = '12';

      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      title = new Array(52).join('a');
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre id is not valid', async () => {
      genreId = 1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is less than 0', async () => {
      numberInStock = -1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is less than 0', async () => {
      dailyRentalRate = -1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if no genre with the given Id exists', async () => {
      genreId = mongoose.Types.ObjectId();
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should save the movie if input is valid', async () => {
      await exec();
      
      const movie = await Movie.find({ title: 'movie1' });

      expect(movie).not.toBeNull();
    });

    it('should return the movie if input is valid', async () => {
      const res = await exec();
      
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(['title', 'genre', 
        'numberInStock', 'dailyRentalRate']));
    });
  });

  describe('PUT /:id', () => {
    let token
    , genreId
    , genre
    , movieId
    , movie
    , newTitle
    , newStock
    , newRate;
    
    const exec = async () => {
      return await request(server)
        .put('/api/movies/' + movieId)
        .set('x-auth-token', token)
        .send({
          title: newTitle,
          genreId,
          numberInStock: newStock,
          dailyRentalRate: newRate
        });
    };

    beforeEach(async () => {
      genreId = mongoose.Types.ObjectId();

      genre = new Genre({ _id: genreId, name: 'genre1' });
      await genre.save();

      movie = new Movie({
        title: 'movie1',
        genre,
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await movie.save();

      token = new User().generateAuthToken();

      movieId = movie._id;
      newTitle = 'updatedTitle';
      newStock = 2;
      newRate = 2;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 3 characters', async () => {
      newTitle = '12';

      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      newTitle = new Array(52).join('a');
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid genre id is passed ', async () => {
      genreId = 1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is less than 0', async () => {
      newStock = -1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is less than 0', async () => {
      newRate = -1;
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 400 if no genre with the given id exists', async () => {
      genreId = mongoose.Types.ObjectId();
      
      const res = await exec();
      
      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid movie id is passed', async () => {
      movieId = 1;

      const res = await exec();
      
      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie with the given id exists', async () => {
      movieId = mongoose.Types.ObjectId();

      const res = await exec();
      
      expect(res.status).toBe(404);
    });

    it('should update the movie if input is valid', async () => {
      await exec();

      const updatedMovie = await Movie.findById(movie._id);

      expect(updatedMovie.title).toBe(newTitle);
      expect(updatedMovie.numberInStock).toBe(newStock);
      expect(updatedMovie.dailyRentalRate).toBe(newRate);
    });

    it('should return the updated movie if input is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', newTitle);
    });
  });

  describe('DELETE /:id', () => {
    let token
    , movie
    , id;

    const exec = async () => {
      return await request(server)
        .delete('/api/movies/' + id)
        .set('x-auth-token', token);
    };

    beforeEach(async () => {
      movie = new Movie({
        title: 'movie1',
        genre: {
          _id: mongoose.Types.ObjectId(),
          name: 'genre1'
        },
        numberInStock: 1,
        dailyRentalRate: 1
      });
      await movie.save();

      id = movie._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie with the given id exists', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the movie if input is valid', async () => {
      await exec();

      const movieInDb = await Movie.findById(movie._id);

      expect(movieInDb).toBeNull();
    });

    it('should return the deleted movie', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', movie.title);
      expect(res.body).toHaveProperty('_id', movie._id.toHexString());
    });
  });
});
