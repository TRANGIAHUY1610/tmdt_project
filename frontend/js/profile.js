// js/profile.js
let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  loadHeaderAndFooter();
  loadUserProfile();
  openTabFromHash();
});

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    Swal.fire({
      title: "Cần đăng nhập",
      text: "Bạn cần đăng nhập để truy cập trang này.",
      icon: "warning",
      confirmButtonText: "Đi tới đăng nhập",
      confirmButtonColor: "#C92127",
    }).then((result) => {
      window.location.href = "login.html";
    });
    return false;
  }

  currentUser = JSON.parse(user);
  return true;
}

// Load header and footer
function loadHeaderAndFooter() {
  // Load header
  const headerHTML = `
        <header class="header">
            <div class="container header-container">
                <a href="../index.html" class="logo">
                    <i class="fas fa-product-open"></i> GYMSTORE
                </a>

                <div class="search-box" style="position: relative">
                    <input type="text" placeholder="Search products...">
                    <button class="sreach-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <div class="header-icons">
                    <a href="../pages/cart.html" class="icon-item cart-link">
                        <div class="icon-wrap" style="position: relative">
                            <i class="fas fa-shopping-cart"></i>
                            <span id="cart-count" class="badge-count">0</span>
                        </div>
                        <span>Giỏ hàng</span>
                    </a>

                    <div class="icon-item dropdown">
                        <div id="auth-display" class="user-link">
                            <i class="fas fa-user-circle" style="font-size:20px; color:#28a745"></i>
                            <div class="user-info">
                                <span style="font-weight:bold;">${
                                  currentUser?.name || "Khách"
                                }</span>
                            </div>
                        </div>
                        <div class="dropdown-menu user-menu">
                            <a href="profile.html" class="menu-link">
                                <i class="fas fa-user-circle"></i> Hồ sơ của tôi
                            </a>
                            <a href="javascript:void(0)" class="menu-link" onclick="logout()">
                                <i class="fas fa-sign-out-alt"></i> Đăng xuất
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;

  document.getElementById("header-placeholder").innerHTML = headerHTML;
  updateCartCount();
}

// Load user profile
async function loadUserProfile() {
  if (!checkAuth()) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Không thể tải thông tin tài khoản");

    const data = await response.json();

    if (data.success) {
      updateProfileDisplay(data.user);
      loadDashboardData();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Profile error:", error);
    Swal.fire("Lỗi", "Không thể tải dữ liệu hồ sơ.", "error");
  }
}

// Update profile display
function updateProfileDisplay(user) {
  document.getElementById("user-name").textContent =
    user.name || "Guest";

  // Avatar
  const avatar = document.getElementById("user-avatar");
  if (user.avatar) {
    avatar.src = user.avatar.startsWith("http")
      ? user.avatar
      : `${API_BASE}${user.avatar}`;
  } else {
    avatar.src = "../img/default-avatar.png";
  }

  // Points and membership
  document.getElementById("loyalty-points").textContent =
    user.loyalty_points || 0;
  document.getElementById("loyalty-points-display").textContent =
    user.loyalty_points || 0;

  // Update form values
  document.getElementById("full-name").value = user.name || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone_number || "";
  document.getElementById("birthday").value = user.date_of_birth || "";
  document.getElementById("gender").value = user.gender || "";

  // Update membership level
  updateMembershipLevel(user.loyalty_points);
}

// Update membership level
function updateMembershipLevel(points) {
  const membershipLevel = document.getElementById("membership-level");
  points = points || 0;

  if (points >= 1000) {
    membershipLevel.textContent = "Thành viên VIP";
    membershipLevel.style.background =
      "linear-gradient(45deg, #FF0000, #FF4500)";
  } else if (points >= 500) {
    membershipLevel.textContent = "Hạng Vàng";
    membershipLevel.style.background =
      "linear-gradient(45deg, #FFD700, #FFA500)";
  } else if (points >= 100) {
    membershipLevel.textContent = "Hạng Bạc";
    membershipLevel.style.background =
      "linear-gradient(45deg, #C0C0C0, #808080)";
  } else {
    membershipLevel.textContent = "Thành viên";
    membershipLevel.style.background =
      "linear-gradient(45deg, #808080, #A9A9A9)";
  }
}

// Switch tab
function switchTab(tabName, navItem = null) {
  // Hide all tab content
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Clear active state from all tab items
  document.querySelectorAll(".profile-nav li").forEach((item) => {
    item.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName).classList.add("active");

  // Active tab item
  const activeNavItem =
    navItem || document.querySelector(`.profile-nav li[onclick="switchTab('${tabName}', this)"]`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }

  // Keep URL in sync so direct links can open the same tab
  if (window.location.hash !== `#${tabName}`) {
    history.replaceState(null, "", `#${tabName}`);
  }

  // Load tab data
  switch (tabName) {
    case "dashboard":
      loadDashboardData();
      break;
    case "orders":
      loadOrders();
      break;
    case "addresses":
      loadAddresses();
      break;
    case "wishlist":
      loadWishlist();
      break;
  }
}

