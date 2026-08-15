document.addEventListener("DOMContentLoaded", () => {
  const itemsContainer = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const totalElement = document.getElementById("checkoutTotal");
  const couponElement = document.getElementById("checkoutCoupon");
  const detailsForm = document.getElementById("checkoutDetailsForm");

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  const cart = readJson("mounehCart", []);
  const checkoutState = readJson("mounehCheckout", {});
  const validItems = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? { item, product } : null;
  }).filter(Boolean);
  const subtotal = validItems.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);

  if (itemsContainer) {
    itemsContainer.innerHTML = validItems.length ? validItems.map(({ item, product }) => `
      <article class="checkout-item">
        <img src="${product.images[0]}" alt="" />
        <div><strong>${product.name}</strong><small>${item.size} · Qty ${item.quantity}</small></div>
        <span>${Mouneh.formatPrice(product.price * item.quantity)}</span>
      </article>`).join("") : `<p class="checkout-empty">Your cart is empty. <a href="shop.html">Return to the shop</a> to add products.</p>`;
  }
  if (subtotalElement) subtotalElement.textContent = Mouneh.formatPrice(subtotal);
  if (totalElement) totalElement.textContent = Mouneh.formatPrice(subtotal);
  if (couponElement && checkoutState.couponCode) {
    couponElement.hidden = false;
    couponElement.textContent = `Coupon entered: ${checkoutState.couponCode}`;
  }
  const submitButton = detailsForm?.querySelector("button[type='submit']");
  if (submitButton) submitButton.disabled = subtotal <= 0;

  detailsForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (subtotal <= 0 || !detailsForm.reportValidity()) return;
    localStorage.setItem("mounehCheckoutDetails", JSON.stringify(Object.fromEntries(new FormData(detailsForm))));
    Mouneh.toast("Delivery details saved.");
  });
});
