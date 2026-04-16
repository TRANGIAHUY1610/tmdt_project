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
      status,
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
    const data = await ordersRepository.getOrdersByUser(userId);
    return { data };
  }

  // 🔥 ADMIN
  async getAllOrders() {
    const data = await ordersRepository.getAllOrders();
    return { data };
  }

  async confirmOrder(orderNumber) {
    await ordersRepository.confirmOrder(orderNumber);
    return { data: true };
  }
}

module.exports = new OrdersService();
