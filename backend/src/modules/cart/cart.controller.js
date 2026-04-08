const cartService = require("./cart.service");
const { success, failure } = require("../../shared/response");

class CartController {
  async getCart(req, res) {
    const result = await cartService.getCart(req.user.id);
    return success(res, result.data, "OK", 200, result.extra || {});
  }

  async addToCart(req, res) {
    const result = await cartService.addToCart(req.user.id, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async updateCartItem(req, res) {
    const result = await cartService.updateCartItem(req.user.id, req.params.productId, req.body);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data, result.message);
  }

  async removeFromCart(req, res) {
    const result = await cartService.removeFromCart(req.user.id, req.params.productId);
    return success(res, result.data, result.message);
  }

  async clearCart(req, res) {
    const result = await cartService.clearCart(req.user.id);
    return success(res, result.data, result.message);
  }
}

module.exports = new CartController();

