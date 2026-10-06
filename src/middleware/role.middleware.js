const { ForbiddenError } = require('../utils/errors');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Access forbidden: user role not identified'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: required role (${allowedRoles.join(', ')}), current role (${req.user.role})`
        )
      );
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};
