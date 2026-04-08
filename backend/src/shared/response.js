function success(res, data = null, message = "OK", statusCode = 200, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
}

function failure(res, message = "Bad request", statusCode = 400, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
}

module.exports = {
  success,
  failure,
};
