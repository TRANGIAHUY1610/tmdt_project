

// 1. Load'iTng chay khi tai trang
document.addEventListener("DOMContentLoaded", () => {
  console.log("Loading cart page...");
  loadCart();
});

// 2. Tai da lii?u gia hAng
async function loadCart() {
  const token = getToken();

  // Check login
  if (!token) {
    alert("Bạn chưa đăng nhập. Đang chuyển hướng...");
    window.location.href = "login.html";
    return;
  }

  try {
    console.log("Calling cart API...");
    const res = await fetch(`${API_BASE}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    console.log("Cart data received from server:", result);

    // Xa lA da lii?u tra va (chap nhan ca 2 cau trAc)
    // Trang hap 1: result lA mang trac tiap [item1, item2]
    // Trang hap 2: result lA object { success: true, data: [...] }
    let items = [];
    if (Array.isArray(result)) {
      items = result;
    } else if (result.data && Array.isArray(result.data)) {
      items = result.data;
    } else if (result.cartItems) {
      items = result.cartItems;
    }

    renderCart(items);
  } catch (err) {
    console.error("Error loading cart:", err);
    alert("Lỗi kết nối máy chủ!");
  }
}

// 3. Hiifn thi< lAn mAn hAnh (Logic quan trang nhat)
function renderCart(items) {
  const tbody = document.getElementById("cart-items-body");
  const cartContent = document.getElementById("cart-content"); // Container chaa bang
  const emptyMsg = document.getElementById("empty-msg"); // Empty message
  const totalEl = document.getElementById("cart-total-price");

  // Skip rendering if required elements are missing
  if (!tbody) return;

  // Check empty cart
  if (!items || items.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  }

  // Show table, hide empty notice
  if (cartContent) cartContent.style.display = "block";
  if (emptyMsg) emptyMsg.style.display = "none";

  let totalAmount = 0;

  // Tao HTML cho tang dAng
  const html = items
    .map((item) => {
      // Smart field fallback logic
      const id = item.product_id || item.productId || item.id || item.ProductId;
      const title =
        item.title || item.Title || item.product_title || "Sản phẩm chưa có tên";
      const price = item.price || item.Price || 0;
      const quantity = item.quantity || item.Quantity || 1;
      const image =
        item.image_url ||
        item.ImageURL ||
        item.image ||
        "https://via.placeholder.com/60";
      const author = item.author || item.Author || "Đang cập nhật";

      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <img src="${image}" style="width:60px; height:80px; object-fit:cover; border-radius:4px;">
                        <div>
                            <strong style="font-size:1.1em;">${title}</strong><br>
                            <span style="color:#666; font-size:0.9em;">${author}</span>
                        </div>
                    </div>
                </td>
                <td style="vertical-align: middle;">${formatMoney(price)}</td>
                <td style="vertical-align: middle;">
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button class="qty-btn" onclick="updateQty(${id}, ${
        quantity - 1
      })">-</button>
                        <span style="font-weight:bold; min-width:30px; text-align:center;">${quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${id}, ${
        quantity + 1
      })">+</button>
                    </div>
                </td>
                <td style="vertical-align: middle; color:#d63031; font-weight:bold;">
                    ${formatMoney(itemTotal)}
                </td>
                <td style="vertical-align: middle;">
                    <button onclick="removeItem(${id})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2em;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML = html;
  if (totalEl) totalEl.innerText = `Tổng tiền: ${formatMoney(totalAmount)}`;
}

// 4. Cap nhat si' lang
async function updateQty(productId, newQty) {
  if (newQty < 1) return; // Not giam di>i 1 (hoac cA thif hai xAa)

  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/cart/update/${productId}`, {
      // API /cart/update on backend
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });

    // Reload cart after update
    loadCart();
  } catch (err) {
    console.error("Update error:", err);
    alert("Không thể cập nhật số lượng");
  }
}

// 5. XAa san pham
async function removeItem(productId) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/cart/remove/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadCart();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Lỗi khi xóa sản phẩm");
  }
}

// 6. Thanh toAn
function checkout() {
  // Placeholder checkout flow
  alert("Tính năng thanh toán sẽ sớm ra mắt!");
}

// ===============================
// 🔥 AUTO FIX CART EMPTY (KHÔNG ĐỤNG CODE CŨ)
// ===============================

async function forceCheckCartEmpty() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/cart`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const result = await res.json();
    const items = result.data || result;

    const emptyMsg = document.getElementById("empty-msg");
    const cartContent = document.getElementById("cart-content");

    if (!items || items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = "block";
      if (cartContent) cartContent.style.display = "none";
    }
  } catch (err) {
    console.error("Force check cart error:", err);
  }
}

// 🔥 chạy sau khi load xong
window.addEventListener("load", () => {
  setTimeout(forceCheckCartEmpty, 500);
});
