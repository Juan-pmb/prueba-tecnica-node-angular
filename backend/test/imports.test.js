require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');

describe('POST /api/imports', () => {
  test('should return 404 when CONSULTA tries to upload a CSV', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'consulta@prueba.com',
        password: 'Consulta123'
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post('/api/imports')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Recurso no encontrado');
  });

  //comprueba que nadie pueda saltarse la autenticación antes de llegar al ETL
  test('should return 401 when uploading without authentication', async () => {
  const response = await request(app)
    .post('/api/imports');

  expect(response.statusCode).toBe(401);
  expect(response.body.message).toBe('Token requerido');
});

//prueba de ADMIN
test('should allow ADMIN to upload and process a valid CSV', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const csv = [
    'tipo_documento,documento,nombres,apellidos,fecha_nacimiento,email,ciudad,estado',
    `CC,${Date.now()}01,Ana,Gomez,1990-05-10,ana@test.com,Bogota,ACTIVO`,
    `CC,${Date.now()}02,Carlos,Perez,1988-03-20,carlos@test.com,Medellin,INACTIVO`
  ].join('\n');

  const response = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from(csv), 'valid.csv');

  expect(response.statusCode).toBe(201);
  expect(response.body.totalRecords).toBe(2);
  expect(response.body.validRecords).toBe(2);
  expect(response.body.invalidRecords).toBe(0);
  expect(response.body.status).toBe('COMPLETADO');
});

//datos mixtos
test('should process valid records and log invalid records', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const validDocument = `${Date.now()}03`;

  const csv = [
    'tipo_documento,documento,nombres,apellidos,fecha_nacimiento,email,ciudad,estado',
    `CC,${validDocument},Maria,Lopez,1992-06-15,maria@test.com,Bogota,ACTIVO`,
    'CC,ABC999,,Perez,2025-02-30,correo-invalido,Medellin,ACTIVO'
  ].join('\n');

  const response = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from(csv), 'invalid.csv');

  expect(response.statusCode).toBe(201);
  expect(response.body.totalRecords).toBe(2);
  expect(response.body.validRecords).toBe(1);
  expect(response.body.invalidRecords).toBe(1);
  expect(response.body.status).toBe('COMPLETADO');
});

test('should return import errors for an import', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const validDocument = `${Date.now()}04`;

  const csv = [
    'tipo_documento,documento,nombres,apellidos,fecha_nacimiento,email,ciudad,estado',
    `CC,${validDocument},Maria,Lopez,1992-06-15,maria@test.com,Bogota,ACTIVO`,
    'CC,ABC999,,Perez,2025-02-30,correo-invalido,Medellin,ACTIVO'
  ].join('\n');

  const importResponse = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from(csv), 'errors.csv');

  expect(importResponse.statusCode).toBe(201);

  const importId = importResponse.body.importId;

  const errorsResponse = await request(app)
    .get(`/api/imports/${importId}/errors`)
    .set('Authorization', `Bearer ${token}`);

  expect(errorsResponse.statusCode).toBe(200);
  expect(errorsResponse.body.length).toBeGreaterThan(1);

  expect(errorsResponse.body[0]).toHaveProperty('row_number');
  expect(errorsResponse.body[0]).toHaveProperty('field');
  expect(errorsResponse.body[0]).toHaveProperty('description');
});

test('should reject non-CSV files', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const response = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach(
      'file',
      Buffer.from('this is not a CSV file'),
      'archivo.txt'
    );

  expect(response.statusCode).toBe(400);
});

test('should reject empty CSV files', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const response = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach(
      'file',
      Buffer.from(''),
      'empty.csv'
    );

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe('El archivo CSV está vacío');
});

test('should detect incomplete records', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@prueba.com',
      password: 'Admin123'
    });

  const token = loginResponse.body.token;

  const document = `${Date.now()}05`;

  const csv = [
    'tipo_documento,documento,nombres,apellidos,fecha_nacimiento,email,ciudad,estado',
    `CC,${document},Ana,,1990-05-10,ana@test.com,Bogota,ACTIVO`
  ].join('\n');

  const response = await request(app)
    .post('/api/imports')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from(csv), 'incomplete.csv');

  expect(response.statusCode).toBe(201);
  expect(response.body.totalRecords).toBe(1);
  expect(response.body.validRecords).toBe(0);
  expect(response.body.invalidRecords).toBe(1);
});
});