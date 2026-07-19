// updates the navigation bar based on whether the user is logged in or not

document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("login-link");
    const loginBtn = document.getElementById("login-btn");

    const isLoggedIn =
        sessionStorage.getItem("isLoggedIn") === "true";

    const userRole =
        sessionStorage.getItem("userRole");

    if (isLoggedIn && userRole === "Customer") {
        if (loginLink && loginBtn) {
            loginBtn.textContent = "Profile";
            loginLink.href = "/html/customer-profile.html";
        }
    } else {
        if (loginLink && loginBtn) {
            loginBtn.textContent = "Login";
            loginLink.href = "/html/login.html";
        }
    }
});