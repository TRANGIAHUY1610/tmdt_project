const productsRepository = require("./products.repository");

class ProductsService {
  async getFlashSaleProducts() {
    const data = await productsRepository.getFlashSaleProducts();
    return { data };
  }

  async getAllProducts(query) {
    const result = await productsRepository.getAllProducts(query);
    return {
      data: result.products,
      extra: {
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
        },
      },
    };
  }

  async searchProducts(query) {
    const { q } = query;
    if (!q) {
      return { error: { statusCode: 400, message: "Nhap tu khoa tim kiem" } };
    }
    const data = await productsRepository.searchProducts(q);
    return { data };
  }

  async getFeaturedProducts() {
    const data = await productsRepository.getFeaturedProducts();
    return { data };
  }

  async getBestsellers() {
    const data = await productsRepository.getBestsellers();
    return { data };
  }

  async getProductById(id) {
    const data = await productsRepository.getProductById(parseInt(id, 10));
    if (!data) {
      return { error: { statusCode: 404, message: "Khong tim thay san pham gym" } };
    }
    return { data };
  }

  async getProductReviews(id) {
    const data = await productsRepository.getProductReviews(parseInt(id, 10));
    return { data };
  }

  async createReview(productId, userId, payload) {
    await productsRepository.createReview({
      userId,
      productId: parseInt(productId, 10),
      rating: payload.rating,
      comment: payload.comment,
    });
    return { data: null, message: "Da gui danh gia", statusCode: 201 };
  }

  async createProduct(payload) {
    await productsRepository.createProduct({
      title: payload.title,
      author: payload.author,
      price: payload.price,
      catId: payload.category_id,
      desc: payload.description,
      img: payload.image_url,
      stock: payload.stock_quantity || 0,
    });
    return { data: null, message: "Them san pham gym thanh cong", statusCode: 201 };
  }

  async updateProduct(id, payload) {
    await productsRepository.updateProduct({
      id: parseInt(id, 10),
      title: payload.title,
      author: payload.author,
      price: payload.price,
      desc: payload.description,
      stock: payload.stock_quantity,
      img: payload.image_url,
      catId: payload.category_id,
    });
    return { data: null, message: "Cap nhat thanh cong" };
  }

  async deleteProduct(id) {
    await productsRepository.deleteProduct(parseInt(id, 10));
    return { data: null, message: "Da xoa san pham gym" };
  }

  async updateStock(id, stock) {
    await productsRepository.updateStock({
      id: parseInt(id, 10),
      stock: parseInt(stock, 10),
    });
    return { data: null, message: "Da cap nhat kho" };
  }
}

module.exports = new ProductsService();

