document.addEventListener("DOMContentLoaded", () => {
  const wishlistGrid = document.getElementById("wishlistGrid");
  const wishlistEmpty = document.getElementById("wishlistEmpty");
  const wishlistPage = document.querySelector(".wishlist-page");

  function renderWishlist() {
    const wishlist = JSON.parse(localStorage.getItem("mounehWishlist")) || [];
    if (!wishlistGrid) return;
    if (wishlist.length === 0) {
      wishlistGrid.innerHTML = "";
      wishlistEmpty?.classList.add("visible");
      wishlistPage?.classList.add("is-wishlist-empty");
      return;
    }
    wishlistEmpty?.classList.remove("visible");
    wishlistPage?.classList.remove("is-wishlist-empty");
    const items = wishlist
      .map((productId) => products.find((product) => product.id === productId))
      .filter((product) => product && product.images?.[0] && Number.isFinite(product.price));
    if (!items.length) {
      wishlistGrid.innerHTML = "";
      wishlistEmpty?.classList.add("visible");
      wishlistPage?.classList.add("is-wishlist-empty");
      return;
    }
    wishlistGrid.innerHTML = items.map((product) => Mouneh.renderProductCard(product)).join("");
    Mouneh.attachProductCardEvents(wishlistGrid);
  }

  wishlistGrid?.addEventListener("click", (event) => {
    if (event.target.closest(".wishlist-button")) setTimeout(renderWishlist, 0);
  });

  renderWishlist();
});
