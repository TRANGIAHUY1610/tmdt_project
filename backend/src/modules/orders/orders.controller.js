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

  async getOrderById(req, res) {
    console.log(`[Controller Debug] Entering getOrderById with id: ${req.params.id}`);
    const orderId = parseInt(req.params.id, 10);
    if (!orderId) return failure(res, "ID đơn hàng không hợp lệ", 400);
    const result = await ordersService.getOrderById(orderId, req.user.id);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data);
  }

  async cancelOrder(req, res) {
    const orderId = parseInt(req.params.id, 10);
    if (!orderId) return failure(res, "ID đơn hàng không hợp lệ", 400);
    const result = await ordersService.cancelOrder(orderId, req.user.id);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }
}

module.exports = new OrdersController();
