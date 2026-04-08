const productsService = require("./products.service");
const { success, failure } = require("../../shared/response");

class ProductsController {
  async getFlashSaleProducts(req, res) {
    const result = await productsService.getFlashSaleProducts();
    return success(res, result.data);
  }

  async getAllProducts(req, res) {
    const result = await productsService.getAllProducts(req.query);
    return success(res, result.data, "OK", 200, result.extra || {});
  }

  async searchProducts(req, res) {
    const result = await productsService.searchProducts(req.query);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data);
  }

  async getFeaturedProducts(req, res) {
    const result = await productsService.getFeaturedProducts();
    return success(res, result.data);
  }

  async getBestsellers(req, res) {
    const result = await productsService.getBestsellers();
    return success(res, result.data);
  }

  async getProductById(req, res) {
    const result = await productsService.getProductById(req.params.id);
    if (result.error) {
      return failure(res, result.error.message, result.error.statusCode);
    }
    return success(res, result.data);
  }

  async getProductReviews(req, res) {
    const result = await productsService.getProductReviews(req.params.id);
    return success(res, result.data);
  }

  async createReview(req, res) {
    const result = await productsService.createReview(req.params.id, req.user.id, req.body);
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async createProduct(req, res) {
    const result = await productsService.createProduct(req.body);
    return success(res, result.data, result.message, result.statusCode || 201);
  }

  async updateProduct(req, res) {
    const result = await productsService.updateProduct(req.params.id, req.body);
    return success(res, result.data, result.message);
  }

  async deleteProduct(req, res) {
    const result = await productsService.deleteProduct(req.params.id);
    return success(res, result.data, result.message);
  }

  async updateStock(req, res) {
    const result = await productsService.updateStock(req.params.id, req.body.stock);
    return success(res, result.data, result.message);
  }
}

module.exports = new ProductsController();

