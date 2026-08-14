document.addEventListener("DOMContentLoaded", () => {
  const wishlistGrid = document.getElementById("wishlistGrid");
  const wishlistEmpty = document.getElementById("wishlistEmpty");

  function renderWishlist() {
    const wishlist = JSON.parse(localStorage.getItem("mounehWishlist")) || [];
    if (!wishlistGrid) return;
    if (wishlist.length === 0) {
      wishlistGrid.innerHTML = "";
      wishlistEmpty?.classList.add("visible");
      return;
    }
    wishlistEmpty?.classList.remove("visible");
    const items = wishlist
      .map((productId) => products.find((product) => product.id === productId))
      .filter((product) =>
        product &&
        product.images?.[0] &&
        Number.isFinite(product.price) &&
        product.sizes?.length > 0 &&
        product.stock > 0 &&
        !product.detailsPending
      );
    wishlistGrid.innerHTML = items.map((product) => Mouneh.renderProductCard(product)).join("");
    Mouneh.attachProductCardEvents(wishlistGrid);
  }

  renderWishlist();
});
