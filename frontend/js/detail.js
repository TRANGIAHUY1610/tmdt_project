// fe/js/detail.js

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
let currentRating = 0;

// Resolve the API base URL
const BASE_URL =
  typeof API_BASE !== "undefined" ? API_BASE : "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  if (!productId) {
    Swal.fire({
      title: "Lỗi",
      text: "Không tìm thấy sản phẩm.",
      icon: "error",
    }).then(() => {
      window.location.href = "../index.html";
    });
    return;
  }

  loadProductDetail();
  loadReviews();
});

// 1. Tai chi tiat sAch
async function loadProductDetail() {
  const container = document.getElementById("detail-content");
  const reviewSection = document.getElementById("review-section");

  try {
    const res = await fetch(`${BASE_URL}/products/${productId}`);
    const data = await res.json();

    if (data.success) {
      const product = data.data;
      const formatMoney = (val) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val);
      const originalPrice = product.original_price || product.price * 1.2;
      const discount = Math.round(
        ((originalPrice - product.price) / originalPrice) * 100
      );

      // Render detail layout
      container.innerHTML = `
                <div class="product-detail-layout">
                    <div class="detail-left">
                        <img src="${product.image_url}" alt="${
        product.title
      }" onerror="this.src='https://via.placeholder.com/400x400?text=Updated+image'">
                    </div>
                    <div class="detail-right">
                        <h1 class="detail-title">${product.title}</h1>
                        <div class="detail-meta">
                            Nhà cung cấp: <span>GymStore</span> | 
                            Tác giả: <span>${product.author}</span>
                        </div>
                        
                        <div class="detail-price-box">
                            <span class="d-price-current">${formatMoney(
                              product.price
                            )}</span>
                            <span class="d-price-old">${formatMoney(
                              originalPrice
                            )}</span>
                            <span class="d-discount-badge">-${discount}%</span>
                        </div>

                        <div style="margin-bottom: 25px; line-height: 1.6; color: #555; font-size: 15px;">
                            <strong>Mô tả:</strong><br>
                            <div style="margin-top: 10px;">${
                              product.description ||
                              "Mô tả sản phẩm đang được cập nhật..."
                            }</div>
                        </div>

                        <button class="btn-buy-now" onclick="addToCart(${
                          product.id
                        })">
                            <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            `;

      // Show reviews after the product loads
      reviewSection.style.display = "block";
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:50px; color:red;"><h3>Không tìm thấy sản phẩm.</h3></div>';
    }
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div style="text-align:center; padding:50px; color:red;"><h3>Đã xảy ra lỗi máy chủ.</h3><p>Vui lòng kiểm tra backend.</p></div>';
  }
}

// Handle rating selection
function selectStar(n) {
  currentRating = n;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`s${i}`);
    if (i <= n) star.classList.add("active");
    else star.classList.remove("active");
  }
  const labels = ["", "Rất tệ", "Tệ", "Trung bình", "Tốt", "Xuất sắc"];
  document.getElementById("rating-text").innerText = `(${labels[n]})`;
}

// Submit review
async function submitReview() {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire("Cảnh báo", "Vui lòng đăng nhập để gửi đánh giá.", "warning");
    return;
  }
  if (currentRating === 0) {
    Swal.fire("Cảnh báo", "Vui lòng chọn số sao đánh giá.", "warning");
    return;
  }
  const comment = document.getElementById("comment-input").value.trim();
  if (comment.length < 10) {
    Swal.fire(
      "Nội dung quá ngắn",
      "Vui lòng nhập ít nhất 10 ký tự.",
      "warning"
    );
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: currentRating, comment }),
    });

    if (res.ok) {
      Swal.fire("Thành công", "Cảm ơn bạn đã đánh giá!", "success");
      loadReviews(); // Tai lai danh sAch
      document.getElementById("comment-input").value = "";
      selectStar(0);
    } else {
      const data = await res.json();
      Swal.fire("Lỗi", data.message || "Đã xảy ra lỗi.", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Đã xảy ra lỗi máy chủ.", "error");
  }
}

// Load reviews
async function loadReviews() {
  const container = document.getElementById("reviews-list");
  try {
    const res = await fetch(`${BASE_URL}/products/${productId}/reviews`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = data.data
        .map(
          (r) => `
                <div class="user-review-item">
                    <div class="avatar-circle">${
                      r.user_name ? r.user_name.charAt(0).toUpperCase() : "K"
                    }</div>
                    <div class="review-content">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <span class="review-author">${
                              r.user_name || "Guest"
                            }</span>
                            <span class="review-time">${new Date(
                              r.created_at
                            ).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div class="star-display">${renderStars(r.rating)}</div>
                        <div class="comment-text">${r.comment}</div>
                    </div>
                </div>
            `
        )
        .join("");
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:30px; color:#999; background:#fafafa; border-radius:8px;">Sản phẩm này chưa có đánh giá nào.</div>';
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div style="color:red;">Không thể tải đánh giá.</div>';
  }
}

// Helper: Va sao
function renderStars(n) {
  let html = "";
  for (let i = 1; i <= 5; i++)
    html +=
      i <= n ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
  return html;
}

// HAm thAm gia hAng (Can i'am bao backend cA API nAy)
async function addToCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Cần đăng nhập",
      text: "Bạn cần đăng nhập trước khi mua hàng.",
      icon: "warning",
      confirmButtonText: "Đi đến đăng nhập",
      confirmButtonColor: "#C92127",
    });
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.ok) {
      Swal.fire({
        title: "Thành công",
        text: "Đã thêm vào giỏ hàng.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      // Nau cA hAm cap nhat icon gia hAng thA gai iY i'Ay
      // if(typeof updateCartCount === 'function') updateCartCount();
    } else {
      Swal.fire("Lỗi", "Không thể thêm vào giỏ hàng.", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Đã xảy ra lỗi máy chủ.", "error");
  }
}


