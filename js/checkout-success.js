document.addEventListener("DOMContentLoaded", () => {
  const details = document.getElementById("successDetails");
  if (!details) return;
  let order = null;
  try { order = JSON.parse(localStorage.getItem("mounehLastOrder")); }
  catch { order = null; }
  if (!order) {
    details.innerHTML = `<div><span>Order</span><strong>No recent order found</strong></div>`;
    return;
  }
  const customerName = `${order.billing?.firstName || ""} ${order.billing?.lastName || ""}`.trim();
  details.innerHTML = `
    <div><span>Order number</span><strong>${order.orderNumber}</strong></div>
    <div><span>Total</span><strong>${Mouneh.formatPrice(order.total)}</strong></div>
    <div><span>Payment method</span><strong>${order.paymentLabel}</strong></div>
    <div><span>Delivery method</span><strong>${order.shippingLabel}</strong></div>
    <div><span>Customer</span><strong>${customerName}</strong></div>
    <div><span>Status</span><strong>${order.status}</strong></div>`;
});
