const express = require('express');

const recordsController = require('./records.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  recordsController.getRecords
);

module.exports = router;