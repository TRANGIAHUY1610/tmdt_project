// API_BASE is defined in api.js.

async function handleRegister(event) {
  event.preventDefault(); // Prevent page reload

  // Read form values
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Get error area and submit button
  const errorMsg = document.getElementById("error-message");
  const btnSubmit = document.querySelector(".btn-submit");

  // Reset error state
  errorMsg.style.display = "none";
  errorMsg.innerText = "";

  // Confirm password
  if (password !== confirmPassword) {
    errorMsg.innerText = "Mật khẩu xác nhận không khớp.";
    errorMsg.style.display = "block";
    return;
  }

  // Disable submit while loading
  btnSubmit.innerText = "Đang đăng ký...";
  btnSubmit.disabled = true;

  try {
    console.log("Đang gửi dữ liệu đăng ký...");

    // Send request to the server
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
        email: email,
        password: password,
      }),
    });

    const data = await res.json();
    console.log("Server response:", data);

    // Handle result
    if (res.ok) {
      alert("Đăng ký thành công. Bạn có thể đăng nhập ngay.");

      // Go to login page
      window.location.href = "login.html";
    } else {
      throw new Error(data.message || "Đăng ký thất bại");
    }
  } catch (err) {
    console.error("Error:", err);
    errorMsg.innerText = err.message || "Đã xảy ra lỗi máy chủ.";
    errorMsg.style.display = "block";

    // Re-enable submit
    btnSubmit.innerText = "Đăng ký";
    btnSubmit.disabled = false;
  }
}

