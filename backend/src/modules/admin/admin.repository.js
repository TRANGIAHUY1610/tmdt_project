const { dbHelpers } = require("../../config/database");

class AdminRepository {
  async getDashboardSummary() {
    const [productRow, userRow, adminRow, orderRow, revenueRow] = await Promise.all([
      dbHelpers.getOne("SELECT COUNT(*) AS total_products FROM products"),
      dbHelpers.getOne(`SELECT COUNT(*) AS total_users FROM users u LEFT JOIN admins a ON a.email = u.email AND a.status = 'active' WHERE a.id IS NULL`),
      dbHelpers.getOne("SELECT COUNT(*) AS total_admins FROM admins WHERE status = 'active' AND is_active = 1"),
      dbHelpers.getOne("SELECT COUNT(*) AS total_orders FROM orders"),
      dbHelpers.getOne("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')"),
    ]);

    return {
      total_products: Number(productRow?.total_products || 0),
      total_users: Number(userRow?.total_users || 0),
      total_admins: Number(adminRow?.total_admins || 0),
      total_orders: Number(orderRow?.total_orders || 0),
      total_revenue: Number(revenueRow?.total_revenue || 0),
    };
  }

  async getRevenueByMonth() {
    const sql = `
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month_key, COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month_key ASC
    `;
    return dbHelpers.query(sql);
  }

  async getBestSellerProducts(limit = 5) {
    const sql = `
      SELECT b.id, b.title, COALESCE(SUM(oi.quantity), 0) AS sold_quantity
      FROM products b
      LEFT JOIN order_items oi ON oi.product_id = b.id
      GROUP BY b.id, b.title
      ORDER BY sold_quantity DESC, b.id DESC
      LIMIT @limit
    `;
    return dbHelpers.query(sql, { limit });
  }

  async getRecentOrders(limit = 5) {
    const sql = `
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.name AS customer_name
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT @limit
    `;
    return dbHelpers.query(sql, { limit });
  }

  async listAdmins({ page, limit, search, status }) {
    const offset = (page - 1) * limit;
    let whereClause = " WHERE 1=1";
    const params = { limit, offset };

    if (search) {
      whereClause += " AND (a.name LIKE @search OR a.email LIKE @search OR a.admin_code LIKE @search)";
      params.search = `%${search}%`;
    }

    if (status) {
      whereClause += " AND a.status = @status";
      params.status = status;
    }

    const dataSql = `
      SELECT a.id, a.name, a.email, a.phone, a.status, a.admin_code, a.is_active, a.granted_note, a.granted_at, a.revoked_at, a.created_at
      FROM admins a
      ${whereClause}
      ORDER BY a.id DESC
      LIMIT @limit OFFSET @offset
    `;

    const countSql = `SELECT COUNT(*) AS total FROM admins a ${whereClause}`;

    const [data, countRows] = await Promise.all([
      dbHelpers.query(dataSql, params),
      dbHelpers.query(countSql, params),
    ]);

    return {
      data,
      total: Number(countRows[0]?.total || 0),
    };
  }

  async findAdminRecordByEmail(email) {
    return dbHelpers.getOne("SELECT id FROM admins WHERE email = @email LIMIT 1", { email });
  }

  async createAdminAccount(payload) {
    return dbHelpers.execute(
      `
      INSERT INTO admins (name, email, password, phone, is_active, status, admin_code, granted_note, granted_at)
      VALUES (@name, @email, @password, @phone, @is_active, @status, @admin_code, @granted_note, NOW())
    `,
      payload
    );
  }

  async updateAdminStatus(id, { status, granted_note }) {
    return dbHelpers.execute(
      `
      UPDATE admins
      SET status = @status,
          is_active = CASE WHEN @status = 'active' THEN 1 ELSE 0 END,
          granted_note = COALESCE(@granted_note, granted_note),
          revoked_at = CASE WHEN @status = 'revoked' THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE id = @id
    `,
      { id, status, granted_note }
    );
  }

