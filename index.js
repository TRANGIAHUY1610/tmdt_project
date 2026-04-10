// fe/js/index.js

// Aam bao bian API_BASE i'A cA
// const API_BASE = "http://localhost:5000/api";

// --- BIaN TOi?N CaC ---
let currentCategoryId = null;
let dailyHomeCurrentPage = 1;
let dailyHomeCurrentTab = "all";
let isDailyHomeLoading = false;
const productQueryState = {
  search: "",
  min_price: "",
  max_price: "",
  category: "",
  sort_by: "id",
  sort_order: "desc",
  page: 1,
  limit: 12,
};

document.addEventListener("DOMContentLoaded", () => {
  // Check login if available
  if (typeof checkLogin === "function") checkLogin();

  // 2. Tai danh mac
  loadCategories();
  loadHeaderCategories();

  // 3. Tai danh sAch sAch
  loadProducts(productQueryState);

  // 4. Tai Flash Sale
  loadHomeFlashSale();

  // 5. Tai Gai A hAm nay
  loadHomeDailyData("all");
});

/* ==============================================
   PHaN 1: LOGIC TiOM KIaM & DANH SACH CHANH
   ============================================== */

async function loadProducts(params = {}) {
  const container = document.getElementById("product-list");
  const paginationContainer = document.getElementById("product-pagination");
  if (!container) return;

  container.innerHTML =
    '<p style="text-align:center; width:100%">Đang tìm kiếm...</p>';
  if (paginationContainer) paginationContainer.innerHTML = "";

  try {
    const url = new URL(`${API_BASE}/products`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== "") {
        url.searchParams.append(key, params[key]);
      }
    });

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderProducts(data.data);
      renderProductPagination(data.pagination || null);
    } else {
      container.innerHTML = `<div style='text-align:center; width:100%; padding: 50px;'>Không tìm thấy sản phẩm.</div>`;
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

function renderProducts(products) {
  const container = document.getElementById("product-list");
  if (!products || products.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; width:100%; padding: 50px;'>Không tìm thấy sản phẩm.</div>";
    return;
  }
  container.innerHTML = generateProductHTML(products);
}

// Handle search button click
function handleSearch() {
  const keyword = document.getElementById("search-input").value;
  const priceFilter = document.getElementById("price-filter")?.value;
  productQueryState.search = keyword.trim();
  productQueryState.category = currentCategoryId || "";
  if (priceFilter) {
    const [min, max] = priceFilter.split("-");
    productQueryState.min_price = min;
    productQueryState.max_price = max;
  } else {
    productQueryState.min_price = "";
    productQueryState.max_price = "";
  }

  productQueryState.page = 1;

  loadProducts(productQueryState);

  const productList = document.getElementById("main-content");
  if (productList) productList.scrollIntoView({ behavior: "smooth" });
}

function handleSort(sortValue) {
  if (sortValue === "price_asc") {
    productQueryState.sort_by = "price";
    productQueryState.sort_order = "asc";
  } else if (sortValue === "price_desc") {
    productQueryState.sort_by = "price";
    productQueryState.sort_order = "desc";
  } else {
    productQueryState.sort_by = "id";
    productQueryState.sort_order = "desc";
  }

  productQueryState.page = 1;

  handleSearch();
}

function resetProductFilters() {
  const searchInput = document.getElementById("search-input");
  const priceFilter = document.getElementById("price-filter");
  const sortFilter = document.getElementById("sort-filter");

  if (searchInput) searchInput.value = "";
  if (priceFilter) priceFilter.value = "";
  if (sortFilter) sortFilter.value = "newest";

  currentCategoryId = null;
  document.querySelectorAll(".category-link").forEach((item) => item.classList.remove("active"));

  productQueryState.search = "";
  productQueryState.min_price = "";
  productQueryState.max_price = "";
  productQueryState.category = "";
  productQueryState.sort_by = "id";
  productQueryState.sort_order = "desc";
  productQueryState.page = 1;

  loadProducts(productQueryState);
}

function renderProductPagination(pagination) {
  const container = document.getElementById("product-pagination");
  if (!container) return;

  const page = Number(pagination?.page || productQueryState.page || 1);
  const limit = Number(pagination?.limit || productQueryState.limit || 12);
  const total = Number(pagination?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  productQueryState.page = page;
  productQueryState.limit = limit;

  if (total <= limit) {
    container.innerHTML = "";
    return;
  }

  const prevDisabled = page <= 1 ? "disabled" : "";
  const nextDisabled = page >= totalPages ? "disabled" : "";

  container.innerHTML = `
    <button class="btn-filter" style="padding: 6px 12px" onclick="goToProductPage(${page - 1})" ${prevDisabled}>Trước</button>
    <span style="font-size: 14px; color: #555">Trang ${page}/${totalPages} - ${total} sản phẩm</span>
    <button class="btn-filter" style="padding: 6px 12px" onclick="goToProductPage(${page + 1})" ${nextDisabled}>Sau</button>
  `;
}

function goToProductPage(page) {
  const nextPage = Number(page);
  if (!Number.isInteger(nextPage) || nextPage < 1) return;

  productQueryState.page = nextPage;
  loadProducts(productQueryState);

  const productList = document.getElementById("main-content");
  if (productList) productList.scrollIntoView({ behavior: "smooth" });
}

// 2. HAm xa lA khi nhan phAm Enter
function handleEnterSearch(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
}

/* ==============================================
   PHaN 2: LOGIC FLASH SALE
   ============================================== */

async function loadHomeFlashSale() {
  const container = document.getElementById("home-flash-sale-grid");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/products/flash-sale`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderHomeFlashSale(data.data.slice(0, 5));
    } else {
      container.innerHTML =
        '<p style="padding:20px">Hiện chưa có sản phẩm flash sale.</p>';
    }
  } catch (error) {
    console.error("Flash sale error:", error);
  }
}

function renderHomeFlashSale(products) {
  const container = document.getElementById("home-flash-sale-grid");
  const html = generateProductHTML(products, true); // true i'if hii?n progress bar
  container.innerHTML = html;
}

/* ==============================================
   PHaN 3: LOGIC GaI A Hi"M NAY
   ============================================== */

function switchHomeTab(type, btn) {
  document
    .querySelectorAll(".d-tab")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");

  dailyHomeCurrentTab = type;
  dailyHomeCurrentPage = 1;
  document.getElementById("home-daily-grid").innerHTML = "";

  const btnLoad = document.getElementById("btn-home-load-more");
  if (btnLoad) {
    btnLoad.innerHTML =
    'Tải thêm 20 sản phẩm <i class="fas fa-chevron-down"></i>';
    btnLoad.disabled = false;
    btnLoad.style.opacity = "1";
  }

  loadHomeDailyData(type);
}

async function loadHomeDailyData(type) {
  const container = document.getElementById("home-daily-grid");
  if (!container) return;

  if (isDailyHomeLoading) return;
  isDailyHomeLoading = true;

  if (dailyHomeCurrentPage === 1) {
    container.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Đang tải sản phẩm nổi bật...</div>';
  }

  try {
    let url = `${API_BASE}/products?page=${dailyHomeCurrentPage}&limit=10`;

    if (type === "hot") url += "&min_price=100000";
    else if (type === "manga") url += "&category=5";
    else if (type === "vanhoc") url += "&category=1";

    const res = await fetch(url);
    const data = await res.json();

    if (dailyHomeCurrentPage === 1) container.innerHTML = "";

    if (data.success && data.data.length > 0) {
      renderHomeDailyGrid(data.data);
      dailyHomeCurrentPage++;
    } else {
      const btnLoad = document.getElementById("btn-home-load-more");
      if (btnLoad) {
        btnLoad.innerHTML = "Không còn sản phẩm";
        btnLoad.disabled = true;
        btnLoad.style.opacity = "0.6";
      }
      if (dailyHomeCurrentPage === 1) {
        container.innerHTML =
          '<div style="grid-column:1/-1; text-align:center;">Không có sản phẩm trong mục này.</div>';
      }
    }
  } catch (error) {
    console.error("Daily products error:", error);
  } finally {
    isDailyHomeLoading = false;
  }
}

function renderHomeDailyGrid(products) {
  const container = document.getElementById("home-daily-grid");
  const html = generateProductHTML(products);
  container.insertAdjacentHTML("beforeend", html);
}

function loadMoreHomeDaily() {
  const btn = document.getElementById("btn-home-load-more");
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  loadHomeDailyData(dailyHomeCurrentTab).then(() => {
    if (!btn.disabled) btn.innerHTML = oldText;
  });
}

/* ==============================================
   PHaN 4: CAC Hi?M Hi- TRa & GIiZ Hi?NG (QUAN TRiONG)
   ============================================== */

// iY'? Ai,Y Li? Hi?M ADD TO CART Aif SaA (GiOI API THaT)
async function addToCart(productId) {
  // Require login before shopping
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Cần đăng nhập",
      text: "Bạn cần đăng nhập trước khi mua hàng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đi đến đăng nhập",
      confirmButtonColor: "#C92127",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "pages/login.html";
      }
    });
    return;
  }

  // 2. Gai API backend
  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: productId, quantity: 1 }),
    });

    const data = await res.json();

    // 3. Xa lA kat qua
    if (data.success) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      Toast.fire({ icon: "success", title: "Đã thêm vào giỏ hàng!" });

      // aaa CaP NHaT Sa LaNG GIiZ Hi?NG LaP TaC aaa
      updateCartCount();
    } else {
      Swal.fire("Lỗi", data.message || "Không thể thêm vào giỏ hàng.", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Đã xảy ra lỗi máy chủ.", "error");
  }
}

// HAm render HTML cho sAch
function generateProductHTML(products, isFlashSale = false) {
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return products
    .map((product) => {
      const originalPrice = product.original_price || product.price * 1.2;
      const discount = Math.round(
        ((originalPrice - product.price) / originalPrice) * 100
      );
      const soldQty = Math.floor(Math.random() * 50) + 5;

      let progressBarHTML = "";
      if (isFlashSale) {
        progressBarHTML = `
            <div class="progress-bar" style="height:16px; background:#fddccb; border-radius:10px; margin-top:8px; position:relative; overflow:hidden;">
                <div style="width:${soldQty}%; background:#E30019; height:100%;"></div>
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:10px; color:#fff; font-weight:bold; white-space:nowrap;">
                    Đã bán ${soldQty}
                </div>
            </div>`;
      }

      return `
        <div class="product-card" style="min-width: 200px;">
            <div class="badge-hot">-${discount}%</div>
            
            <a href="pages/detail.html?id=${product.id}" class="fs-img-container">
                <img src="${product.image_url}" alt="${product.title}" 
                     style="height:180px; width:100%; object-fit:contain; margin-bottom:10px;"
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-card-info">
                <a href="pages/detail.html?id=${product.id}" title="${
        product.title
      }" style="text-decoration:none">
                    <h3 style="font-size:13px; margin:0 0 5px; height:40px; overflow:hidden; line-height:1.4; color:#333;">${
                      product.title
                    }</h3>
                </a>
                
                <div class="rating-area" style="font-size:10px; color:#F7941E; margin-bottom:5px;">
                    ${renderStars(product.average_rating || 5)}
                    <span style="color:#999;">(${product.review_count || 0})</span>
                </div>

                <div class="fs-price-row">
                    <div class="fs-price" style="color:#C92127; font-size:16px; font-weight:bold;">${formatMoney(
                      product.price
                    )}</div>
                    <div class="fs-old-price" style="text-decoration:line-through; color:#999; font-size:12px;">${formatMoney(
                      originalPrice
                    )}</div>
                </div>

                ${progressBarHTML}

                <button class="btn-add-cart" onclick="addToCart(${
                  product.id
                })" style="margin-top:10px; width:100%;">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>
            </div>
        </div>`;
    })
    .join("");
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars += '<i class="fas fa-star"></i>';
    else stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

/* ==============================================
   PHaN 5: CAC Hi?M Hi- TRa KHAC (DANH MaC, SEARCH...)
   ============================================== */

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const listDiv = document.getElementById("category-filter-list");
    if (data.success && listDiv) {
      listDiv.innerHTML = data.data
        .map(
          (cat) => `
            <a href="javascript:void(0)" class="category-link" onclick="selectCategory(event, this, ${cat.id})">${cat.name}</a>
        `
        )
        .join("");
    }
  } catch (e) {}
}

async function loadHeaderCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const menuContainer = document.getElementById("header-category-list");
    if (data.success && menuContainer) {
      menuContainer.innerHTML = data.data
        .map(
          (cat) => `
            <a href="javascript:void(0)" class="cate-menu-item" onclick="handleHeaderCategoryClick(event, ${cat.id})">
                <i class="fas fa-product"></i> <span>${cat.name}</span>
            </a>
        `
        )
        .join("");
    }
  } catch (e) {}
}

function selectCategory(event, element, id) {
  if (event) event.preventDefault();
  currentCategoryId = id;
  productQueryState.page = 1;
  document.querySelectorAll(".category-link").forEach((item) => item.classList.remove("active"));
  if (element) element.classList.add("active");
  // loadProducts({ category: id }); // Can gai loadProducts lai
  handleSearch(); // Tan dang hAm search i'if load
}

function handleHeaderCategoryClick(event, catId) {
  event.preventDefault();
  currentCategoryId = catId;
  productQueryState.page = 1;
  handleSearch();
}

  // Search suggestions
let searchTimeout = null;
function handleInputSearch(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  if (!keyword.trim()) {
    if (suggestionBox) suggestionBox.style.display = "none";
    return;
  }
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSearchSuggestions(keyword);
  }, 300);
}

async function fetchSearchSuggestions(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  try {
    const res = await fetch(`${API_BASE}/products?search=${keyword}&limit=5`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderSuggestions(data.data);
      if (suggestionBox) suggestionBox.style.display = "block";
    } else {
      if (suggestionBox) suggestionBox.style.display = "none";
    }
  } catch (error) {
    console.error("Search suggestion error:", error);
  }
}

function renderSuggestions(products) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  const html = products
    .map(
      (product) => `
        <a href="pages/detail.html?id=${product.id}" class="suggestion-item">
            <img src="${
              product.image_url
            }" onerror="this.src='https://via.placeholder.com/100'">
            <div class="suggestion-info">
                <h4>${product.title}</h4>
                <div class="price">${formatMoney(product.price)}</div>
            </div>
        </a>`
    )
    .join("");
  if (suggestionBox) suggestionBox.innerHTML = html;
}

document.addEventListener("click", function (e) {
  const searchBar = document.querySelector(".search-box");
  const suggestionBox = document.getElementById("search-suggestions-box");
  if (searchBar && !searchBar.contains(e.target)) {
    if (suggestionBox) suggestionBox.style.display = "none";
  }
});
