document.addEventListener("DOMContentLoaded", function () {
  const bannerSwiper = new Swiper(".mySwiper", {
    // CAi i'at c ban
    slidesPerView: 1, // Chi? hii?n 1 anh mi-i lan
    spaceBetween: 30, // Khoang cAch giaa cAc anh (nau cA)
    loop: true, // Lap lai vA tan (quan trang i'if chay liAn tac)

    // Pagination (dau cham trAn di>i banner)
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // Navigation (mAi tAn chuyifn slide)
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Ta i'iTng chay (autoplay)
    autoplay: {
      delay: 3500, // Chuyifn slide sau 3.5 giAy
      disableOnInteraction: false, // Van chay ta i'iTng khi ngai dAng tng tAc
    },
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // 1. SWIPER BANNER CHANH (Nau ban i'A thAm Swiper.js)
  const bannerSwiper = new Swiper(".mySwiper", {
    // ... Cau hAnh cA (autoplay, loop, v.v.) ...
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: { el: ".swiper-pagination" },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  // 2. SWIPER FLASH SALE MisI (Can thAm)
  const flashSaleSwiper = new Swiper(".flashSaleSwiper", {
    slidesPerView: 5, // Si' lang san pham hiifn thi< cAng lAc
    spaceBetween: 10,
    navigation: {
      nextEl: ".flash-sale-next",
      prevEl: ".flash-sale-prev",
    },
    // ThAm responsive breakpoints nau can
    breakpoints: {
      // Hiifn thi< 3 san pham trAn mAn hAnh nha hn 768px
      768: {
        slidesPerView: 3,
      },
      // Hiifn thi< 5 san pham trAn mAn hAnh li>n hn
      1024: {
        slidesPerView: 5,
      },
    },
  });

  // 3. LOGIC AaM NGaC THioI GIAN (TIMER)
  function startTimer() {
    // Aat mi'c thai gian kat thAc sale (VA da: 1:00 AM ngAy mai)
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1); // ThAm 1 ngAy
    endTime.setHours(1, 0, 0, 0); // Aat gia kat thAc lA 01:00:00 AM

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("flash-sale-timer").innerHTML = "Aif KaT THisC";
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Cap nhat DOM
      document.getElementById("hours").innerText = hours
        .toString()
        .padStart(2, "0");
      document.getElementById("minutes").innerText = minutes
        .toString()
        .padStart(2, "0");
      document.getElementById("seconds").innerText = seconds
        .toString()
        .padStart(2, "0");
    }, 1000); // Cap nhat mi-i giAy
  }

  startTimer();
});
