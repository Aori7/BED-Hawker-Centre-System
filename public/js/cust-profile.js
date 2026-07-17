//reads the customer details saved during login
document.addEventListener("DOMContentLoaded", () => {
    // get saved login details
    const isLoggedIn =
        sessionStorage.getItem("isLoggedIn") === "true";

    const userRole =
        sessionStorage.getItem("userRole");

    const customerName =
        sessionStorage.getItem("customerName");

    const userEmail =
        sessionStorage.getItem("userEmail");

    // stop people who are not logged in from opening the profile page
    if (!isLoggedIn || userRole !== "Customer") {
        alert("Please log in to view your profile.");
        window.location.href = "login.html";
        return;
    }

    // elements on the left profile card
    const profileDisplayName =
        document.getElementById("profile-display-name");

    const profileDisplayEmail =
        document.getElementById("profile-display-email");

    // form inputs
    const customerNameInput =
        document.getElementById("customer-name");

    const customerEmailInput =
        document.getElementById("customer-email");

    // inject customer details
    if (profileDisplayName) {
        profileDisplayName.textContent =
            customerName || "Customer";
    }

    if (profileDisplayEmail) {
        profileDisplayEmail.textContent =
            userEmail || "";
    }

    if (customerNameInput) {
        customerNameInput.value =
            customerName || "";
    }

    if (customerEmailInput) {
        customerEmailInput.value =
            userEmail || "";
    }

    const logoutBtn =
    document.getElementById("profile-logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            const confirmLogout =
                confirm("Are you sure you want to log out?");

            if (!confirmLogout) {
                return;
            }

            // remove all login details
            sessionStorage.removeItem("isLoggedIn");
            sessionStorage.removeItem("userRole");
            sessionStorage.removeItem("userID");
            sessionStorage.removeItem("customerID");
            sessionStorage.removeItem("customerName");
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("selectedRole");

            alert("You have been logged out.");

            window.location.href = "../index.html";
        });
    }
    
});