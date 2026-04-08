// Prefer same-origin API so frontend and backend run on one server.
const API_BASE = `${window.location.origin}/api`;

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
const getToken = () => localStorage.getItem("token");

// Runs when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderUser();
  updateCartCount();
});

// Update header
function updateHeaderUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authDisplay = document.getElementById("auth-display");
  const userDropdown = document.getElementById("user-dropdown");

  if (!authDisplay || !userDropdown) return;

  if (user) {
    // Logged in - show profile menu
    authDisplay.innerHTML = `
      <i class="fas fa-user-circle" style="font-size:20px; color:#28a745"></i>
      <div class="user-info">
          <span style="font-weight:bold;">${user.name || "Khách"}</span>
          <small style="font-size:11px; color:#777">Tài khoản</small>
      </div>
    `;

    const adminMenuItem =
      user.role === "admin"
        ? `<a href="admin.html" class="menu-link"><i class="fas fa-tools"></i> Quản trị hệ thống</a>`
        : "";

    userDropdown.innerHTML = `
      <a href="pages/profile.html" class="menu-link">
        <i class="fas fa-user-circle"></i> Hồ sơ của tôi
      </a>
      <a href="pages/profile.html#orders" class="menu-link">
        <i class="fas fa-shopping-bag"></i> Đơn hàng
      </a>
      <a href="pages/wishlist.html" class="menu-link">
        <i class="fas fa-heart"></i> Yêu thích
      </a>
      ${adminMenuItem}
      <hr style="margin: 5px 0; border-color: #eee;">
      <a href="javascript:void(0)" class="menu-link" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Đăng xuất
      </a>
    `;
  } else {
    // Not logged in
    authDisplay.innerHTML = `
      <i class="far fa-user"></i>
      <div class="user-info">
          <span style="font-weight:bold; font-size:13px">Tài khoản</span>
          <small style="font-size:11px; color:#777">Đăng nhập / Đăng ký</small>
      </div>
    `;

    userDropdown.innerHTML = `
      <a href="pages/login.html" class="menu-link">
        <i class="fas fa-sign-in-alt"></i> Đăng nhập
      </a>
      <a href="pages/register.html" class="menu-link">
        <i class="fas fa-user-plus"></i> Đăng ký
      </a>
    `;
  }
}
// Update cart count
async function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const token = getToken();
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

    // fallback cart
    const cartItems = data.data || data.cart || [];
    const count = Array.isArray(cartItems) ? cartItems.length : 0;

    badge.innerText = count;
    badge.style.display = count > 0 ? "block" : "none";
  } catch (e) {
    console.error("Error loading cart:", e);
    badge.innerText = "0";
    badge.style.display = "none";
  }
}
// Đăng xuất
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
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Refresh header
      updateHeaderUser();
      updateCartCount();

      // Show confirmation
      Swal.fire({
        title: "Đã đăng xuất",
        text: "Bạn đã đăng xuất thành công.",
        icon: "success",
        confirmButtonColor: "#C92127",
        timer: 1500,
      }).then(() => {
        // Quay lại trang chủ
        window.location.href = "index.html";
      });
    }
  });
}

