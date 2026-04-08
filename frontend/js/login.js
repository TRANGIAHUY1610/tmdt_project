

// Bind submit handler after page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    if (user.role === "admin") {
      window.location.href = "../admin.html";
    } else {
      window.location.href = "../index.html";
    }
    return;
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

async function handleLogin(event) {
  event.preventDefault(); // Prevent page reload

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-message");
  const btnSubmit = document.querySelector(".btn-submit");

  // Reset error state
  errorMsg.style.display = "none";
  errorMsg.innerText = "";

  // Disable submit while loading
  btnSubmit.innerText = "Đang đăng nhập...";
  btnSubmit.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // Accept token from either response shape
    const token = data.token || (data.data && data.data.token);
    const user = data.user || (data.data && data.data.user);
    const redirectTo = (data.data && data.data.redirectTo) || null;

    // Store credentials when login succeeds
    if (res.ok && token) {
      // Persist auth data
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful. Token:", token);

      // Role-based redirect: admin -> admin dashboard, customer -> storefront
      window.location.href = user && user.role === "admin"
        ? (redirectTo || "../admin.html")
        : (redirectTo || "../index.html");
    } else {
      // Missing token or server rejected the request
      throw new Error(
        data.message || "Đăng nhập thất bại (không nhận được token)"
      );
    }
  } catch (err) {
    console.error(err);
    errorMsg.innerText = err.message;
    errorMsg.style.display = "block";

    // Re-enable submit
    btnSubmit.innerText = "Đăng nhập ngay";
    btnSubmit.disabled = false;
  }
}
