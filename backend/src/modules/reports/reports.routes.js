const express = require('express');

const reportsController = require('./reports.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  reportsController.getReports
);

module.exports = router;