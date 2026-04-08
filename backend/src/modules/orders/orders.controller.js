const ordersService = require("./orders.service");
const { success, failure } = require("../../shared/response");

class OrdersController {
  async createOrder(req, res) {
    const result = await ordersService.createOrder(req.user.id, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async getMyOrders(req, res) {
    const result = await ordersService.getMyOrders(req.user.id);
    return success(res, result.data);
  }
}

module.exports = new OrdersController();
