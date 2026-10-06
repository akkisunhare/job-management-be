function getPaginationParams(query, defaultLimit = 10, maxLimit = 100) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPaginationMetadata(page, limit, total) {
  const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

module.exports = {
  getPaginationParams,
  buildPaginationMetadata,
};
