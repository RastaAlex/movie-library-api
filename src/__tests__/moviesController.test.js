import supertest from 'supertest';
import { app } from '../../app.js';
import { sequelize } from '../../config/database.js';
import Movie from '../models/Movie.js';

jest.mock('../middleware/authMiddleware.js', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

let server;
let request;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = app.listen(0);
  request = supertest(server);
});

afterAll(async () => {
  await sequelize.close();
  await server.close();
});

describe('Movies API', () => {
  let testMovie;

  beforeEach(async () => {
    testMovie = await Movie.create({
      title: 'Test Movie',
      year: 2023,
      format: 'DVD',
      actors: ['Test Actor1', 'Test Actor2'],
    });
  });

  afterEach(async () => {
    await Movie.destroy({ where: {}, truncate: true });
  });

  test('GET should return a list of movies', async () => {
    const response = await request.get('/api/v1/movies');
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  test('GET should return a movie by id', async () => {
    const response = await request.get(`/api/v1/movies/${testMovie.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  test('POST should create a new movie', async () => {
    const newMovie = {
      title: 'New Movie',
      year: 2023,
      format: 'DVD',
      actors: ['New Actor1', 'New Actor2'],
    };

    const response = await request.post('/api/v1/movies').send(newMovie);
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchSnapshot();
  });

  test('PATCH should update a movie', async () => {
    const updatedMovie = {
      title: 'Updated Movie',
      year: 2023,
      format: 'Blu-Ray',
      actors: ['Updated Actor1', 'Updated Actor2'],
    };

    const response = await request.patch(`/api/v1/movies/${testMovie.id}`).send(updatedMovie);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  test('DELETE should delete a movie', async () => {
    const response = await request.delete(`/api/v1/movies/${testMovie.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });

  test('POST should import movies from a file', async () => {
    const filePath = 'src/__tests__/testFile.txt';
    const response = await request.post('/api/v1/movies/import').attach('file', filePath);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });
});
