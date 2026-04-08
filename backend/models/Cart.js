const { dbHelpers } = require("../config/database");

const Cart = {
  // 1. Láº¥y giá» hÃ ng (báº£ng carts lÆ°u trá»±c tiáº¿p user_id + product_id)
  async getByUserId(userId) {
    const sql = `
      SELECT 
        c.id,
        c.product_id,
        c.quantity,
        b.title, 
        b.price, 
        b.image_url, 
        b.author, 
        b.stock_quantity
      FROM carts c
      JOIN products b ON c.product_id = b.id
      WHERE c.user_id = @userId
    `;
    return await dbHelpers.query(sql, { userId });
  },

  // 2. ThÃªm sáº£n pháº©m
  async addItem(userId, productId, quantity) {
    // Kiem tra xem san pham gym da co trong gio chua
    const item = await dbHelpers.getOne(
      "SELECT * FROM carts WHERE user_id = @userId AND product_id = @productId",
      { userId, productId }
    );

    if (item) {
      // CÃ³ rá»“i -> Cá»™ng dá»“n sá»‘ lÆ°á»£ng
      await dbHelpers.execute(
        "UPDATE carts SET quantity = quantity + @quantity, updated_at = NOW() WHERE id = @id",
        { id: item.id, quantity }
      );
    } else {
      // ChÆ°a cÃ³ -> Insert dÃ²ng má»›i
      await dbHelpers.execute(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES (@userId, @productId, @quantity)",
        { userId, productId, quantity }
      );
    }

    return { userId, productId, quantity };
  },

  // 3. Cáº­p nháº­t sá»‘ lÆ°á»£ng
  async updateItem(userId, productId, quantity) {
    const sql = "UPDATE carts SET quantity = @quantity, updated_at = NOW() WHERE user_id = @userId AND product_id = @productId";
    await dbHelpers.execute(sql, { userId, productId, quantity });
    return { userId, productId, quantity };
  },

  // 4. XÃ³a sáº£n pháº©m
  async removeItem(userId, productId) {
    const sql = "DELETE FROM carts WHERE user_id = @userId AND product_id = @productId";
    await dbHelpers.execute(sql, { userId, productId });
    return true;
  },

  // 5. XÃ³a háº¿t giá» hÃ ng
  async clearUserCart(userId) {
    const sql = "DELETE FROM carts WHERE user_id = @userId";
    await dbHelpers.execute(sql, { userId });
    return true;
  },
};

module.exports = Cart;

