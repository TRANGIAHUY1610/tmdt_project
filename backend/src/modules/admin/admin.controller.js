const { success, failure } = require("../../shared/response");
const adminService = require("./admin.service");

class AdminController {
  async getDashboard(req, res) {
    const result = await adminService.getDashboard();
    return success(res, result.data);
  }

  async listUsers(req, res) {
    const result = await adminService.listUsers(req.query);
    return success(res, result.data, "OK", 200, result.extra || {});
  }

  async listAdmins(req, res) {
    const result = await adminService.listAdmins(req.query);
    return success(res, result.data, "OK", 200, result.extra || {});
  }

  async createAdminAccount(req, res) {
    const result = await adminService.createAdminAccount(req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async updateAdminStatus(req, res) {
    const result = await adminService.updateAdminStatus(req.params.id, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async deleteAdminAccount(req, res) {
    const result = await adminService.deleteAdminAccount(req.params.id);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async listCategories(req, res) {
    const result = await adminService.listCategories();
    return success(res, result.data);
  }

  async createCategory(req, res) {
    const result = await adminService.createCategory(req.body);
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async updateCategory(req, res) {
    const result = await adminService.updateCategory(req.params.id, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async deleteCategory(req, res) {
    const result = await adminService.deleteCategory(req.params.id);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async listOrders(req, res) {
    const result = await adminService.listOrders(req.query);
    return success(res, result.data, "OK", 200, result.extra || {});
  }

  async updateOrderStatus(req, res) {
    const result = await adminService.updateOrderStatus(req.params.id, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }
}

module.exports = new AdminController();
