import supertest from 'supertest';
import { app } from '../../app.js';
import { sequelize } from '../config/database.js';
import User from '../models/user.js';

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

describe('Users API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  test('POST should create a new user', async () => {
    const newUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const response = await request.post('/api/v1/users').send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchSnapshot();
  });

  test('POST should return a token for an existing user', async () => {
    const newUser = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      confirmPassword: 'password123',
    };
    await request.post('/api/v1/users').send(newUser);

    const response = await request.post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchSnapshot();
  });
});
