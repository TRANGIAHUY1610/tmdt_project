const admin = {
  token: null,
  user: null,
  products: [],
  categories: [],
  admins: [],
  users: [],
  orders: [],
  revenueChart: null,
  bestsellersChart: null,
  adminsQuery: {
    page: 1,
    limit: 10,
    search: "",
  },
  usersQuery: {
    page: 1,
    limit: 10,
    search: "",
  },
  ordersQuery: {
    page: 1,
    limit: 10,
    status: "",
    search: "",
  },

  async init() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user") || "null");

    if (!this.token || !this.user || this.user.role !== "admin") {
      window.location.href = "./admin-login.html";
      return;
    }

    try {
      const payload = await this.fetchJson(`${API_BASE}/auth/profile`);
      const profile = payload?.data || null;

      if (!profile || profile.role !== "admin") {
        throw new Error("Ban khong co quyen truy cap trang quan tri");
      }

      localStorage.setItem("user", JSON.stringify(profile));
      this.user = profile;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "./admin-login.html";
      return;
    }

    this.bindUi();
    this.switchSection("dashboard", document.querySelector('.nav-link[data-section="dashboard"]'));
  },

  bindUi() {
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.switchSection(link.dataset.section, link);
      });
    });

    const productForm = document.getElementById("product-form");
    if (productForm) {
      productForm.addEventListener("submit", (event) => this.handleProductSubmit(event));
    }

    const categoryForm = document.getElementById("category-form");
    if (categoryForm) {
      categoryForm.addEventListener("submit", (event) => this.handleCategorySubmit(event));
    }

    const adminAccountForm = document.getElementById("admin-account-form");
    if (adminAccountForm) {
      adminAccountForm.addEventListener("submit", (event) => this.handleAdminAccountSubmit(event));
    }

    const promotionForm = document.getElementById("promotion-form");
    if (promotionForm) {
      promotionForm.addEventListener("submit", (event) => {
        event.preventDefault();
        Swal.fire("Thông báo", "API khuyến mãi sẽ được bổ sung ở giai đoạn tiếp theo.", "info");
      });
    }

    const statusFilter = document.getElementById("order-status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this.ordersQuery.status = statusFilter.value;
        this.ordersQuery.page = 1;
        this.loadOrders();
      });
    }

    this.injectSearchAndPagingControls();
  },

  injectSearchAndPagingControls() {
    const adminsHeader = document.querySelector("#admins-section .section-header");
    if (adminsHeader && !document.getElementById("admins-search")) {
      const wrapper = document.createElement("div");
      wrapper.className = "filters";
      wrapper.innerHTML = `
        <select id="admins-status-filter" style="max-width:160px">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="revoked">Đã khóa</option>
        </select>
        <input id="admins-search" type="text" placeholder="Tìm tên, email hoặc mã admin" style="max-width:280px">
        <button class="btn btn-secondary" id="admins-search-btn">Tìm</button>
      `;
      adminsHeader.appendChild(wrapper);

      document.getElementById("admins-search-btn").addEventListener("click", () => {
        this.adminsQuery.search = document.getElementById("admins-search").value.trim();
        this.adminsQuery.status = document.getElementById("admins-status-filter").value;
        this.adminsQuery.page = 1;
        this.loadAdmins();
      });

      document.getElementById("admins-status-filter").addEventListener("change", () => {
        this.adminsQuery.status = document.getElementById("admins-status-filter").value;
        this.adminsQuery.page = 1;
        this.loadAdmins();
      });
    }

    const usersHeader = document.querySelector("#users-section .section-header");
    if (usersHeader && !document.getElementById("users-search")) {
      const wrapper = document.createElement("div");
      wrapper.className = "filters";
      wrapper.innerHTML = `
        <input id="users-search" type="text" placeholder="Tìm theo tên hoặc email" style="max-width:280px">
        <button class="btn btn-secondary" id="users-search-btn">Tìm</button>
      `;
      usersHeader.appendChild(wrapper);

      document.getElementById("users-search-btn").addEventListener("click", () => {
        this.usersQuery.search = document.getElementById("users-search").value.trim();
        this.usersQuery.page = 1;
        this.loadUsers();
      });
    }

    const ordersHeader = document.querySelector("#orders-section .section-header");
    if (ordersHeader && !document.getElementById("orders-search")) {
      const wrapper = document.createElement("div");
      wrapper.className = "filters";
      wrapper.innerHTML = `
        <input id="orders-search" type="text" placeholder="Tìm mã đơn hoặc tên khách" style="max-width:280px">
        <button class="btn btn-secondary" id="orders-search-btn">Tìm</button>
      `;
      ordersHeader.appendChild(wrapper);

      document.getElementById("orders-search-btn").addEventListener("click", () => {
        this.ordersQuery.search = document.getElementById("orders-search").value.trim();
        this.ordersQuery.page = 1;
        this.loadOrders();
      });
    }

  },

  switchSection(sectionName, activeLink) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
      section.classList.add("active");
    }

    if (activeLink) {
      activeLink.classList.add("active");
      const pageTitle = document.getElementById("page-title");
      if (pageTitle) {
        pageTitle.textContent = activeLink.textContent.trim();
      }
    }

    this.loadSectionData(sectionName);
  },

  loadSectionData(sectionName) {
    if (sectionName === "dashboard") {
      this.loadDashboard();
      return;
    }

    if (sectionName === "products") {
      this.loadCategories().then(() => this.loadProducts());
      return;
    }

    if (sectionName === "categories") {
      this.loadCategories();
      return;
    }

    if (sectionName === "admins") {
      this.loadAdmins();
      return;
    }

    if (sectionName === "users") {
      this.loadUsers();
      return;
    }

    if (sectionName === "orders") {
      this.loadOrders();
      return;
    }

    if (["promotions", "support", "careers"].includes(sectionName)) {
      Swal.fire("Thông báo", `Giao diện mục ${sectionName} đã sẵn sàng. API sẽ được tích hợp ở bước tiếp theo.`, "info");
    }

    if (sectionName === "contacts") {
      this.loadContacts();
      return;
    }
  },

  authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  },

  async fetchJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.authHeaders(),
        ...(options.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload?.message || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload;
  },

  async loadDashboard() {
    try {
      const payload = await this.fetchJson(`${API_BASE}/admin/dashboard`);
      const dashboard = payload.data || {};
      const summary = dashboard.summary || {};

      document.getElementById("total-products").textContent = String(summary.total_products || 0);
      document.getElementById("total-orders").textContent = String(summary.total_orders || 0);
      document.getElementById("total-users").textContent = String(summary.total_users || 0);
      const totalAdmins = document.getElementById("total-admins");
      if (totalAdmins) {
        totalAdmins.textContent = String(summary.total_admins || 0);
      }
      document.getElementById("total-revenue").textContent = `${Number(summary.total_revenue || 0).toLocaleString("vi-VN")} VND`;

      this.renderDashboardCharts(dashboard);
      this.renderRecentOrders(dashboard.recentOrders || []);
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  renderDashboardCharts(dashboard) {
    const revenueCanvas = document.getElementById("revenueChart");
    const bestCanvas = document.getElementById("bestsellersChart");

    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = null;
    }

    if (this.bestsellersChart) {
      this.bestsellersChart.destroy();
      this.bestsellersChart = null;
    }

    if (revenueCanvas && typeof Chart !== "undefined") {
      const monthlyRows = Array.isArray(dashboard.revenueByMonth) ? dashboard.revenueByMonth : [];
      this.revenueChart = new Chart(revenueCanvas, {
        type: "line",
        data: {
          labels: monthlyRows.map((item) => item.month_key),
          datasets: [{
            label: "Doanh thu",
            data: monthlyRows.map((item) => Number(item.revenue || 0)),
            borderColor: "#2c7be5",
            backgroundColor: "rgba(44, 123, 229, 0.2)",
            fill: true,
            tension: 0.3,
          }],
        },
      });
    }

    if (bestCanvas && typeof Chart !== "undefined") {
      const bestSellers = Array.isArray(dashboard.bestSellers) ? dashboard.bestSellers : [];
      this.bestsellersChart = new Chart(bestCanvas, {
        type: "bar",
        data: {
          labels: bestSellers.map((item) => (item.title || "N/A").slice(0, 18)),
          datasets: [{
            label: "Số lượng đã bán",
            data: bestSellers.map((item) => Number(item.sold_quantity || 0)),
            backgroundColor: "#00a97f",
          }],
        },
      });
    }
  },

  renderRecentOrders(recentOrders) {
    const container = document.getElementById("recent-orders");
    if (!container) {
      return;
    }

    if (!recentOrders.length) {
      container.innerHTML = "<p>Chưa có đơn hàng gần đây.</p>";
      return;
    }

    container.innerHTML = recentOrders
      .map(
        (order) => `
          <div class="activity-item">
            <div>
              <strong>${order.order_number}</strong> - ${order.customer_name || "N/A"}
            </div>
            <div>${Number(order.total_amount || 0).toLocaleString("vi-VN")} VND</div>
            <div><span class="status-badge">${order.status}</span></div>
          </div>
        `
      )
      .join("");
  },

  async loadProducts() {
    const tbody = document.getElementById("products-tbody");
    if (!tbody) {
      return;
    }

    try {
      const payload = await this.fetchJson(`${API_BASE}/products?page=1&limit=200`);
      this.products = Array.isArray(payload.data) ? payload.data : [];

      tbody.innerHTML = this.products
        .map(
          (product) => `
          <tr>
            <td>${product.id}</td>
            <td><img src="${product.image_url || ""}" alt="img" style="width:40px;height:56px;object-fit:cover"></td>
            <td>${product.title || ""}</td>
            <td>${product.author || ""}</td>
            <td>${Number(product.price || 0).toLocaleString("vi-VN")} VND</td>
            <td>${product.stock_quantity ?? 0}</td>
            <td>${(product.stock_quantity || 0) > 0 ? "Còn hàng" : "Hết hàng"}</td>
            <td>
              <button class="btn btn-secondary" onclick="editProduct(${product.id})">Sửa</button>
              <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
            </td>
          </tr>
        `
        )
        .join("");
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8">${error.message}</td></tr>`;
    }
  },

  async handleProductSubmit(event) {
    event.preventDefault();

    const id = document.getElementById("product-id").value;
    const payload = {
      title: document.getElementById("product-title").value.trim(),
      author: document.getElementById("product-author").value.trim(),
      price: Number(document.getElementById("product-price").value),
      original_price: Number(document.getElementById("product-original-price").value || 0),
      category_id: Number(document.getElementById("product-category").value || 0),
      description: document.getElementById("product-description").value,
      image_url: document.getElementById("product-image").value,
      stock_quantity: Number(document.getElementById("product-stock").value || 0),
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;

    try {
      await this.fetchJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      closeProductModal();
      await this.loadProducts();
      await this.loadDashboard();
      Swal.fire("Thành công", id ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async deleteProduct(id) {
    const confirm = await Swal.fire({
      title: "Xóa sản phẩm này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await this.fetchJson(`${API_BASE}/products/${id}`, {
        method: "DELETE",
      });

      await this.loadProducts();
      await this.loadDashboard();
      Swal.fire("Đã xóa", "Đã xóa sản phẩm", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async loadCategories() {
    const tbody = document.getElementById("categories-tbody");
    const select = document.getElementById("product-category");

    try {
      const payload = await this.fetchJson(`${API_BASE}/admin/categories`);
      this.categories = Array.isArray(payload.data) ? payload.data : [];

      if (tbody) {
        tbody.innerHTML = this.categories
          .map(
            (category) => `
            <tr>
              <td>${category.id}</td>
              <td>${category.name}</td>
              <td>${category.description || ""}</td>
              <td>${Number(category.product_count || 0)}</td>
              <td>
                <button class="btn btn-secondary" onclick="editCategory(${category.id})">Sửa</button>
                <button class="btn btn-danger" onclick="deleteCategory(${category.id})">Xóa</button>
              </td>
            </tr>
          `
          )
          .join("");
      }

      if (select) {
        select.innerHTML = '<option value="">Chọn danh mục</option>';
        this.categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = String(category.id);
          option.textContent = category.name;
          select.appendChild(option);
        });
      }
    } catch (error) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
      }
    }
  },

  async loadAdmins() {
    const tbody = document.getElementById("admins-tbody");
    if (!tbody) {
      return;
    }

    const params = new URLSearchParams({
      page: String(this.adminsQuery.page),
      limit: String(this.adminsQuery.limit),
      search: this.adminsQuery.search,
      status: this.adminsQuery.status || "",
    });

    try {
      const payload = await this.fetchJson(`${API_BASE}/admin/admins?${params.toString()}`);
      this.admins = Array.isArray(payload.data) ? payload.data : [];

      tbody.innerHTML = this.admins
        .map(
          (adminAccount) => `
            <tr>
              <td>${adminAccount.id}</td>
              <td>${adminAccount.name || ""}</td>
              <td>${adminAccount.email || ""}</td>
              <td>${adminAccount.phone || ""}</td>
              <td>
                <span class="admin-status-badge ${adminAccount.status === 'revoked' ? 'is-revoked' : 'is-active'}">
                  ${adminAccount.status === 'revoked' ? 'Đã khóa' : 'Đang hoạt động'}
                </span>
              </td>
              <td>${adminAccount.admin_code || ""}</td>
              <td>${new Date(adminAccount.created_at).toLocaleDateString("vi-VN")}</td>
              <td>
                <button class="btn btn-secondary" onclick="toggleAdminStatus(${adminAccount.id}, '${adminAccount.status === 'active' ? 'revoked' : 'active'}')">
                  ${adminAccount.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                </button>
                <button class="btn btn-danger" onclick="deleteAdminAccount(${adminAccount.id})">Xóa</button>
              </td>
            </tr>
          `
        )
        .join("");

      this.renderPagination("admins", payload.pagination || {}, (nextPage) => {
        this.adminsQuery.page = nextPage;
        this.loadAdmins();
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8">${error.message}</td></tr>`;
    }
  },

  async handleAdminAccountSubmit(event) {
    event.preventDefault();

    const payload = {
      name: document.getElementById("admin-account-name").value.trim(),
      email: document.getElementById("admin-account-email").value.trim(),
      password: document.getElementById("admin-account-password").value,
      phone: document.getElementById("admin-account-phone").value.trim(),
      admin_code: document.getElementById("admin-account-code").value.trim(),
      status: document.getElementById("admin-account-status").value,
      granted_note: document.getElementById("admin-account-note").value.trim(),
    };

    try {
      await this.fetchJson(`${API_BASE}/admin/admins`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      event.target.reset();
      await this.loadAdmins();
      Swal.fire("Thành công", "Tạo tài khoản admin thành công", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async updateAdminStatus(adminId, status) {
    const confirm = await Swal.fire({
      title: status === "active" ? "Kích hoạt admin này?" : "Khóa admin này?",
      text: status === "active" ? "Admin sẽ có thể đăng nhập và thao tác lại." : "Admin sẽ bị chặn đăng nhập và thao tác quản trị.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: status === "active" ? "Kích hoạt" : "Khóa",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await this.fetchJson(`${API_BASE}/admin/admins/${adminId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          granted_note: status === "active" ? "Kich hoat lai tu trang quan tri" : "Khoa tai khoan tu trang quan tri",
        }),
      });

      await this.loadAdmins();
      Swal.fire("Thành công", "Cập nhật trạng thái admin thành công", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async deleteAdminAccount(adminId) {
    const confirm = await Swal.fire({
      title: "Xóa tài khoản admin?",
      text: "Hành động này sẽ xóa bản ghi admin khỏi bảng admins.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await this.fetchJson(`${API_BASE}/admin/admins/${adminId}`, {
        method: "DELETE",
      });

      await this.loadAdmins();
      Swal.fire("Đã xóa", "Đã xóa tài khoản admin", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async handleCategorySubmit(event) {
    event.preventDefault();

    const id = document.getElementById("category-id").value;
    const payload = {
      name: document.getElementById("category-name").value.trim(),
      description: document.getElementById("category-description").value,
      image_url: document.getElementById("category-image").value,
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE}/admin/categories/${id}` : `${API_BASE}/admin/categories`;

    try {
      await this.fetchJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      closeCategoryModal();
      await this.loadCategories();
      Swal.fire("Thành công", id ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async deleteCategory(id) {
    const confirm = await Swal.fire({
      title: "Xóa danh mục này?",
      text: "Bạn không thể xóa danh mục đang chứa sản phẩm.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await this.fetchJson(`${API_BASE}/admin/categories/${id}`, {
        method: "DELETE",
      });

      await this.loadCategories();
      Swal.fire("Đã xóa", "Đã xóa danh mục", "success");
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  async loadUsers() {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) {
      return;
    }

    const params = new URLSearchParams({
      page: String(this.usersQuery.page),
      limit: String(this.usersQuery.limit),
      search: this.usersQuery.search,
    });

    try {
      const payload = await this.fetchJson(`${API_BASE}/admin/users?${params.toString()}`);
      this.users = Array.isArray(payload.data) ? payload.data : [];

      tbody.innerHTML = this.users
        .map(
          (user) => `
            <tr>
              <td>${user.id}</td>
              <td>${user.name || ""}</td>
              <td>${user.email || ""}</td>
              <td>Khách hàng</td>
              <td>${user.phone || ""}</td>
              <td>${new Date(user.created_at).toLocaleDateString("vi-VN")}</td>
              <td>Không có thao tác</td>
            </tr>
          `
        )
        .join("");

      this.renderPagination("users", payload.pagination || {}, (nextPage) => {
        this.usersQuery.page = nextPage;
        this.loadUsers();
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7">${error.message}</td></tr>`;
    }
  },

  async loadOrders() {
    const tbody = document.getElementById("orders-tbody");
    if (!tbody) {
      return;
    }

    const params = new URLSearchParams({
      page: String(this.ordersQuery.page),
      limit: String(this.ordersQuery.limit),
      status: this.ordersQuery.status,
      search: this.ordersQuery.search,
    });

    try {
      const payload = await this.fetchJson(`${API_BASE}/admin/orders?${params.toString()}`);
      this.orders = Array.isArray(payload.data) ? payload.data : [];

      tbody.innerHTML = this.orders
        .map(
          (order) => `
            <tr>
              <td>${order.order_number}</td>
              <td>${order.customer_name}</td>
              <td>${Number(order.total_amount || 0).toLocaleString("vi-VN")} VND</td>
              <td>
                <select id="order-status-${order.id}">
                  <option value="pending" ${order.status === "pending" ? "selected" : ""}>Chờ xử lý</option>
                  <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Đã xác nhận</option>
                  <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Đang giao</option>
                  <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Đã giao</option>
                  <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Đã hủy</option>
                </select>
              </td>
              <td>${order.payment_status}</td>
              <td>${new Date(order.created_at).toLocaleString("vi-VN")}</td>
              <td>
                <button class="btn btn-secondary" onclick="updateOrderStatus(${order.id})">Cập nhật</button>
              </td>
            </tr>
          `
        )
        .join("");

      this.renderPagination("orders", payload.pagination || {}, (nextPage) => {
        this.ordersQuery.page = nextPage;
        this.loadOrders();
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7">${error.message}</td></tr>`;
    }
  },

  async updateOrderStatus(orderId) {
    const statusSelect = document.getElementById(`order-status-${orderId}`);
    if (!statusSelect) {
      return;
    }

    try {
      await this.fetchJson(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusSelect.value,
        }),
      });
      Swal.fire("Thành công", "Cập nhật đơn hàng thành công", "success");
      await this.loadOrders();
      await this.loadDashboard();
    } catch (error) {
      Swal.fire("Lỗi", error.message, "error");
    }
  },

  renderPagination(scope, pagination, onPageChange) {
    const sectionId = scope === "users" ? "users-section" : scope === "admins" ? "admins-section" : "orders-section";
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    let pager = section.querySelector(".pagination-controls");
    if (!pager) {
      pager = document.createElement("div");
      pager.className = "pagination-controls";
      pager.style.marginTop = "12px";
      section.appendChild(pager);
    }

    const page = Number(pagination.page || 1);
    const limit = Number(pagination.limit || 10);
    const total = Number(pagination.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    pager.innerHTML = `
      <button class="btn btn-secondary" ${page <= 1 ? "disabled" : ""} id="${scope}-prev-page">Trước</button>
      <span style="margin:0 10px">Trang ${page} / ${totalPages} (tổng ${total})</span>
      <button class="btn btn-secondary" ${page >= totalPages ? "disabled" : ""} id="${scope}-next-page">Sau</button>
    `;

    const prevBtn = document.getElementById(`${scope}-prev-page`);
    const nextBtn = document.getElementById(`${scope}-next-page`);

    if (prevBtn) {
      prevBtn.onclick = () => onPageChange(page - 1);
    }
    if (nextBtn) {
      nextBtn.onclick = () => onPageChange(page + 1);
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "./admin-login.html";
  },
};

function showProductModal() {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form");
  const title = document.getElementById("product-modal-title");
  if (form) {
    form.reset();
  }
  document.getElementById("product-id").value = "";
  title.textContent = "Thêm sản phẩm mới";
  modal.style.display = "block";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function editProduct(productId) {
  const product = admin.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  document.getElementById("product-id").value = String(product.id);
  document.getElementById("product-title").value = product.title || "";
  document.getElementById("product-author").value = product.author || "";
  document.getElementById("product-price").value = product.price || 0;
  document.getElementById("product-original-price").value = product.original_price || 0;
  document.getElementById("product-category").value = String(product.category_id || "");
  document.getElementById("product-description").value = product.description || "";
  document.getElementById("product-image").value = product.image_url || "";
  document.getElementById("product-stock").value = product.stock_quantity || 0;

  document.getElementById("product-modal-title").textContent = "Cập nhật sản phẩm";
  document.getElementById("product-modal").style.display = "block";
}

async function deleteProduct(productId) {
  await admin.deleteProduct(productId);
}

function showCategoryModal() {
  const form = document.getElementById("category-form");
  if (form) {
    form.reset();
  }
  document.getElementById("category-id").value = "";
  document.getElementById("category-modal-title").textContent = "Thêm danh mục";
  document.getElementById("category-modal").style.display = "block";
}

function closeCategoryModal() {
  document.getElementById("category-modal").style.display = "none";
}

function editCategory(categoryId) {
  const category = admin.categories.find((item) => item.id === categoryId);
  if (!category) {
    return;
  }

  document.getElementById("category-id").value = String(category.id);
  document.getElementById("category-name").value = category.name || "";
  document.getElementById("category-description").value = category.description || "";
  document.getElementById("category-image").value = category.image_url || "";
  document.getElementById("category-modal-title").textContent = "Cập nhật danh mục";
  document.getElementById("category-modal").style.display = "block";
}

async function toggleAdminStatus(adminId, status) {
  await admin.updateAdminStatus(adminId, status);
}

async function deleteAdminAccount(adminId) {
  await admin.deleteAdminAccount(adminId);
}

async function deleteCategory(categoryId) {
  await admin.deleteCategory(categoryId);
}

function showPromotionModal() {
  document.getElementById("promotion-modal").style.display = "block";
}

function closePromotionModal() {
  document.getElementById("promotion-modal").style.display = "none";
}

function loadOrders() {
  admin.ordersQuery.page = 1;
  admin.loadOrders();
}

async function updateOrderStatus(orderId) {
  await admin.updateOrderStatus(orderId);
}

window.admin = admin;
window.showProductModal = showProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showCategoryModal = showCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.toggleAdminStatus = toggleAdminStatus;
window.deleteAdminAccount = deleteAdminAccount;
window.showPromotionModal = showPromotionModal;
window.closePromotionModal = closePromotionModal;
window.loadOrders = loadOrders;
window.updateOrderStatus = updateOrderStatus;

document.addEventListener("DOMContentLoaded", () => {
  void admin.init();
});

