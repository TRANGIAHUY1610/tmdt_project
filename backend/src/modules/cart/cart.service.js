const cartRepository = require("./cart.repository");

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.getByUserId(userId);

    const summary = {
      total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    return { data: cart, extra: { summary } };
  }

  async addToCart(userId, payload) {
    let { productId, quantity = 1 } = payload;

    if (!productId) {
      return { error: { statusCode: 400, message: "Thieu ID san pham gym" } };
    }

    productId = parseInt(productId, 10);
    quantity = parseInt(quantity, 10);

    const item = await cartRepository.addItem(userId, productId, quantity);

    return {
      data: item,
      message: "Da them vao gio",
      statusCode: 201,
    };
  }

  async updateCartItem(userId, productId, payload) {
    const quantity = parseInt(payload.quantity, 10);

    if (!quantity || quantity < 1) {
      return { error: { statusCode: 400, message: "So luong phai >= 1" } };
    }

    await cartRepository.updateItem(userId, parseInt(productId, 10), quantity);
    return { data: null, message: "Cap nhat thanh cong" };
  }

  async removeFromCart(userId, productId) {
    await cartRepository.removeItem(userId, parseInt(productId, 10));
    return { data: null, message: "Da xoa san pham" };
  }

  async clearCart(userId) {
    await cartRepository.clearUserCart(userId);
    return { data: null, message: "Da xoa toan bo gio hang" };
  }
}

module.exports = new CartService();

