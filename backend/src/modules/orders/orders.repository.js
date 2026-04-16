const { dbHelpers } = require("../../config/database");

class OrdersRepository {
  async countCartItems(userId) {
    const rows = await dbHelpers.query(
      "SELECT COUNT(*) AS count FROM carts WHERE user_id = @userId",
      { userId }
    );
    return rows[0]?.count || 0;
  }

  async createOrder(payload) {
    const sql = `
      INSERT INTO orders (
        user_id,
        order_number,
        shipping_address,
        payment_method,
        customer_note,
        shipping_fee,
        total_amount,
        status,
        created_at
      )
      VALUES (
        @userId,
        @order_number,
        @shipping_address,
        @payment_method,
        @customer_note,
        @shipping_fee,
        @total_amount,
        @status,
        NOW()
      )
    `;

    return dbHelpers.execute(sql, payload);
  }

  async copyCartItemsToOrder(orderId, userId) {
    const sql = `
      INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
      SELECT @orderId, c.product_id, c.quantity, p.price, (c.quantity * p.price)
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = @userId
    `;

    return dbHelpers.execute(sql, { orderId, userId });
  }

  async clearUserCart(userId) {
    return dbHelpers.execute(
      "DELETE FROM carts WHERE user_id = @userId",
      { userId }
    );
  }

  async getOrdersByUser(userId) {
    return dbHelpers.query(
      "SELECT * FROM orders WHERE user_id = @userId ORDER BY created_at DESC",
      { userId }
    );
  }

  // 🔥 ADMIN
  async getAllOrders() {
    return dbHelpers.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
  }

  async confirmOrder(orderNumber) {
    return dbHelpers.execute(
      "UPDATE orders SET status = 'paid' WHERE order_number = @orderNumber",
      { orderNumber }
    );
  }
}

module.exports = new OrdersRepository();
