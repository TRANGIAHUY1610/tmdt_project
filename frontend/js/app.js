class ProductstoreApp {
  constructor() {
    this.currentPage = 1;
    this.currentCategory = "";
    this.currentSearch = "";
    this.init();
  }

  async init() {
    // Initialize cart count
    Cart.updateCartCount();

    // Load initial data
    await this.loadCategories();
    await this.loadProducts();

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener(
      "input",
      this.debounce(() => {
        this.currentSearch = searchInput.value;
        this.currentPage = 1;
        this.loadProducts();
      }, 500)
    );

    // Category filter
    const categoryFilter = document.getElementById("category-filter");
    categoryFilter.addEventListener("change", () => {
      this.currentCategory = categoryFilter.value;
      this.currentPage = 1;
      this.loadProducts();
    });

    // Load more button
    const loadMoreBtn = document.getElementById("load-more-btn");
    loadMoreBtn.addEventListener("click", () => {
      this.currentPage++;
      this.loadProducts(true);
    });

    // Modal close
    const modal = document.getElementById("product-modal");
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async loadCategories() {
    try {
      const response = await ProductstoreAPI.getCategories();
      if (response.success) {
        this.renderCategories(response.data);
        this.renderCategoryFilter(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async loadProducts(append = false) {
    try {
      const params = {
        page: this.currentPage,
        limit: 8,
      };

      if (this.currentCategory) {
        params.category_id = this.currentCategory;
      }

      if (this.currentSearch) {
        params.search = this.currentSearch;
      }

      const response = await ProductstoreAPI.getProducts(params);

      if (response.success) {
        if (append) {
          this.appendProducts(response.data);
        } else {
          this.renderProducts(response.data);
        }

        // Show/hide load more button
        const loadMoreBtn = document.getElementById("load-more-btn");
        const hasMore = this.currentPage < response.pagination.total;
        loadMoreBtn.style.display = hasMore ? "block" : "none";
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  renderCategories(categories) {
    const container = document.getElementById("categories-list");
    container.innerHTML = categories
      .map(
        (category) => `
            <div class="category-card" onclick="app.showProductsByCategory(${category.id})">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <span class="product-count">${category.product_count} products</span>
            </div>
        `
      )
      .join("");
  }

  renderCategoryFilter(categories) {
    const filter = document.getElementById("category-filter");
    filter.innerHTML = `
            <option value="">All categories</option>
            ${categories
              .map(
                (category) => `
                <option value="${category.id}">${category.name}</option>
            `
              )
              .join("")}
        `;
  }

  renderProducts(products) {
    const container = document.getElementById("products-list");
    container.innerHTML = products
      .map((product) => this.createProductCard(product))
      .join("");
  }

  appendProducts(products) {
    const container = document.getElementById("products-list");
    container.innerHTML += products
      .map((product) => this.createProductCard(product))
      .join("");
  }

  createProductCard(product) {
    return `
            <div class="product-card">
                <div class="product-image">
                    ${
                      product.image_url
                        ? `<img src="${product.image_url}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                        : '<i class="fas fa-dumbbell" style="font-size: 3rem; color: #999;"></i>'
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-author">${product.author}</p>
                    <p class="product-author">${product.category_name || ""}</p>
                    <div class="product-price">${this.formatPrice(
                      product.price
                    )}</div>
                    <div class="product-actions">
                        <button class="btn-secondary" onclick="app.showProductDetail(${
                          product.id
                        })">
                        Xem chi tiết
                        </button>
                        <button class="btn-add-cart" onclick="app.addToCart(${
                          product.id
                        })">
                        Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  async showProductDetail(productId) {
    try {
      const response = await ProductstoreAPI.getProductById(productId);
      if (response.success) {
        this.renderProductDetail(response.data);
      }
    } catch (error) {
      console.error("Error loading product detail:", error);
    }
  }

  renderProductDetail(product) {
    const container = document.getElementById("product-detail");
    container.innerHTML = `
            <div class="product-detail">
                <h2>${product.title}</h2>
                <p><strong>Thương hiệu:</strong> ${product.author}</p>
                <p><strong>Danh mục:</strong> ${
                  product.category_name || "N/A"
                }</p>
                <p><strong>Giá:</strong> ${this.formatPrice(product.price)}</p>
                <p><strong>Mô tả:</strong> ${
                  product.description || "Chưa có mô tả"
                }</p>
                <p><strong>Tồn kho:</strong> ${
                  product.stock_quantity
                }</p>
                <div style="margin-top: 2rem;">
                    <button class="btn-add-cart" onclick="app.addToCart(${
                      product.id
                    })" style="padding: 1rem 2rem;">
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;

    document.getElementById("product-modal").style.display = "block";
  }

  async showProductsByCategory(categoryId) {
    this.currentCategory = categoryId;
    this.currentPage = 1;
    document.getElementById("category-filter").value = categoryId;
    await this.loadProducts();

    // Scroll to products section
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  }

  async addToCart(productId) {
    try {
      const response = await ProductstoreAPI.getProductById(productId);
      if (response.success) {
        Cart.addToCart(response.data);
        this.showNotification("Đã thêm vào giỏ hàng!", "success");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showNotification("Không thể thêm vào giỏ hàng!", "error");
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === "success" ? "#2c5530" : "#dc3545"};
            color: white;
            border-radius: 5px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Navigation function
function showProductsSection() {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new ProductstoreApp();
});