  async deleteAdminAccount(id) {
    return dbHelpers.execute("DELETE FROM admins WHERE id = @id", { id });
  }

  async listUsers({ page, limit, search }) {
    const offset = (page - 1) * limit;
    let whereClause = " WHERE 1=1";
    const params = { limit, offset };

    if (search) {
      whereClause += " AND (u.name LIKE @search OR u.email LIKE @search)";
      params.search = `%${search}%`;
    }

    const dataSql = `
      SELECT
        u.id,
        u.name,
        u.email,
        'customer' AS role,
        u.phone,
        u.address,
        u.is_active,
        u.created_at
      FROM users u
      LEFT JOIN admins a ON a.user_id = u.id AND a.status = 'active'
      ${whereClause} AND a.id IS NULL
      ORDER BY u.id DESC
      LIMIT @limit OFFSET @offset
    `;

    const countSql = `SELECT COUNT(*) AS total FROM users u LEFT JOIN admins a ON a.user_id = u.id AND a.status = 'active' ${whereClause} AND a.id IS NULL`;

    const [data, countRows] = await Promise.all([
      dbHelpers.query(dataSql, params),
      dbHelpers.query(countSql, params),
    ]);

    return {
      data,
      total: Number(countRows[0]?.total || 0),
    };
  }

  async listCategories() {
    const sql = `
      SELECT c.id, c.name, c.description, c.image_url, COUNT(b.id) AS product_count
      FROM categories c
      LEFT JOIN products b ON b.category_id = c.id
      GROUP BY c.id, c.name, c.description, c.image_url
      ORDER BY c.id DESC
    `;
    return dbHelpers.query(sql);
  }

  async createCategory({ name, description, image_url }) {
    return dbHelpers.execute(
      `
      INSERT INTO categories (name, description, image_url, created_at, updated_at)
      VALUES (@name, @description, @image_url, NOW(), NOW())
    `,
      { name, description, image_url }
    );
  }

  async updateCategory({ id, name, description, image_url }) {
    return dbHelpers.execute(
      `
      UPDATE categories
      SET name=@name, description=@description, image_url=@image_url, updated_at=NOW()
      WHERE id=@id
    `,
      { id, name, description, image_url }
    );
  }

  async countProductsByCategory(id) {
    const row = await dbHelpers.getOne(
      "SELECT COUNT(*) AS total FROM products WHERE category_id = @id",
      { id }
    );
    return Number(row?.total || 0);
  }

  async deleteCategory(id) {
    return dbHelpers.execute("DELETE FROM categories WHERE id = @id", { id });
  }

  async listOrders({ page, limit, status, search }) {
    const offset = (page - 1) * limit;
    let whereClause = " WHERE 1=1";
    const params = { limit, offset };

    if (status) {
      whereClause += " AND o.status = @status";
      params.status = status;
    }

    if (search) {
      whereClause += " AND (o.order_number LIKE @search OR u.name LIKE @search)";
      params.search = `%${search}%`;
    }

    const dataSql = `
      SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_method, o.payment_status,
             o.created_at, o.updated_at, o.admin_note, u.id AS user_id, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT @limit OFFSET @offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ${whereClause}
    `;

    const [data, countRows] = await Promise.all([
      dbHelpers.query(dataSql, params),
      dbHelpers.query(countSql, params),
    ]);

    return {
      data,
      total: Number(countRows[0]?.total || 0),
    };
  }

  async updateOrderStatus({ id, status, payment_status, admin_note }) {
    return dbHelpers.execute(
      `
      UPDATE orders
      SET status=@status,
          payment_status=COALESCE(@payment_status, payment_status),
          admin_note=COALESCE(@admin_note, admin_note),
          updated_at=NOW()
      WHERE id=@id
    `,
      { id, status, payment_status, admin_note }
    );
  }
}

module.exports = new AdminRepository();

