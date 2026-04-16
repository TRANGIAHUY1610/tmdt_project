const ordersRepository = require("./orders.repository");

class OrdersService {
  async createOrder(userId, payload) {
    const {
      shipping_address,
      payment_method,
      customer_note,
      shipping_fee,
      total_amount,
      order_code, // 🔥 nhận từ QR
    } = payload;

    const cartCount = await ordersRepository.countCartItems(userId);
    if (cartCount === 0) {
      return { error: { statusCode: 400, message: "Gio hang trong" } };
    }

    // 🔥 QR thì dùng order_code, không thì tự tạo
    const orderNumber =
      order_code || `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const status = "pending";

    const orderResult = await ordersRepository.createOrder({
      userId,
      order_number: orderNumber,
      shipping_address,
      payment_method,
      customer_note,
      shipping_fee,
      total_amount,
    });

    const orderId = orderResult.insertId;

    await ordersRepository.copyCartItemsToOrder(orderId, userId);
    await ordersRepository.clearUserCart(userId);

    return {
      data: {
        orderId,
        order_number: orderNumber,
      },
      message: "Dat hang thanh cong",
      statusCode: 201,
    };
  }

  async getMyOrders(userId) {
    const orders = await ordersRepository.getOrdersByUser(userId);
    for (const order of orders) {
      order.items = await ordersRepository.getOrderItems(order.id);
    }
    return { data: orders };
  }

  async getOrderById(orderId, userId) {
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      return { error: { statusCode: 404, message: "Không tìm thấy đơn hàng" } };
    }
    if (order.user_id !== userId) {
      return { error: { statusCode: 403, message: "Bạn không có quyền xem đơn hàng này" } };
    }
    order.items = await ordersRepository.getOrderItems(orderId);
    return { data: order };
  }

  async cancelOrder(orderId, userId) {
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      return { error: { statusCode: 404, message: "Không tìm thấy đơn hàng" } };
    }
    if (order.user_id !== userId) {
      return { error: { statusCode: 403, message: "Bạn không có quyền hủy đơn hàng này" } };
    }
    if (order.status !== "pending") {
      return { error: { statusCode: 400, message: "Chỉ có thể hủy đơn hàng đang chờ xử lý" } };
    }
    await ordersRepository.updateOrderStatus(orderId, "cancelled");
    return { data: { orderId }, message: "Đã hủy đơn hàng thành công" };
  }
}

module.exports = new OrdersService();