function openTabFromHash() {
  const hash = (window.location.hash || "").replace("#", "").trim();
  const validTabs = ["dashboard", "info", "orders", "addresses", "wishlist", "password"];
  if (!hash || !validTabs.includes(hash)) {
    return;
  }

  const navItem = document.querySelector(`.profile-nav li[onclick="switchTab('${hash}', this)"]`);
  switchTab(hash, navItem);
}

// Tai dashboard data
async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    const [ordersRes, wishlistRes] = await Promise.all([
      fetch(`${API_BASE}/profile/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/profile/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const ordersData = await ordersRes.json();
    const wishlistData = await wishlistRes.json();

    // Cap nhat stats
    document.getElementById("total-orders").textContent = ordersData.success
      ? ordersData.data.length
      : 0;
    document.getElementById("total-wishlist").textContent = wishlistData.success
      ? wishlistData.data.length
      : 0;

    // Show recent orders
    if (ordersData.success && ordersData.data.length > 0) {
      const recentOrders = ordersData.data.slice(0, 3);
      renderRecentOrders(recentOrders);
    } else {
      document.getElementById("recent-orders").innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Chưa có đơn hàng gần đây.</p>
                    <a href="../index.html" class="btn-save" style="margin-top: 15px;">
                      <i class="fas fa-shopping-cart"></i> Mua ngay
                    </a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

// Hiifn thi< i'n hAng gan i'Ay
function renderRecentOrders(orders) {
  const container = document.getElementById("recent-orders");
  const html = orders
    .map(
      (order) => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <strong>Mã đơn: #${order.order_number || order.id}</strong>
                    <div style="font-size: 12px; color: #666;">${new Date(
                      order.created_at
                    ).toLocaleDateString("vi-VN")}</div>
                </div>
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="order-items">
                ${order.items
                  .slice(0, 2)
                  .map(
                    (item) => `
                    <img src="${item.image_url || "../img/default-product.jpg"}" 
                         alt="${item.title}" 
                         class="order-item-img"
                         onerror="this.src='../img/default-product.jpg'">
                `
                  )
                  .join("")}
                ${
                  order.items.length > 2
                    ? `<div style="align-self: center; color: #666; font-size: 12px;">
                        +${order.items.length - 2} sản phẩm khác
                    </div>`
                    : ""
                }
            </div>
            <div class="order-footer">
                <div><strong>Tổng tiền: ${formatMoney(
                  order.total_amount
                )}</strong></div>
                <button class="btn-save" style="padding: 8px 16px; font-size: 12px;" 
                        onclick="viewOrderDetail('${order.id}')">
                Chi tiết
                </button>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = html;
}

// Tai tat ca i'n hAng
async function loadOrders() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success && data.data.length > 0) {
      renderAllOrders(data.data);
    } else {
      document.getElementById("orders-list").innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Chưa có đơn hàng nào.</p>
                    <a href="../index.html" class="btn-save" style="margin-top: 15px;">
                        <i class="fas fa-shopping-cart"></i> Mua ngay
                    </a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Orders error:", error);
    document.getElementById("orders-list").innerHTML =
      "<p>Lỗi tải đơn hàng.</p>";
  }
}

// Hiifn thi< tat ca i'n hAng
function renderAllOrders(orders) {
  const container = document.getElementById("orders-list");

  const html = orders
    .map(
      (order) => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <strong>Mã đơn: #${order.order_number || order.id}</strong>
                    <div style="font-size: 12px; color: #666;">
                        ${new Date(order.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                    </div>
                </div>
                <span class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="order-items">
                ${order.items
                  .map(
                    (item) => `
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px; width: 100%;">
                        <img src="${
                          item.image_url || "../img/default-product.jpg"
                        }" 
                             alt="${item.title}" 
                             class="order-item-img"
                             onerror="this.src='../img/default-product.jpg'">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 14px;">${
                              item.title
                            }</div>
                            <div style="font-size: 12px; color: #666;">Số lượng: ${
                              item.quantity
                            }</div>
                            <div style="color: #C92127; font-weight: bold; font-size: 14px;">
                                ${formatMoney(item.price)}
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="order-footer">
                <div><strong>Tổng tiền: ${formatMoney(
                  order.total_amount
                )}</strong></div>
                <div>
                    <button class="btn-save" style="padding: 8px 16px; font-size: 12px; margin-right: 10px;" 
                            onclick="viewOrderDetail('${order.id}')">
                        Chi tiết
                    </button>
                    ${
                      order.status === "pending"
                        ? `<button class="btn-save" style="padding: 8px 16px; font-size: 12px; background: #dc3545;" 
                                onclick="cancelOrder('${order.id}')">
                            Hủy đơn
                        </button>`
                        : ""
                    }
                </div>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = html;
}

