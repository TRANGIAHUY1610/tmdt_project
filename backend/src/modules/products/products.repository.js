const { dbHelpers } = require("../../config/database");

class ProductsRepository {
  async getFlashSaleProducts() {
    const query = `
      SELECT * FROM products
      WHERE price < original_price OR original_price IS NULL
      ORDER BY RAND()
      LIMIT 10
    `;
    return dbHelpers.query(query);
  }

  async getAllProducts({ page = 1, limit = 10, category, min_price, max_price, search, sort_by, sort_order }) {
    const offset = (page - 1) * limit;

    let whereClause = " WHERE 1=1";
    const params = {};

    if (category) {
      whereClause += " AND category_id = @category";
      params.category = parseInt(category, 10);
    }
    if (min_price) {
      whereClause += " AND price >= @min";
      params.min = parseFloat(min_price);
    }
    if (max_price) {
      whereClause += " AND price <= @max";
      params.max = parseFloat(max_price);
    }
    if (search) {
      whereClause += " AND (title LIKE @search OR author LIKE @search)";
      params.search = `%${search}%`;
    }

    const sortByMap = {
      price: "price",
      id: "id",
    };
    const orderByField = sortByMap[sort_by] || "id";
    const orderDirection = String(sort_order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const productsSql = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${orderByField} ${orderDirection}
      LIMIT @limit OFFSET @offset
    `;

    const countSql = `SELECT COUNT(*) AS total FROM products ${whereClause}`;

    const dataParams = {
      ...params,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    };

    const countParams = { ...params };

    const [products, countRows] = await Promise.all([
      dbHelpers.query(productsSql, dataParams),
      dbHelpers.query(countSql, countParams),
    ]);

    return {
      products,
      total: countRows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  }

  async searchProducts(keyword) {
    return dbHelpers.query(
      "SELECT * FROM products WHERE title LIKE @keyword OR author LIKE @keyword",
      { keyword: `%${keyword}%` }
    );
  }

  async getFeaturedProducts() {
    return dbHelpers.query("SELECT * FROM products ORDER BY RAND() LIMIT 8");
  }

  async getBestsellers() {
    return dbHelpers.query("SELECT * FROM products ORDER BY price DESC LIMIT 5");
  }

  async getProductById(id) {
    const rows = await dbHelpers.query("SELECT * FROM products WHERE id = @id", { id });
    return rows[0] || null;
  }

  async getProductReviews(productId) {
    const sql = `
      SELECT r.*, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = @productId
      ORDER BY r.created_at DESC
    `;
    return dbHelpers.query(sql, { productId });
  }

  async createReview({ userId, productId, rating, comment }) {
    const sql = `
      INSERT INTO reviews (user_id, product_id, rating, comment, created_at)
      VALUES (@userId, @productId, @rating, @comment, NOW())
    `;
    return dbHelpers.execute(sql, { userId, productId, rating, comment });
  }

  async createProduct(payload) {
    const sql = `
      INSERT INTO products (title, author, price, category_id, description, image_url, stock_quantity)
      VALUES (@title, @author, @price, @catId, @desc, @img, @stock)
    `;
    return dbHelpers.execute(sql, payload);
  }

  async updateProduct(payload) {
    const sql = `
      UPDATE products
      SET title=@title, author=@author, price=@price,
          description=@desc, stock_quantity=@stock,
          image_url=@img, category_id=@catId
      WHERE id=@id
    `;
    return dbHelpers.execute(sql, payload);
  }

  async deleteProduct(id) {
    return dbHelpers.execute("DELETE FROM products WHERE id = @id", { id });
  }

  async updateStock({ id, stock }) {
    return dbHelpers.execute(
      "UPDATE products SET stock_quantity = @stock WHERE id = @id",
      { id, stock }
    );
  }
}

module.exports = new ProductsRepository();

