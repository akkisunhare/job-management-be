const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { ROLES } = require('../utils/constants');
const { createInvoiceSchema } = require('../validators/invoice.validator');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validate(createInvoiceSchema, 'body'),
  invoiceController.createInvoice
);

module.exports = router;
