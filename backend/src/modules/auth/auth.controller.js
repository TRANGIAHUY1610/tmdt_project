const authService = require("./auth.service");
const { success, failure } = require("../../shared/response");

class AuthController {
  async register(req, res) {
    const result = await authService.register(req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async login(req, res) {
    const result = await authService.login(req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async getProfile(req, res) {
    const result = await authService.getProfile(req.user);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data);
  }

  async updateProfile(req, res) {
    const result = await authService.updateProfile(req.user, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async changePassword(req, res) {
    const result = await authService.changePassword(req.user, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }
}

module.exports = new AuthController();
