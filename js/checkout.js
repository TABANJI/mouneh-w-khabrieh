document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const itemsContainer = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("checkoutSubtotal");
  const shippingElement = document.getElementById("checkoutShipping");
  const totalElement = document.getElementById("checkoutTotal");
  const couponElement = document.getElementById("checkoutCoupon");
  const differentAddress = document.getElementById("differentAddress");
  const alternateDelivery = document.getElementById("alternateDelivery");
  const placeOrderButton = document.getElementById("placeOrderButton");
  const shippingError = document.getElementById("shippingError");
  const paymentError = document.getElementById("paymentError");

  const shippingMethods = {
    beirut:{ label:"Beirut delivery", cost:0 },
    "outside-beirut":{ label:"Delivery outside Beirut", cost:3 },
    pickup:{ label:"Local pickup", cost:0 }
  };
  const paymentMethods = {
    "cash-on-delivery":"Cash on delivery",
    usdt:"Pay by USDT",
    "wish-money":"Wish Money"
  };

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  const cart = readJson("mounehCart", []);
  const checkoutState = readJson("mounehCheckout", {});
  const draft = readJson("mounehCheckoutDraft", {});
  const validItems = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? { item, product } : null;
  }).filter(Boolean);
  const subtotal = validItems.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);

  function selectedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function shippingCost() {
    return shippingMethods[selectedValue("shippingMethod")]?.cost || 0;
  }

  function updateTotals() {
    const cost = shippingCost();
    if (subtotalElement) subtotalElement.textContent = Mouneh.formatPrice(subtotal);
    if (shippingElement) shippingElement.textContent = cost ? Mouneh.formatPrice(cost) : "Free";
    if (totalElement) totalElement.textContent = Mouneh.formatPrice(subtotal + cost);
  }

  function renderItems() {
    if (!itemsContainer) return;
    itemsContainer.innerHTML = validItems.length ? validItems.map(({ item, product }) => `
      <article class="checkout-item">
        <img src="${product.images[0]}" alt="" />
        <div><strong>${product.name}</strong><small>${item.size} · Qty ${item.quantity} · ${Mouneh.formatPrice(product.price)} each</small></div>
        <span>${Mouneh.formatPrice(product.price * item.quantity)}</span>
      </article>`).join("") : `<p class="checkout-empty">Your cart is empty. <a href="shop.html">Return to the shop</a> to add products.</p>`;
  }

  function setRadio(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }

  function restoreDraft() {
    if (!form || !draft.fields) return;
    Object.entries(draft.fields).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field || field instanceof RadioNodeList || field.type === "radio" || field.type === "checkbox") return;
      field.value = value;
    });
    differentAddress.checked = Boolean(draft.differentAddress);
    setRadio("shippingMethod", draft.shippingMethod || "beirut");
    setRadio("paymentMethod", draft.paymentMethod || "cash-on-delivery");
  }

  function formFields() {
    if (!form) return {};
    return Object.fromEntries(Array.from(new FormData(form).entries()).filter(([key]) => !["shippingMethod","paymentMethod","differentAddress"].includes(key)));
  }

  function saveDraft() {
    localStorage.setItem("mounehCheckoutDraft", JSON.stringify({
      fields:formFields(),
      differentAddress:differentAddress?.checked || false,
      shippingMethod:selectedValue("shippingMethod"),
      paymentMethod:selectedValue("paymentMethod")
    }));
  }

  function updateAlternateDelivery() {
    const open = Boolean(differentAddress?.checked);
    alternateDelivery?.classList.toggle("is-open", open);
    alternateDelivery?.setAttribute("aria-hidden", String(!open));
    alternateDelivery?.querySelectorAll("input,select").forEach((field) => {
      field.required = open && ["deliveryFirstName","deliveryLastName","deliveryCountry","deliveryAddress","deliveryCity","deliveryPhone"].includes(field.name);
    });
  }

  function updatePaymentDetails() {
    const selected = selectedValue("paymentMethod");
    document.querySelectorAll(".payment-detail").forEach((detail) => {
      detail.hidden = detail.dataset.payment !== selected;
    });
  }

  function errorMessage(field) {
    if (field.validity.valueMissing) return "This field is required.";
    if (field.validity.typeMismatch) return "Enter a valid email address.";
    return "Check this field and try again.";
  }

  function validateField(field) {
    const error = field.closest("label")?.querySelector(".field-error");
    const valid = field.checkValidity();
    field.setAttribute("aria-invalid", String(!valid));
    if (error) error.textContent = valid ? "" : errorMessage(field);
    return valid;
  }

  function validateForm() {
    let valid = true;
    form?.querySelectorAll("input,select").forEach((field) => {
      if ((field.required || field.value) && !["radio","checkbox"].includes(field.type)) valid = validateField(field) && valid;
    });
    const shippingValid = Boolean(selectedValue("shippingMethod"));
    const paymentValid = Boolean(selectedValue("paymentMethod"));
    shippingError.textContent = shippingValid ? "" : "Select a shipping option.";
    paymentError.textContent = paymentValid ? "" : "Select a payment method.";
    return valid && shippingValid && paymentValid && validItems.length > 0;
  }

  function createOrder() {
    const shippingMethod = selectedValue("shippingMethod");
    const paymentMethod = selectedValue("paymentMethod");
    const fields = formFields();
    const cost = shippingMethods[shippingMethod].cost;
    const now = new Date();
    const order = {
      orderNumber:`MWK-${now.toISOString().slice(0,10).replaceAll("-","")}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      createdAt:now.toISOString(),
      items:validItems.map(({ item, product }) => ({ productId:product.id, slug:product.slug, name:product.name, size:item.size, quantity:item.quantity, unitPrice:product.price, lineTotal:product.price * item.quantity })),
      subtotal,
      shippingMethod,
      shippingLabel:shippingMethods[shippingMethod].label,
      shippingCost:cost,
      total:subtotal + cost,
      billing:{ firstName:fields.firstName, lastName:fields.lastName, company:fields.company || "", country:fields.country, address:fields.address, address2:fields.address2 || "", city:fields.city, postcode:fields.postcode || "", phone:fields.phone, email:fields.email },
      delivery:differentAddress.checked ? { firstName:fields.deliveryFirstName, lastName:fields.deliveryLastName, country:fields.deliveryCountry, address:fields.deliveryAddress, address2:fields.deliveryAddress2 || "", city:fields.deliveryCity, postcode:fields.deliveryPostcode || "", phone:fields.deliveryPhone } : { firstName:fields.firstName, lastName:fields.lastName, country:fields.country, address:fields.address, address2:fields.address2 || "", city:fields.city, postcode:fields.postcode || "", phone:fields.phone },
      notes:fields.notes || "",
      paymentMethod,
      paymentLabel:paymentMethods[paymentMethod],
      couponCode:checkoutState.couponCode || "",
      status:"Pending"
    };
    const orders = readJson("mounehOrders", []);
    orders.push(order);
    localStorage.setItem("mounehOrders", JSON.stringify(orders));
    localStorage.setItem("mounehLastOrder", JSON.stringify(order));
    localStorage.removeItem("mounehCart");
    localStorage.removeItem("mounehCheckout");
    localStorage.removeItem("mounehCheckoutDraft");
    Mouneh.init();
    window.location.assign("checkout-success.html");
  }

  renderItems();
  restoreDraft();
  updateAlternateDelivery();
  updatePaymentDetails();
  updateTotals();
  if (couponElement && checkoutState.couponCode) {
    couponElement.hidden = false;
    couponElement.textContent = `Coupon entered: ${checkoutState.couponCode}`;
  }
  if (placeOrderButton) placeOrderButton.disabled = validItems.length === 0;

  differentAddress?.addEventListener("change", () => { updateAlternateDelivery(); saveDraft(); });
  document.querySelectorAll('input[name="shippingMethod"]').forEach((input) => input.addEventListener("change", () => { updateTotals(); saveDraft(); shippingError.textContent = ""; }));
  document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => input.addEventListener("change", () => { updatePaymentDetails(); saveDraft(); paymentError.textContent = ""; }));
  form?.addEventListener("input", (event) => { if (event.target.matches("input,select,textarea")) saveDraft(); });
  form?.addEventListener("change", saveDraft);
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    createOrder();
  });
});
