const express = require('express');

const importsController = require('./imports.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/role.middleware');
const uploadCsv = require('../../middlewares/upload.middleware');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'OPERADOR'),
  uploadCsv.single('file'),
  importsController.createImport
);

router.get(
  '/',
  authenticateToken,
  importsController.getImports
);

router.get(
  '/:id/errors',
  authenticateToken,
  importsController.getImportErrors
);

module.exports = router;