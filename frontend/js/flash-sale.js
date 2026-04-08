// fe/js/flash-sale.js

const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  loadFlashSaleProducts(); // Gai API that
  startTimer(); // Chay i'i"ng hi" i'am ngac
});

// 1. TaI SACH Ta SERVER
async function loadFlashSaleProducts() {
  const container = document.getElementById("flash-sale-grid");
  container.innerHTML =
    '<div style="color:#fff; grid-column:1/-1; text-align:center;">Đang tải ưu đãi hot...</div>';

  try {
    // Gai API mA ta vaa tao iY Backend
    const res = await fetch(`${API_BASE_URL}/products/flash-sale`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderFlashSaleGrid(data.data);
    } else {
      container.innerHTML =
        '<div style="color:#fff">Hiện chưa có sản phẩm flash sale.</div>';
    }
  } catch (e) {
    console.error("Flash sale error:", e);
    container.innerHTML = '<div style="color:#fff">Đã xảy ra lỗi máy chủ.</div>';
  }
}

// 2. Va GIAO DIi?N (Render)
function renderFlashSaleGrid(products) {
  const container = document.getElementById("flash-sale-grid");
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  container.innerHTML = products
    .map((product) => {
      // Fallback original price when the database does not provide one
      const originalPrice = product.original_price || product.price * 1.3;
      const discount = Math.round(
        ((originalPrice - product.price) / originalPrice) * 100
      );
      const soldQty = Math.floor(Math.random() * 90) + 10;

      return `
        <div class="fs-product-card">
            <div class="badge-percent">-${discount}%</div>
            
            <a href="../pages/detail.html?id=${product.id}" class="fs-img-wrap">
                <img src="${
                  product.image_url
                }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-title">${product.title}</div>
            
            <div class="fs-price-row">
                <div class="fs-price">${formatMoney(product.price)}</div>
                <div class="fs-old-price">${formatMoney(originalPrice)}</div>
            </div>

            <div class="fs-progress">
                <div class="fs-progress-bar" style="width: ${soldQty}%"></div>
                <div class="fs-progress-text">Đã bán ${soldQty}</div>
            </div>

            <button class="btn-fs-buy" onclick="addToCart(${
              product.id
            })">Thêm vào giỏ hàng</button>
        </div>
        `;
    })
    .join("");
}

// 3. AaM NGaC (Gia nguyAn logic cA)
function startTimer() {
  let time = 7200 + 5400;
  setInterval(() => {
    time--;
    if (time < 0) time = 10000;

    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;

    const elH = document.getElementById("fs-h") || document.getElementById("h");
    const elM = document.getElementById("fs-m") || document.getElementById("m");
    const elS = document.getElementById("fs-s") || document.getElementById("s");

    if (elH) elH.innerText = h.toString().padStart(2, "0");
    if (elM) elM.innerText = m.toString().padStart(2, "0");
    if (elS) elS.innerText = s.toString().padStart(2, "0");
  }, 1000);
}


