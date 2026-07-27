document.addEventListener("DOMContentLoaded", () => {
    const menuItemList =
        document.getElementById("menu-item-list");

    const stallNameDisplay =
        document.getElementById("selected-stall-name");

    const urlParams =
        new URLSearchParams(window.location.search);

    const stallID =
        urlParams.get("stallID");

    let menuItems = [];

    const cartItemsContainer =
    document.querySelector(".cart-items");

    const cartTotalDisplay =
        document.querySelector(".cart-footer p");

    const checkoutButton =
        document.querySelector(".checkout-btn");

    const checkoutSection =
        document.querySelector(".checkout-section");

    const checkoutSummary =
        document.querySelector(".checkout-summary");

    const cancelCheckoutButton =
        document.querySelector(".cancel-btn");

    let cart =
        JSON.parse(sessionStorage.getItem("hawkerCart")) || [];
        
    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getImagePath(imageURL) {
        if (!imageURL) {
            return "/images/picture-icon.jpg";
        }

        if (
            imageURL.startsWith("http://") ||
            imageURL.startsWith("https://")
        ) {
            return imageURL;
        }

        return `/${imageURL}`;
    }

    function displayMenuItems(items) {
        menuItemList.innerHTML = "";

        if (items.length === 0) {
            menuItemList.innerHTML = `
                <p class="empty-message">
                    No menu items are currently available.
                </p>
            `;

            return;
        }

        items.forEach((item) => {
            const card =
                document.createElement("div");

            card.classList.add("menu-item-card");

            card.innerHTML = `
                <div class="menu-item-image">
                    <img
                        src="${escapeHTML(
                            getImagePath(item.ImageURL)
                        )}"
                        alt="${escapeHTML(item.ItemName)}"
                        onerror="this.src='/images/picture-icon.jpg'"
                    >
                </div>

                <div class="menu-item-content">
                    <p class="menu-item-category">
                        ${escapeHTML(item.ItemCategory)}
                    </p>

                    <h2 class="menu-item-name">
                        ${escapeHTML(item.ItemName)}
                    </h2>

                    <p class="menu-item-description">
                        ${escapeHTML(
                            item.ItemDescription ||
                            "No description available."
                        )}
                    </p>

                    <p class="menu-item-price">
                        $${Number(item.ItemPrice).toFixed(2)}
                    </p>

                    <div class="menu-item-actions">
                        <div class="quantity-control">
                            <button
                                type="button"
                                class="quantity-btn decrease-btn"
                            >
                                −
                            </button>

                            <span class="quantity-value">
                                1
                            </span>

                            <button
                                type="button"
                                class="quantity-btn increase-btn"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            class="add-cart-btn"
                            data-menu-item-id="${item.MenuItemID}"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;

            menuItemList.appendChild(card);
        });
    }

    async function loadStallDetails() {
        try {
            const response =
                await fetch(`/food-stalls/${stallID}`);

            if (!response.ok) {
                stallNameDisplay.textContent =
                    "Stall Menu";

                return;
            }

            const stall =
                await response.json();

            stallNameDisplay.textContent =
                stall.StallName;

        } catch (error) {
            console.error(
                "Load stall details error:",
                error
            );

            stallNameDisplay.textContent =
                "Stall Menu";
        }
    }

    async function loadMenuItems() {
        if (!stallID) {
            menuItemList.innerHTML = `
                <p class="empty-message">
                    No food stall was selected.
                </p>
            `;

            return;
        }

        try {
            const response =
                await fetch(`/menu-items/stall/${stallID}`);

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to retrieve menu items"
                );
            }

            menuItems = data;
            displayMenuItems(menuItems);

        } catch (error) {
            console.error(
                "Load menu items error:",
                error
            );

            menuItemList.innerHTML = `
                <p class="empty-message">
                    Unable to load menu items.
                </p>
            `;
        }
    }

    menuItemList.addEventListener(
        "click",
        (event) => {
            const card =
                event.target.closest(".menu-item-card");

            if (!card) {
                return;
            }

            const quantityDisplay =
                card.querySelector(".quantity-value");

            let quantity =
                parseInt(quantityDisplay.textContent);

            if (
                event.target.classList.contains(
                    "increase-btn"
                )
            ) {
                quantity++;
                quantityDisplay.textContent = quantity;
            }

            if (
                event.target.classList.contains(
                    "decrease-btn"
                )
            ) {
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent =
                        quantity;
                }
            }

            if (
                event.target.classList.contains(
                    "add-cart-btn"
                )
            ) {
                const menuItemID =
                    event.target.dataset.menuItemId;

                addToCart(menuItemID, quantity);
            }
        }
    );

    cartItemsContainer.addEventListener(
        "click",
        (event) => {
            const menuItemID =
                event.target.dataset.menuItemId;

            if (!menuItemID) {
                return;
            }

            if (
                event.target.classList.contains(
                    "cart-increase-btn"
                )
            ) {
                updateCartQuantity(menuItemID, 1);
            }

            if (
                event.target.classList.contains(
                    "cart-decrease-btn"
                )
            ) {
                updateCartQuantity(menuItemID, -1);
            }

            if (
                event.target.classList.contains(
                    "cart-remove-btn"
                )
            ) {
                removeFromCart(menuItemID);
            }
        }
    );
    checkoutButton.addEventListener(
        "click",
        () => {
            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            checkoutSummary.innerHTML = `
                ${cart.length} different item(s)<br>
                Total: $${calculateCartTotal().toFixed(2)}
            `;

            checkoutSection.style.display = "block";
        }
    );

    cancelCheckoutButton.addEventListener(
        "click",
        () => {
            checkoutSection.style.display = "none";
        }
    );
    function saveCart() {
        sessionStorage.setItem(
            "hawkerCart",
            JSON.stringify(cart)
        );
    }

    function calculateCartTotal() {
        return cart.reduce(
            (total, item) => {
                return total +
                    Number(item.ItemPrice) *
                    item.Quantity;
            },
            0
        );
    }

    function displayCart() {
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <p>No items added yet</p>
            `;

            cartTotalDisplay.textContent =
                "Total: $0.00";

            checkoutSection.style.display = "none";

            return;
        }

    cart.forEach((item) => {
        const cartItem =
            document.createElement("div");

        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <div class="cart-item-details">
                <h4>${escapeHTML(item.ItemName)}</h4>

                <p>
                    $${Number(item.ItemPrice).toFixed(2)}
                    each
                </p>
            </div>

            <div class="cart-item-actions">
                <button
                    type="button"
                    class="cart-decrease-btn"
                    data-menu-item-id="${item.MenuItemID}"
                >
                    −
                </button>

                <span class="cart-quantity">
                    ${item.Quantity}
                </span>

                <button
                    type="button"
                    class="cart-increase-btn"
                    data-menu-item-id="${item.MenuItemID}"
                >
                    +
                </button>

                <button
                    type="button"
                    class="cart-remove-btn"
                    data-menu-item-id="${item.MenuItemID}"
                >
                    Remove
                </button>
            </div>

            <p class="cart-item-subtotal">
                $${(
                    Number(item.ItemPrice) *
                    item.Quantity
                ).toFixed(2)}
            </p>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    cartTotalDisplay.textContent =
        `Total: $${calculateCartTotal().toFixed(2)}`;
}

    function updateCartQuantity(menuItemID, change) {
        const cartItem =
            cart.find(
                (item) =>
                    item.MenuItemID ===
                    parseInt(menuItemID)
            );

        if (!cartItem) {
            return;
        }

        cartItem.Quantity += change;

        if (cartItem.Quantity <= 0) {
            cart = cart.filter(
                (item) =>
                    item.MenuItemID !==
                    parseInt(menuItemID)
            );
        }

        saveCart();
        displayCart();
    }

    function removeFromCart(menuItemID) {
        cart = cart.filter(
            (item) =>
                item.MenuItemID !==
                parseInt(menuItemID)
        );

        saveCart();
        displayCart();
    }
    function addToCart(menuItemID, quantity) {
        const selectedItem =
            menuItems.find(
                (item) =>
                    item.MenuItemID ===
                    parseInt(menuItemID)
            );

        if (!selectedItem) {
            return;
        }

        const existingCartItem =
            cart.find(
                (item) =>
                    item.MenuItemID ===
                    selectedItem.MenuItemID
            );

        if (existingCartItem) {
            existingCartItem.Quantity += quantity;
        } else {
            cart.push({
                MenuItemID:
                    selectedItem.MenuItemID,

                StallID:
                    parseInt(stallID),

                ItemName:
                    selectedItem.ItemName,

                ItemPrice:
                    Number(selectedItem.ItemPrice),

                ImageURL:
                    selectedItem.ImageURL,

                Quantity:
                    quantity
            });
        }

        saveCart();
        displayCart();

        alert(
            `${quantity} × ${selectedItem.ItemName} added to cart`
        );
    }

    displayCart();
    loadStallDetails();
    loadMenuItems();
});