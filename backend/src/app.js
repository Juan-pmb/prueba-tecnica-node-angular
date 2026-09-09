const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const importsRoutes = require('./modules/imports/imports.routes');
const recordsRoutes = require('./modules/records/records.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const errorsRoutes = require('./modules/errors/errors.routes');
const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/errors', errorsRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando correctamente'
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'Solo se permiten archivos CSV') {
    return res.status(400).json({
      message: err.message
    });
  }

  next(err);
});
module.exports = app;