let cartTotal = 0;
const SHIPPING_FEE = 30000;

let currentOrderId = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để thanh toán!");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    document.getElementById("customer-name").value = user.name;
  }

  loadCheckoutCart();
  setupPaymentToggle();
});

async function loadCheckoutCart() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    const items = Array.isArray(result) ? result : result.data || [];

    if (items.length === 0) {
      alert("Giỏ hàng đang trống!");
      window.location.href = "../index.html";
      return;
    }

    renderOrderSummary(items);
  } catch (err) {
    console.error(err);
  }
}

function renderOrderSummary(items) {
  const container = document.getElementById("order-items-list");
  let html = "";
  cartTotal = 0;

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  items.forEach((item) => {
    const total = (item.price || 0) * item.quantity;
    cartTotal += total;

    html += `
      <div class="mini-item">
        <span>${item.quantity}x</span>
        <span>${item.title}</span>
        <span>${formatMoney(total)}</span>
      </div>
    `;
  });

  container.innerHTML = html;

  document.getElementById("sub-total").innerText = formatMoney(cartTotal);
  document.getElementById("shipping-fee").innerText = formatMoney(SHIPPING_FEE);
  document.getElementById("final-total").innerText = formatMoney(
    cartTotal + SHIPPING_FEE
  );
}

// ===============================
// 🔥 QR LOGIC
// ===============================
function setupPaymentToggle() {
  const radios = document.querySelectorAll('input[name="payment"]');
  const qrSection = document.getElementById("qr-section");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "banking" && radio.checked) {
        generateQR();
        qrSection.style.display = "block";
      } else {
        qrSection.style.display = "none";
      }
    });
  });
}

function generateQR() {
  const total = cartTotal + SHIPPING_FEE;

  currentOrderId = "DH" + Date.now();

  document.getElementById("qr-content").innerText = currentOrderId;

  const qrUrl = `https://img.vietqr.io/image/MB-123456789-compact.png?amount=${total}&addInfo=${currentOrderId}`;

  document.getElementById("qr-image").src = qrUrl;
}

// ===============================
// 🔥 XÁC NHẬN THANH TOÁN QR
// ===============================
async function confirmPaid() {
  const token = localStorage.getItem("token");

  // 👉 lấy dữ liệu form
  const name = document.getElementById("customer-name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const note = document.getElementById("note").value;

  if (!currentOrderId) {
    alert("Vui lòng quét QR trước!");
    return;
  }

  const fullAddress = `${name} (${phone}) - ${address}`;

  const orderData = {
    shipping_address: fullAddress,
    customer_note: note,
    payment_method: "banking",
    shipping_fee: SHIPPING_FEE,
    total_amount: cartTotal + SHIPPING_FEE,
    order_code: currentOrderId,
  };

  try {
    await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    alert("Thanh toán thành công! Đơn hàng đã được ghi nhận.");

    // 👉 quay về trang chủ
    window.location.href = "../index.html";

  } catch (err) {
    console.error(err);
    alert("Lỗi khi xác nhận thanh toán!");
  }
}

// ===============================
// 🛒 CHECKOUT (COD)
// ===============================
async function handleCheckout(e) {
  e.preventDefault();

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  // 👉 nếu chọn QR thì KHÔNG dùng nút đặt hàng
  if (paymentMethod === "banking") {
    alert("Vui lòng quét QR và bấm 'Tôi đã thanh toán'");
    return;
  }

  const name = document.getElementById("customer-name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const note = document.getElementById("note").value;

  const fullAddress = `${name} (${phone}) - ${address}`;

  const orderData = {
    shipping_address: fullAddress,
    customer_note: note,
    payment_method: "cod",
    shipping_fee: SHIPPING_FEE,
    total_amount: cartTotal + SHIPPING_FEE,
  };

  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    alert("Đặt hàng thành công!");
    window.location.href = "../index.html";

  } catch (err) {
    console.error(err);
    alert("Lỗi server!");
  }
}