// Tai i'i<a chi?
async function loadAddresses() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success && data.data.length > 0) {
      renderAddresses(data.data);
    } else {
      document.getElementById("addresses-list").innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-map-marker-alt"></i>
              <p>Chưa có địa chỉ nào.</p>
                    <button class="btn-save" onclick="showAddAddressForm()" style="margin-top: 15px;">
                <i class="fas fa-plus"></i> Thêm địa chỉ
                    </button>
                </div>
            `;
    }
  } catch (error) {
    console.error("Addresses error:", error);
  }
}

// Tai wishlist
async function loadWishlist() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success && data.data.length > 0) {
      renderWishlist(data.data);
    } else {
      document.getElementById("wishlist-items").innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-heart"></i>
              <p>Chưa có sản phẩm yêu thích nào.</p>
                    <a href="../index.html" class="btn-save" style="margin-top: 15px;">
                <i class="fas fa-dumbbell"></i> Khám phá sản phẩm
                    </a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Wishlist error:", error);
  }
}

// Hiifn thi< wishlist
function renderWishlist(wishlistItems) {
  const container = document.getElementById("wishlist-items");

  const html = wishlistItems
    .map((item) => {
      const product = item.product || item;
      return `
            <div class="wishlist-item product-card">
                <button class="btn-remove-wishlist" onclick="removeFromWishlist(${
                  product.id
                })">
                    <i class="fas fa-times"></i>
                </button>
                <a href="../pages/detail.html?id=${product.id}">
                    <img src="${product.image_url || "../img/default-product.jpg"}" 
                         alt="${product.title}" 
                         style="width: 100%; height: 200px; object-fit: contain;"
                         onerror="this.src='../img/default-product.jpg'">
                </a>
                <div style="padding: 10px;">
                    <a href="../pages/detail.html?id=${
                      product.id
                    }" style="text-decoration: none; color: inherit;">
                        <h4 style="font-size: 14px; margin: 0 0 5px; height: 40px; overflow: hidden; line-height: 1.4;">
                            ${product.title}
                        </h4>
                    </a>
                    <div style="color: #C92127; font-weight: bold; font-size: 16px; margin: 8px 0;">
                        ${formatMoney(product.price)}
                    </div>
                    <button class="btn-add-cart" onclick="addToCartFromWishlist(${
                      product.id
                    })" 
                            style="width: 100%; margin-top: 10px;">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;
    })
    .join("");

  container.innerHTML = html;
}

// Cap nhat profile
async function updateProfile(event) {
  event.preventDefault();

  if (!checkAuth()) return;

  const formData = {
    name: document.getElementById("full-name").value,
    phone_number: document.getElementById("phone").value,
    date_of_birth: document.getElementById("birthday").value,
    gender: document.getElementById("gender").value,
  };

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire(
        "Thành công",
        data.message || "Đã cập nhật hồ sơ thành công",
        "success"
      );
      // Cap nhat localStorage vA hiifn thi<
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      updateProfileDisplay(updatedUser);
    } else {
      Swal.fire("Lỗi", data.message || "Cập nhật hồ sơ thất bại", "error");
    }
  } catch (error) {
    console.error("Update profile error:", error);
    Swal.fire("Lỗi", "Không thể cập nhật hồ sơ.", "error");
  }
}

