const multer = require('multer');
const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let details = err.details || null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the allowed limit of 5MB';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Maximum 5 files allowed per request';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}. Expected field: 'images'`;
    } else {
      message = err.message;
    }
  }

  if (err.name === 'SequelizeUniqueConstraintError' || err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    statusCode = 409;
    errorCode = 'CONFLICT';
    if (err.message && err.message.includes('uk_invoices_job_id')) {
      message = 'An invoice has already been generated for this job';
    } else if (err.message && err.message.includes('email')) {
      message = 'A user with this email address already exists';
    } else {
      message = 'A duplicate resource already exists';
    }
  }

  if (err.name === 'SequelizeForeignKeyConstraintError' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Cannot modify resource due to existing relationships';
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'BAD_REQUEST';
    message = 'Malformed JSON payload';
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('Server Error:', err);
  }

  return sendError(res, {
    statusCode,
    message,
    code: errorCode,
    details,
  });
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
