export function getPagination(req) {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '10', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildPagination(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

