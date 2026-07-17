//reads the customer details saved during login
document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn =
        sessionStorage.getItem("isLoggedIn") === "true";

    const userRole =
        sessionStorage.getItem("userRole");

    const customerID =
        sessionStorage.getItem("customerID");

    const userID =
        sessionStorage.getItem("userID");

    if (
        !isLoggedIn ||
        userRole !== "Customer" ||
        !customerID ||
        !userID
    ) {
        alert("Please log in to view your profile");
        window.location.href = "/html/login.html";
        return;
    }

    const profileForm =document.getElementById("profile-form");

    const passwordForm =document.getElementById("password-form");

    const profileMessage = document.getElementById("profile-message");

    const customerNameInput = document.getElementById("customer-name");

    const customerEmailInput =document.getElementById("customer-email");

    const contactNoInput = document.getElementById("contact-no");

    const addressInput =document.getElementById("customer-address");

    const displayName = document.getElementById("profile-display-name");

    const displayEmail =document.getElementById("profile-display-email");

    let originalProfile = null;

    // show success or error message
    function showProfileMessage(message, type) {
        profileMessage.textContent = message;
        profileMessage.className = type;
    }

    // fill page using returned database record
    function fillProfile(customer) {
        customerNameInput.value =
            customer.CustomerName || "";

        customerEmailInput.value =
            customer.Email || "";

        contactNoInput.value =
            customer.ContactNo
                ? customer.ContactNo.trim()
                : "";

        addressInput.value =
            customer.Address || "";

        displayName.textContent =
            customer.CustomerName || "Customer";

        displayEmail.textContent =
            customer.Email || "";
    }

    // retrieve latest profile from database
    async function loadProfile() {
        try {
            const response = await fetch(
                `/customers/${customerID}/profile`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Unable to load profile");
                return;
            }

            originalProfile = data;
            fillProfile(data);

            // keep stored values updated
            sessionStorage.setItem(
                "customerName",
                data.CustomerName
            );

            sessionStorage.setItem(
                "userEmail",
                data.Email
            );

        } catch (error) {
            console.error("Load profile error:", error);
            alert("Unable to connect to the server");
        }
    }

    // update customer details
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const customerName =
            customerNameInput.value.trim();

        const email =
            customerEmailInput.value.trim();

        const contactNo =
            contactNoInput.value.trim();

        const address =
            addressInput.value.trim();

        if (!customerName || !email) {
            showProfileMessage(
                "Name and email are required",
                "error"
            );
            return;
        }

        if (
            contactNo &&
            !/^[0-9]{8}$/.test(contactNo)
        ) {
            showProfileMessage(
                "Contact number must contain exactly 8 digits",
                "error"
            );
            return;
        }

        try {
            const response = await fetch(
                `/customers/${customerID}/profile`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        customerName,
                        email,
                        contactNo,
                        address
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showProfileMessage(
                    data.error || "Unable to update profile",
                    "error"
                );
                return;
            }

            originalProfile = data.customer;
            fillProfile(data.customer);

            sessionStorage.setItem(
                "customerName",
                data.customer.CustomerName
            );

            sessionStorage.setItem(
                "userEmail",
                data.customer.Email
            );

            showProfileMessage(
                data.message,
                "success"
            );

        } catch (error) {
            console.error("Update profile error:", error);

            showProfileMessage(
                "Unable to connect to the server",
                "error"
            );
        }
    });

    // restore original database details
    const cancelButton =
        document.getElementById("cancel-profile-btn");

    cancelButton.addEventListener("click", () => {
        if (originalProfile) {
            fillProfile(originalProfile);
        }

        profileMessage.className = "";
        profileMessage.textContent = "";
    });

    // change password
    passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword =
            document.getElementById("current-password").value;

        const newPassword =
            document.getElementById("new-password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all password fields");
            return;
        }

        if (newPassword.length < 8) {
            alert("New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match");
            return;
        }

        try {
            const response = await fetch(
                `/customers/${userID}/password`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.error || "Unable to change password"
                );
                return;
            }

            alert(data.message);
            passwordForm.reset();

        } catch (error) {
            console.error("Change password error:", error);
            alert("Unable to connect to the server");
        }
    });

    // logout
    const logoutButton =
        document.getElementById("profile-logout-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            const confirmLogout =
                confirm("Are you sure you want to log out?");

            if (!confirmLogout) {
                return;
            }

            sessionStorage.clear();
            window.location.href = "/index.html";
        });
    }

    //deleteing an account
    const deleteOverlay =document.getElementById("delete-account-overlay");

    const openDeleteButton =document.getElementById("open-delete-account-btn");

    const cancelDeleteButton =document.getElementById("cancel-delete-account-btn");

    const confirmDeleteButton =document.getElementById("confirm-delete-account-btn");

    const deletePasswordInput = document.getElementById("delete-account-password");

    const deleteMessage = document.getElementById("delete-account-message");

    // open delete account popup
    openDeleteButton.addEventListener("click", () => {
        deletePasswordInput.value = "";
        deleteMessage.textContent = "";
        deleteOverlay.classList.add("active");
    });

    // close delete account popup
    cancelDeleteButton.addEventListener("click", () => {
        deleteOverlay.classList.remove("active");
        deletePasswordInput.value = "";
        deleteMessage.textContent = "";
    });

    // close popup when clicking outside it
    deleteOverlay.addEventListener("click", (event) => {
        if (event.target === deleteOverlay) {
            deleteOverlay.classList.remove("active");
        }
    });

    // permanently delete account
    confirmDeleteButton.addEventListener("click", async () => {
        const currentPassword =
            deletePasswordInput.value;

        if (!currentPassword) {
            deleteMessage.textContent =
                "Please enter your current password";
            return;
        }

        const finalConfirmation = confirm(
            "This will permanently delete your account. Continue?"
        );

        if (!finalConfirmation) {
            return;
        }

        confirmDeleteButton.disabled = true;
        confirmDeleteButton.textContent = "Deleting...";

        try {
            const response = await fetch(
                `/customers/${customerID}/account`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        currentPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                deleteMessage.textContent =
                    data.error || "Unable to delete account";

                confirmDeleteButton.disabled = false;
                confirmDeleteButton.textContent =
                    "Permanently Delete";

                return;
            }

            alert(data.message);

            // clear the deleted account's browser session
            sessionStorage.clear();

            window.location.href = "/index.html";

        } catch (error) {
            console.error("Delete account error:", error);

            deleteMessage.textContent =
                "Unable to connect to the server";

            confirmDeleteButton.disabled = false;
            confirmDeleteButton.textContent =
                "Permanently Delete";
        }
    });

    loadProfile();
});