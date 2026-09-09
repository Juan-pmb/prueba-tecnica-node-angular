require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('POST /api/auth/login', () => {
  test('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@prueba.com',
        password: 'Admin123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('admin@prueba.com');
    expect(response.body.user.role).toBe('ADMIN');
  });

  test('should reject invalid credentials', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'ContraseñaIncorrecta'
    });

  expect(response.statusCode).toBe(401);
  expect(response.body.message).toBe('Credenciales inválidas');
});


test('should return 404 when an OPERADOR tries to access users', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'operador@prueba.com',
      password: 'Operador123'
    });

  const token = loginResponse.body.token;

  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe('Recurso no encontrado');
});

test('should return 404 when a CONSULTA tries to access users', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'consulta@prueba.com',
      password: 'Consulta123'
    });

  const token = loginResponse.body.token;

  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`);

  expect(response.statusCode).toBe(404);
  expect(response.body.message).toBe('Recurso no encontrado');
});

test('should allow ADMIN to access users', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

});


afterAll(async () => {
  await pool.end();
});