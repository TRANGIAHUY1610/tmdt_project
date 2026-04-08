document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", handleAdminLogin);
});

async function handleAdminLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const submitButton = document.querySelector("#adminLoginForm button[type='submit']");

  const email = (emailInput.value || "").trim();
  const password = passwordInput.value || "";

  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();

    const token = payload?.data?.token || payload?.token;
    const user = payload?.data?.user || payload?.user;
    const redirectTo = payload?.data?.redirectTo || "./admin.html";

    if (!response.ok || !token || !user) {
      throw new Error(payload.message || "Đăng nhập thất bại");
    }

    if (user.role !== "admin") {
      throw new Error("Tài khoản này không có quyền quản trị");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    await Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công",
      text: "Đang chuyển đến bảng điều khiển quản trị...",
      timer: 1200,
      showConfirmButton: false,
    });

    window.location.href = redirectTo;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Không thể đăng nhập",
      text: error.message || "Đã xảy ra lỗi",
    });
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
  }
}
