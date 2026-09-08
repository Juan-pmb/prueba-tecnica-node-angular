const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const importsRoutes = require('./modules/imports/imports.routes');
const recordsRoutes = require('./modules/records/records.routes');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/records', recordsRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente'
  });
});

module.exports = app;