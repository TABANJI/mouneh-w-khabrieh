document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const applyCoupon = document.getElementById("applyCoupon");
  const couponCode = document.getElementById("couponCode");
  const checkoutButton = document.getElementById("checkoutButton");

  function getCartItems() {
    return JSON.parse(localStorage.getItem("mounehCart")) || [];
  }

  function renderCart() {
    const items = getCartItems();
    if (!cartItemsContainer) return;
    if (items.length === 0) {
      cartItemsContainer.innerHTML = `<section class='section cart-empty-state'><h2>Your cart is empty</h2><p>Add premium pantry products to begin.</p><a class='button button-secondary' href='shop.html'>Browse Shop</a></section>`;
      if (cartSubtotal) cartSubtotal.textContent = "$0.00";
      setCheckoutAvailability(0);
      return;
    }
    cartItemsContainer.innerHTML = items
      .map((item) => {
        const product = products.find((product) => product.id === item.productId);
        if (!product) return "";
        const price = product.price * item.quantity;
        return `
          <div class="cart-item">
            <div class="cart-item-image" style="background-image:url('${product.images[0]}')"></div>
            <div class="cart-item-details">
              <h3>${product.name}</h3>
              <p>${product.subcategory} • ${item.size}</p>
              <div class="cart-item-controls">
                <button class="text-button qty-minus" data-product-id="${product.id}" data-size="${item.size}" type="button">−</button>
                <span>${item.quantity}</span>
                <button class="text-button qty-plus" data-product-id="${product.id}" data-size="${item.size}" type="button">+</button>
              </div>
              <div class="cart-item-actions">
                <button class="text-button remove-item" data-product-id="${product.id}" data-size="${item.size}" type="button">Remove</button>
                <button class="text-button save-later" data-product-id="${product.id}" type="button">Save for later</button>
              </div>
            </div>
            <div class="cart-item-price">
              <strong>${Mouneh.formatPrice(price)}</strong>
            </div>
          </div>`;
      })
      .join("");
    updateSubtotal(items);
    attachCartEvents();
  }

  function updateSubtotal(items) {
    const total = items.reduce((sum, item) => {
      const product = products.find((prod) => prod.id === item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);
    if (cartSubtotal) cartSubtotal.textContent = Mouneh.formatPrice(total);
    setCheckoutAvailability(total);
  }

  function setCheckoutAvailability(total) {
    if (!checkoutButton) return;
    const enabled = Number.isFinite(total) && total > 0;
    checkoutButton.disabled = !enabled;
    checkoutButton.setAttribute("aria-disabled", String(!enabled));
  }

  function saveCart(items) {
    localStorage.setItem("mounehCart", JSON.stringify(items));
    Mouneh.init();
  }

  function attachCartEvents() {
    document.querySelectorAll(".qty-minus").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const size = button.dataset.size;
        const items = getCartItems();
        const item = items.find((entry) => entry.productId === productId && entry.size === size);
        if (!item) return;
        item.quantity = Math.max(1, item.quantity - 1);
        saveCart(items);
        renderCart();
      });
    });

    document.querySelectorAll(".qty-plus").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const size = button.dataset.size;
        const items = getCartItems();
        const item = items.find((entry) => entry.productId === productId && entry.size === size);
        if (!item) return;
        item.quantity += 1;
        saveCart(items);
        renderCart();
      });
    });

    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const size = button.dataset.size;
        const items = getCartItems().filter((entry) => !(entry.productId === productId && entry.size === size));
        saveCart(items);
        renderCart();
      });
    });

    document.querySelectorAll(".save-later").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        Mouneh.toggleWishlist(productId);
        const items = getCartItems().filter((entry) => entry.productId !== productId);
        saveCart(items);
        renderCart();
      });
    });
  }

  if (applyCoupon && couponCode) {
    applyCoupon.addEventListener("click", () => {
      if (!couponCode.value.trim()) {
        Mouneh.toast("Enter a coupon code to apply.");
        return;
      }
      Mouneh.toast("This coupon code could not be applied.");
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (checkoutButton.disabled) return;
      Mouneh.toast("Checkout is temporarily unavailable. Please try again shortly.");
    });
  }

  renderCart();
});
