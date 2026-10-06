function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, pagination = null }) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

function sendError(res, { statusCode = 500, message = 'An unexpected error occurred', code = 'INTERNAL_ERROR', details = null }) {
  const payload = {
    success: false,
    message,
    error: {
      code,
    },
  };

  if (details !== null && details !== undefined) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
