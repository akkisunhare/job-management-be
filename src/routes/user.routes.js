const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/workers', authenticate, authorizeRoles(ROLES.ADMIN), userController.getWorkers);

module.exports = router;
