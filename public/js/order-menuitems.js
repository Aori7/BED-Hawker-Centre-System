document.addEventListener("DOMContentLoaded", () => {
  const menuItemList = document.getElementById("menu-item-list");

  const stallNameDisplay = document.getElementById("selected-stall-name");

  const urlParams = new URLSearchParams(window.location.search);

  const stallID = urlParams.get("stallID");

  let menuItems = [];

  const cartItemsContainer = document.querySelector(".cart-items");

  const cartTotalDisplay = document.querySelector(".cart-footer p");

  const checkoutButton = document.querySelector(".checkout-btn");

  const checkoutSection = document.querySelector(".checkout-section");

  const checkoutSummary = document.querySelector(".checkout-summary");

  const confirmOrderButton = document.querySelector(".confirm-btn");

  const cancelButton = document.querySelector(".cancel-btn");

  const specialRequestInput = document.getElementById("special-request");

  const requestCharacterCount = document.getElementById(
    "request-character-count",
  );
  const deliveryAddressSection = document.getElementById(
    "delivery-address-section",
  );

  const deliveryAddressInput = document.getElementById("delivery-address");
  let cart = JSON.parse(sessionStorage.getItem("hawkerCart")) || [];

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

    if (imageURL.startsWith("http://") || imageURL.startsWith("https://")) {
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
      const card = document.createElement("div");

      card.classList.add("menu-item-card");

      card.innerHTML = `
                <div class="menu-item-image">
                    <img
                        src="${escapeHTML(getImagePath(item.ImageURL))}"
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
                          item.ItemDescription || "No description available.",
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
  async function loadCustomerAddress() {
    const accessToken = sessionStorage.getItem("accessToken");

    const customerID = sessionStorage.getItem("customerID");

    try {
      const response = await fetch(`/customers/${customerID}/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load address");
      }

      const data = await response.json();

      deliveryAddressInput.value = data.Address || "";
    } catch (error) {
      console.error("Load customer address error:", error);
    }
  }
  async function saveCustomerAddress(address) {
    const accessToken = sessionStorage.getItem("accessToken");

    const customerID = sessionStorage.getItem("customerID");

    // First load the current full profile
    const profileResponse = await fetch(`/customers/${customerID}/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Unable to load customer profile");
    }

    const customer = await profileResponse.json();

    // Then send the full profile back with the new address
    const response = await fetch(`/customers/${customerID}/profile`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        customerName: customer.CustomerName,
        email: customer.Email,
        contactNo: customer.ContactNo ? customer.ContactNo.trim() : "",
        address: address,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to save delivery address");
    }

    return data;
  }
  async function loadStallDetails() {
    try {
      const response = await fetch(`/food-stalls/${stallID}`);

      if (!response.ok) {
        stallNameDisplay.textContent = "Stall Menu";

        return;
      }

      const stall = await response.json();

      stallNameDisplay.textContent = stall.StallName;
    } catch (error) {
      console.error("Load stall details error:", error);

      stallNameDisplay.textContent = "Stall Menu";
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
      const response = await fetch(`/menu-items/stall/${stallID}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to retrieve menu items");
      }

      menuItems = data;
      displayMenuItems(menuItems);
    } catch (error) {
      console.error("Load menu items error:", error);

      menuItemList.innerHTML = `
                <p class="empty-message">
                    Unable to load menu items.
                </p>
            `;
    }
  }
  document.querySelectorAll('input[name="orderType"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "Delivery") {
        deliveryAddressSection.style.display = "block";
        loadCustomerAddress();
      } else {
        deliveryAddressSection.style.display = "none";
      }

      displayCheckoutSummary();
    });
  });

  specialRequestInput.addEventListener("input", () => {
    requestCharacterCount.textContent = specialRequestInput.value.length;
  });

  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    displayCheckoutSummary();

    checkoutSection.style.display = "block";
  });

  cancelButton.addEventListener("click", () => {
    checkoutSection.style.display = "none";
  });

  confirmOrderButton.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const selectedPayment = document.querySelector(
      'input[name="payment"]:checked',
    );

    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }
    const selectedOrderType = document.querySelector(
      'input[name="orderType"]:checked',
    );

    if (!selectedOrderType) {
      alert("Please select an order type.");
      return;
    }
    let deliveryAddress = null;

    if (selectedOrderType.value === "Delivery") {
      deliveryAddress = deliveryAddressInput.value.trim();

      if (!deliveryAddress) {
        alert("Please enter a delivery address.");
        deliveryAddressInput.focus();
        return;
      }
    }

    const customerID = sessionStorage.getItem("customerID");

    if (!customerID) {
      alert("Please log in before placing an order.");
      return;
    }
    const subtotal = calculateCartTotal();

    const deliveryFee = calculateDeliveryFee(selectedOrderType.value);

    const totalAmount = subtotal + deliveryFee;
    const orderData = {
      customerID: parseInt(customerID),

      stallID: parseInt(stallID),

      orderType: selectedOrderType.value,

      paymentMethod: selectedPayment.value,

      subtotal: subtotal,

      deliveryFee: deliveryFee,

      totalAmount: totalAmount,

      specialRequest: specialRequestInput.value.trim() || null,

      items: cart.map((item) => ({
        menuItemID: item.MenuItemID,
        quantity: item.Quantity,
      })),
    };

    try {
      confirmOrderButton.disabled = true;
      confirmOrderButton.textContent = "Placing Order...";
      if (selectedOrderType.value === "Delivery") {
        await saveCustomerAddress(deliveryAddress);
      }

      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        alert("Your login session has expired. Please log in again.");
        return;
      }

      const response = await fetch("/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to place order");
      }

      sessionStorage.removeItem("hawkerCart");

      sessionStorage.removeItem("checkoutData");

      cart = [];
      displayCart();

      specialRequestInput.value = "";
      requestCharacterCount.textContent = "0";

      checkoutSection.style.display = "none";

      alert(`Order placed successfully! Order ID: ${data.orderID}`);

      window.location.href = "main-hawkers.html";
    } catch (error) {
      console.error("Place order error:", error);

      alert(error.message);
    } finally {
      confirmOrderButton.disabled = false;
      confirmOrderButton.textContent = "Confirm Order";
    }
  });
  menuItemList.addEventListener("click", (event) => {
    const card = event.target.closest(".menu-item-card");

    if (!card) {
      return;
    }

    const quantityDisplay = card.querySelector(".quantity-value");

    let quantity = parseInt(quantityDisplay.textContent);

    if (event.target.classList.contains("increase-btn")) {
      quantity++;
      quantityDisplay.textContent = quantity;
    }

    if (event.target.classList.contains("decrease-btn")) {
      if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
      }
    }

    if (event.target.classList.contains("add-cart-btn")) {
      const menuItemID = event.target.dataset.menuItemId;

      addToCart(menuItemID, quantity);
    }
  });

  cartItemsContainer.addEventListener("click", (event) => {
    const menuItemID = event.target.dataset.menuItemId;

    if (!menuItemID) {
      return;
    }

    if (event.target.classList.contains("cart-increase-btn")) {
      updateCartQuantity(menuItemID, 1);
    }

    if (event.target.classList.contains("cart-decrease-btn")) {
      updateCartQuantity(menuItemID, -1);
    }

    if (event.target.classList.contains("cart-remove-btn")) {
      removeFromCart(menuItemID);
    }
  });

  function calculateCartTotal() {
    return cart.reduce((total, item) => {
      return total + Number(item.ItemPrice) * item.Quantity;
    }, 0);
  }
  function calculateDeliveryFee(orderType) {
    return orderType === "Delivery" ? 3 : 0;
  }
  function displayCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
                <p>No items added yet</p>
            `;

      cartTotalDisplay.textContent = "Total: $0.00";

      checkoutSection.style.display = "none";

      return;
    }

    cart.forEach((item) => {
      const cartItem = document.createElement("div");

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
                $${(Number(item.ItemPrice) * item.Quantity).toFixed(2)}
            </p>
        `;

      cartItemsContainer.appendChild(cartItem);
    });

    cartTotalDisplay.textContent = `Total: $${calculateCartTotal().toFixed(2)}`;
  }

  function saveCart() {
    sessionStorage.setItem("hawkerCart", JSON.stringify(cart));
  }
  function updateCartQuantity(menuItemID, change) {
    const cartItem = cart.find(
      (item) => item.MenuItemID === parseInt(menuItemID),
    );

    if (!cartItem) {
      return;
    }

    cartItem.Quantity += change;

    if (cartItem.Quantity <= 0) {
      cart = cart.filter((item) => item.MenuItemID !== parseInt(menuItemID));
    }

    saveCart();
    displayCart();
  }

  function removeFromCart(menuItemID) {
    cart = cart.filter((item) => item.MenuItemID !== parseInt(menuItemID));

    saveCart();
    displayCart();
  }
  function addToCart(menuItemID, quantity) {
    const selectedItem = menuItems.find(
      (item) => item.MenuItemID === parseInt(menuItemID),
    );

    if (!selectedItem) {
      return;
    }

    const existingCartItem = cart.find(
      (item) => item.MenuItemID === selectedItem.MenuItemID,
    );

    if (existingCartItem) {
      existingCartItem.Quantity += quantity;
    } else {
      cart.push({
        MenuItemID: selectedItem.MenuItemID,

        StallID: parseInt(stallID),

        ItemName: selectedItem.ItemName,

        ItemPrice: Number(selectedItem.ItemPrice),

        ImageURL: selectedItem.ImageURL,

        Quantity: quantity,
      });
    }

    saveCart();
    displayCart();

    alert(`${quantity} × ${selectedItem.ItemName} added to cart`);
  }

  function displayCheckoutSummary() {
    checkoutSummary.innerHTML = "";

    const selectedOrderType = document.querySelector(
      'input[name="orderType"]:checked',
    );

    const orderType = selectedOrderType ? selectedOrderType.value : "Pickup";

    const subtotal = calculateCartTotal();
    const deliveryFee = calculateDeliveryFee(orderType);
    const totalAmount = subtotal + deliveryFee;

    cart.forEach((item) => {
      const itemSubtotal = Number(item.ItemPrice) * item.Quantity;

      checkoutSummary.innerHTML += `
      <div class="checkout-item">
        <p>
          ${escapeHTML(item.ItemName)}
          × ${item.Quantity}
        </p>

        <p>
          $${itemSubtotal.toFixed(2)}
        </p>
      </div>
    `;
    });

    checkoutSummary.innerHTML += `
    <hr>

    <div class="checkout-item">
      <p>Subtotal</p>
      <p>$${subtotal.toFixed(2)}</p>
    </div>

    <div class="checkout-item">
      <p>Delivery Fee</p>
      <p>$${deliveryFee.toFixed(2)}</p>
    </div>

    <p class="checkout-total">
      <strong>
        Total:
        $${totalAmount.toFixed(2)}
      </strong>
    </p>
  `;
  }

  displayCart();
  loadStallDetails();
  loadMenuItems();
});
