const express = require('express');

const {
  getErrors
} = require('./errors.controller');

const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  getErrors
);

module.exports = router;