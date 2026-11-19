class ApiResponse {
  static success(res, statusCode = 200, message = 'Success', data = null) {
    const payload = {
      success: true,
      message
    };
    if (data !== null && data !== undefined) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  }

  static successWithPagination(res, statusCode = 200, message = 'Success', data = [], page = 1, limit = 10, totalItems = 0) {
    const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total_items: Number(totalItems),
        total_pages: totalPages === 0 && totalItems > 0 ? 1 : totalPages
      }
    });
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
    const payload = {
      success: false,
      message
    };
    if (errors !== null && errors !== undefined) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
