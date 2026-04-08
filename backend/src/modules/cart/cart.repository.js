const Cart = require("../../../models/Cart");

class CartRepository {
  async getByUserId(userId) {
    return Cart.getByUserId(userId);
  }

  async addItem(userId, productId, quantity) {
    return Cart.addItem(userId, productId, quantity);
  }

  async updateItem(userId, productId, quantity) {
    return Cart.updateItem(userId, productId, quantity);
  }

  async removeItem(userId, productId) {
    return Cart.removeItem(userId, productId);
  }

  async clearUserCart(userId) {
    return Cart.clearUserCart(userId);
  }
}

module.exports = new CartRepository();

