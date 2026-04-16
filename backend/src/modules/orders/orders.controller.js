const ordersService = require("./orders.service");
const { success, failure } = require("../../shared/response");

class OrdersController {
  async createOrder(req, res) {
    const result = await ordersService.createOrder(req.user.id, req.body);

    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }

    return success(res, result.data, result.message, result.statusCode);
  }

  async getMyOrders(req, res) {
    const result = await ordersService.getMyOrders(req.user.id);
    return success(res, result.data);
  }

  // 🔥 ADMIN
  async getAllOrders(req, res) {
    const result = await ordersService.getAllOrders();
    return success(res, result.data);
  }

  async confirmOrder(req, res) {
    const { order_number } = req.body;

    const result = await ordersService.confirmOrder(order_number);
    return success(res, "Đã xác nhận đơn");
  }
}

module.exports = new OrdersController();