// Upload avatar
async function uploadAvatar(file) {
  if (!file) return;
  if (!checkAuth()) return;

  // Kiifm tra kAch thi>c file (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire("Lỗi", "Dung lượng tệp phải nhỏ hơn 5MB.", "error");
    return;
  }

  // Kiifm tra loai file
  if (!file.type.startsWith("image/")) {
    Swal.fire("Lỗi", "Vui lòng chọn tệp hình ảnh.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("user-avatar").src = data.avatar.startsWith(
        "http"
      )
        ? data.avatar
        : `${API_BASE}${data.avatar}`;
      // Cap nhat localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      user.avatar = data.avatar;
      localStorage.setItem("user", JSON.stringify(user));
      Swal.fire(
        "Thành công",
        data.message || "Đã cập nhật ảnh đại diện",
        "success"
      );
    } else {
      Swal.fire("Lỗi", data.message || "Không thể tải ảnh lên.", "error");
    }
  } catch (error) {
    console.error("Upload avatar error:", error);
    Swal.fire("Lỗi", "Không thể tải ảnh lên.", "error");
  }
}

// Ai.i mat khau
async function changePassword(event) {
  event.preventDefault();
  if (!checkAuth()) return;

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (newPassword !== confirmPassword) {
    Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp.", "error");
    return;
  }

  if (newPassword.length < 6) {
    Swal.fire("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire(
        "Thành công",
        data.message || "Đã đổi mật khẩu thành công",
        "success"
      );
      document.getElementById("password-form").reset();
    } else {
      Swal.fire("Lỗi", data.message || "Đổi mật khẩu thất bại", "error");
    }
  } catch (error) {
    console.error("Change password error:", error);
    Swal.fire("Lỗi", "Không thể đổi mật khẩu.", "error");
  }
}

// XAa khai wishlist
async function removeFromWishlist(productId) {
  if (!checkAuth()) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/profile/wishlist/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire(
        "Thành công",
        data.message || "Đã xóa khỏi danh sách yêu thích",
        "success"
      );
      loadWishlist(); // Reload wishlist
      loadDashboardData(); // Update stats
    } else {
      Swal.fire(
        "Lỗi",
        data.message || "Không thể xóa khỏi danh sách yêu thích",
        "error"
      );
    }
  } catch (error) {
    console.error("Remove wishlist error:", error);
    Swal.fire("Lỗi", "Không thể xóa khỏi danh sách yêu thích", "error");
  }
}

// ThAm vAo gia hAng ta wishlist
async function addToCartFromWishlist(productId) {
  if (!checkAuth()) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: productId, quantity: 1 }),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        title: "Thành công!",
        text: "Đã thêm vào giỏ hàng",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      updateCartCount();
    } else {
      Swal.fire("Lỗi", data.message || "Không thể thêm vào giỏ hàng.", "error");
    }
  } catch (error) {
    console.error("Lỗi thêm vào giỏ hàng:", error);
    Swal.fire("Lỗi", "Không thể thêm vào giỏ hàng.", "error");
  }
}

// HAm hi- tra
function getStatusText(status) {
  const statusMap = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    shipped: "Đang giao",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
}

// Cap nhat si' lang gia hAng
async function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const token = localStorage.getItem("token");
  if (!token) {
    badge.innerText = "0";
    badge.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const count = data.summary?.total_items || 0;
    badge.innerText = count;
    badge.style.display = count > 0 ? "block" : "none";
  } catch (err) {
    console.error("Giỏ hàng count update error:", err);
    badge.innerText = "0";
    badge.style.display = "none";
  }
}

// Logout
function logout() {
  Swal.fire({
    title: "Đăng xuất?",
    text: "Bạn có chắc chắn muốn đăng xuất không?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#C92127",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "../index.html";
    }
  });
}

// Placeholder functions - can implement chi tiat
function showAddAddressForm() {
  Swal.fire("Thông báo", "Biểu mẫu địa chỉ chưa được triển khai.", "info");
}

function viewOrderDetail(orderId) {
  Swal.fire(
    "Thông báo",
    `Chi tiết đơn hàng #${orderId} chưa được triển khai.`,
    "info"
  );
}

function cancelOrder(orderId) {
  Swal.fire({
    title: "Hủy đơn hàng?",
    text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Hủy đơn",
    cancelButtonText: "Giữ lại",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        "Thông báo",
        `Đã hủy đơn hàng #${orderId} - tính năng đang phát triển`,
        "info"
      );
    }
  });
}



