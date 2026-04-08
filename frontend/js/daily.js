// fe/js/daily.js

const DAILY_API = "http://localhost:5000/api";
let currentPage = 1;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  loadDailyProducts(); // Tai trang 1 ngay khi vAo
});

// 1. TaI SACH (PhAn trang)
async function loadDailyProducts() {
  if (isLoading) return;
  isLoading = true;

  const btn = document.getElementById("btn-load-more");
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  try {
    // Gai API getAllProducts cA san, thAm tham si' page & limit
    const res = await fetch(`${DAILY_API}/products?page=${currentPage}&limit=10`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderProducts(data.data); // Va thAm sAch vAo li>i
      currentPage++; // Tifng si' trang lAn cho lan bam sau

      if (btn) {
        btn.innerHTML =
          'Load 20 more products <i class="fas fa-chevron-down"></i>';
        btn.disabled = false;
      }
    } else {
      if (btn) {
        btn.innerHTML = "No more products";
        btn.disabled = true;
        btn.style.opacity = "0.6";
      }
    }
  } catch (error) {
    console.error("Daily products error:", error);
  } finally {
    isLoading = false;
  }
}

// 2. Va SACH (Append - Ni'i tiap vAo danh sAch cA)
function renderProducts(products) {
  const container = document.getElementById("daily-grid");
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const html = products
    .map((product) => {
      const originalPrice = product.original_price || product.price * 1.2;
      const discount = Math.round(
        ((originalPrice - product.price) / originalPrice) * 100
      );
      const sold = Math.floor(Math.random() * 200) + 10;

      return `
        <div class="suggest-card">
            <span class="badge-discount">-${discount}%</span>
            
            <a href="../pages/detail.html?id=${product.id}" class="card-img-wrap">
                <img src="${product.image_url}" alt="${
        product.title
      }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="card-title" title="${product.title}">${product.title}</div>
            
            <div class="price-row">
                <div class="current-price">${formatMoney(product.price)}</div>
            </div>
            <div class="original-price">${formatMoney(originalPrice)}</div>
            
            <div style="margin-top:8px; display:flex; align-items:center;">
                <span class="rating-stars" style="color:#F7941E; font-size:10px;">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </span>
                <span class="sold-count" style="font-size:11px; color:#777; margin-left:5px;">| AA bAn ${sold}</span>
            </div>

            <button class="btn-add-cart" onclick="addToCart(${
              product.id
            })" style="width:100%; margin-top:10px; border:1px solid #C92127; background:#fff; color:#C92127; font-weight:bold; padding:5px; border-radius:4px; cursor:pointer;">
                Thêm vào giỏ hàng
            </button>
        </div>
        `;
    })
    .join("");

  // Keep insertAdjacentHTML so the existing content is not replaced
  container.insertAdjacentHTML("beforeend", html);
}

// 3. Xa LA Sa KIi?N NisT LOAD MORE
// (HAm nAy i'A i'ac gai trac tiap trong onclick caa HTML: loadMoreProducts -> loadDailyProducts)
// Nhng i'if khi>p vi>i tAn hAm trong HTML cA, ta gAn alias:
window.loadMoreProducts = loadDailyProducts;

