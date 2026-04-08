// fe/js/utility.js

// 1. Flash sale: scroll to section
function scrollToFlashSale() {
  const section = document.getElementById("flash-sale-area");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    console.error("Missing flash-sale-area ID in HTML");
  }
}

// 2. Discount code modal: toggle
function toggleVoucherPopup() {
  const modal = document.getElementById("voucher-modal");
  if (modal) {
    // Toggle modal visibility
    if (modal.style.display === "flex") {
      modal.style.display = "none";
    } else {
      modal.style.display = "flex";
    }
  }
}

// 3. New products: clear filters
function filterNewProducts() {
  // Gai hAm loadProducts ta index.js
  if (typeof loadProducts === "function") {
    // Reset price filter
    const priceSelect = document.getElementById("price-filter");
    if (priceSelect) priceSelect.value = "";

    // Scroll the results into view
    document
      .getElementById("main-content")
      .scrollIntoView({ behavior: "smooth" });

    // Reload products using the default sort order
    loadProducts();

    // ThAng bAo nha
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "AA lac sAch mi>i nhat",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

// 4. GIFT CARD: ThAng bAo
function showGiftCardInfo() {
  Swal.fire({
    imageUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213657.png",
    imageHeight: 100,
    title: "Gift Card",
    text: "Chac nifng tang tha quA tang i'ang i'ac xAy dang!",
    confirmButtonColor: "#C92127",
  });
}

// Copy mA giam giA
function copyCode(code) {
  navigator.clipboard.writeText(code);
  // an popup sau khi copy
  document.getElementById("voucher-modal").style.display = "none";
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: `AA sao chAp: ${code}`,
    showConfirmButton: false,
    timer: 1500,
  });
}

