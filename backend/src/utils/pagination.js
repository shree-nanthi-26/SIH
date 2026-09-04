/**
 * Pagination helper.
 * Computes skip, limit, and meta for list endpoints.
 *
 * @param {object} query - Express req.query
 * @param {number} total - Total document count
 * @returns {{ skip: number, limit: number, meta: object }}
 */
const paginate = (query, total) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const pages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
    meta: { total, page, pages, limit },
  };
};

module.exports = { paginate };
