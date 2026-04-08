const adminRepository = require("./admin.repository");
const bcrypt = require("bcryptjs");

class AdminService {
  async getDashboard() {
    const [summary, revenueByMonth, bestSellers, recentOrders] = await Promise.all([
      adminRepository.getDashboardSummary(),
      adminRepository.getRevenueByMonth(),
      adminRepository.getBestSellerProducts(5),
      adminRepository.getRecentOrders(5),
    ]);

    return {
      data: {
        summary,
        revenueByMonth,
        bestSellers,
        recentOrders,
      },
    };
  }

  async listUsers(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const search = (query.search || "").trim();

    const { data, total } = await adminRepository.listUsers({
      page,
      limit,
      search,
    });

    return {
      data,
      extra: {
        pagination: {
          page,
          limit,
          total,
        },
      },
    };
  }

  async listAdmins(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const search = (query.search || "").trim();
    const status = (query.status || "").trim();

    const { data, total } = await adminRepository.listAdmins({
      page,
      limit,
      search,
      status,
    });

    return {
      data,
      extra: {
        pagination: {
          page,
          limit,
          total,
        },
      },
    };
  }

  async createAdminAccount(payload) {
    const existing = await adminRepository.findAdminRecordByEmail(payload.email);
    if (existing) {
      return {
        error: {
          statusCode: 400,
          message: "Email admin da ton tai",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    await adminRepository.createAdminAccount({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone || null,
      is_active: payload.status === "revoked" ? 0 : 1,
      status: payload.status || "active",
      admin_code: payload.admin_code || null,
      granted_note: payload.granted_note || null,
    });

    return { data: null, message: "Tao tai khoan admin thanh cong", statusCode: 201 };
  }

  async updateAdminStatus(id, payload) {
    const result = await adminRepository.updateAdminStatus(Number(id), {
      status: payload.status,
      granted_note: payload.granted_note || null,
    });

    if (!result.affectedRows) {
      return {
        error: {
          statusCode: 404,
          message: "Khong tim thay tai khoan admin",
        },
      };
    }

    return { data: null, message: payload.status === "active" ? "Da kich hoat admin" : "Da khoa admin" };
  }

  async deleteAdminAccount(id) {
    const result = await adminRepository.deleteAdminAccount(Number(id));
    if (!result.affectedRows) {
      return {
        error: {
          statusCode: 404,
          message: "Khong tim thay tai khoan admin",
        },
      };
    }

    return { data: null, message: "Da xoa tai khoan admin" };
  }

  async listCategories() {
    const data = await adminRepository.listCategories();
    return { data };
  }

  async createCategory(payload) {
    await adminRepository.createCategory(payload);
    return { data: null, message: "Them danh muc thanh cong", statusCode: 201 };
  }

  async updateCategory(id, payload) {
    const result = await adminRepository.updateCategory({
      id: Number(id),
      ...payload,
    });

    if (!result.affectedRows) {
      return {
        error: {
          statusCode: 404,
          message: "Khong tim thay danh muc",
        },
      };
    }

    return { data: null, message: "Cap nhat danh muc thanh cong" };
  }

  async deleteCategory(id) {
    const categoryId = Number(id);
    const productCount = await adminRepository.countProductsByCategory(categoryId);
    if (productCount > 0) {
      return {
        error: {
          statusCode: 400,
          message: "Danh muc dang co san pham gym. Hay chuyen san pham gym sang danh muc khac truoc khi xoa",
        },
      };
    }

    const result = await adminRepository.deleteCategory(categoryId);
    if (!result.affectedRows) {
      return {
        error: {
          statusCode: 404,
          message: "Khong tim thay danh muc",
        },
      };
    }

    return { data: null, message: "Da xoa danh muc" };
  }

  async listOrders(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const status = (query.status || "").trim();
    const search = (query.search || "").trim();

    const { data, total } = await adminRepository.listOrders({
      page,
      limit,
      status,
      search,
    });

    return {
      data,
      extra: {
        pagination: {
          page,
          limit,
          total,
        },
      },
    };
  }

  async updateOrderStatus(id, payload) {
    const result = await adminRepository.updateOrderStatus({
      id: Number(id),
      status: payload.status,
      payment_status: payload.payment_status || null,
      admin_note: payload.admin_note || null,
    });

    if (!result.affectedRows) {
      return {
        error: {
          statusCode: 404,
          message: "Khong tim thay don hang",
        },
      };
    }

    return { data: null, message: "Cap nhat don hang thanh cong" };
  }
}

module.exports = new AdminService();

