const express = require('express');

const usersController = require('./users.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  usersController.getUsers
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  usersController.createUser
);

module.exports = router;