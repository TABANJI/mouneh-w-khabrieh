document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartPage = document.querySelector(".cart-page");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartEstimatedTotal = document.getElementById("cartEstimatedTotal");
  const cartSummary = document.querySelector(".cart-summary");
  const cartStickyCheckout = document.getElementById("cartStickyCheckout");
  const cartStickyTotal = document.getElementById("cartStickyTotal");
  const stickyCheckoutButton = document.getElementById("stickyCheckoutButton");
  const applyCoupon = document.getElementById("applyCoupon");
  const couponCode = document.getElementById("couponCode");
  const checkoutButton = document.getElementById("checkoutButton");

  try {
    const savedCheckout = JSON.parse(localStorage.getItem("mounehCheckout")) || {};
    if (couponCode && savedCheckout.couponCode) couponCode.value = savedCheckout.couponCode;
  } catch {
    localStorage.removeItem("mounehCheckout");
  }

  function getCartItems() {
    return JSON.parse(localStorage.getItem("mounehCart")) || [];
  }

  function renderCart() {
    const items = getCartItems();
    if (!cartItemsContainer) return;
    if (items.length === 0) {
      cartPage?.classList.add("is-cart-empty");
      cartItemsContainer.innerHTML = `<section class="cart-empty-state">
        <svg class="ui-icon cart-empty-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 13H6L5 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path></svg>
        <h2>Your cart is empty</h2>
        <p>Add something special from our pantry<br />and return here when you're ready.</p>
        <a class="button button-primary" href="shop.html">Return to Shop</a>
      </section>`;
      if (cartSubtotal) cartSubtotal.textContent = "$0.00";
      if (cartEstimatedTotal) cartEstimatedTotal.textContent = "$0.00";
      if (cartSummary) cartSummary.hidden = true;
      if (cartStickyCheckout) cartStickyCheckout.hidden = true;
      setCheckoutAvailability(0);
      return;
    }
    cartPage?.classList.remove("is-cart-empty");
    if (cartSummary) cartSummary.hidden = false;
    if (cartStickyCheckout) cartStickyCheckout.hidden = false;
    cartItemsContainer.innerHTML = items
      .map((item) => {
        const product = products.find((product) => product.id === item.productId);
        if (!product) return "";
        const price = product.price * item.quantity;
        return `
          <div class="cart-item">
            <a class="cart-item-image" href="product.html?product=${product.slug}" aria-label="View ${product.name}"><img src="${product.images[0]}" alt="" loading="lazy" decoding="async" /></a>
            <div class="cart-item-details">
              <h3>${product.name}</h3>
              <p>${product.subcategory} • ${item.size}</p>
              <span class="cart-unit-price">${Mouneh.formatPrice(product.price)} each</span>
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
    if (cartEstimatedTotal) cartEstimatedTotal.textContent = Mouneh.formatPrice(total);
    if (cartStickyTotal) cartStickyTotal.textContent = Mouneh.formatPrice(total);
    setCheckoutAvailability(total);
  }

  function setCheckoutAvailability(total) {
    const enabled = Number.isFinite(total) && total > 0;
    [checkoutButton, stickyCheckoutButton].forEach((button) => {
      if (!button) return;
      button.disabled = !enabled;
      button.setAttribute("aria-disabled", String(!enabled));
    });
  }

  function beginCheckout() {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);
    if (!items.length || !Number.isFinite(subtotal) || subtotal <= 0) return;
    localStorage.setItem("mounehCheckout", JSON.stringify({
      items,
      couponCode:couponCode?.value.trim() || "",
      subtotal,
      total:subtotal,
      updatedAt:new Date().toISOString()
    }));
    window.location.assign("checkout.html");
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

  checkoutButton?.addEventListener("click", beginCheckout);
  stickyCheckoutButton?.addEventListener("click", beginCheckout);

  renderCart();
});
