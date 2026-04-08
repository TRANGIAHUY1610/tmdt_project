const ordersRepository = require("./orders.repository");

class OrdersService {
  async createOrder(userId, payload) {
    const {
      shipping_address,
      payment_method,
      customer_note,
      shipping_fee,
      total_amount,
    } = payload;

    const cartCount = await ordersRepository.countCartItems(userId);
    if (cartCount === 0) {
      return { error: { statusCode: 400, message: "Gio hang trong" } };
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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
    const data = await ordersRepository.getOrdersByUser(userId);
    return { data };
  }
}

module.exports = new OrdersService();
