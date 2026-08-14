document.addEventListener("DOMContentLoaded", () => {
  const productSlug = Mouneh.getQueryParam("product");
  const product = products.find((item) => item.slug === productSlug);
  const breadcrumb = document.getElementById("breadcrumbProduct");
  const galleryMain = document.getElementById("productGalleryMain");
  const galleryThumbs = document.getElementById("productGalleryThumbs");
  const categoryEl = document.getElementById("productCategory");
  const originEl = document.getElementById("productOrigin");
  const nameEl = document.getElementById("productName");
  const taglineEl = document.getElementById("productTagline");
  const pricingEl = document.getElementById("productPricing");
  const availabilityEl = document.getElementById("productAvailability");
  const shortEl = document.getElementById("productShort");
  const storyEl = document.getElementById("productStory");
  const ingredientsEl = document.getElementById("productIngredients");
  const originDetailEl = document.getElementById("productOriginDetail");
  const storageEl = document.getElementById("productStorage");
  const enjoyEl = document.getElementById("productEnjoy");
  const sizeSelect = document.getElementById("sizeSelect");
  const qtyInput = document.getElementById("quantityInput");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const purchaseForm = document.getElementById("productPurchaseForm");
  const buyNowButton = document.getElementById("buyNowButton");
  const wishlistButton = document.getElementById("wishlistButton");
  const shareButton = document.getElementById("shareButton");
  const relatedGrid = document.getElementById("relatedProductGrid");

  if (!product) {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = "<section class='section'><h2>Product not found</h2><p>The requested product could not be located. Please return to the shop and select another item.</p><a class='button button-secondary' href='shop.html'>Back to shop</a></section>";
    }
    return;
  }

  const categoryLabel = categories.find((cat) => cat.id === product.category)?.title || product.category;
  const firstImage = product.images[0] || "assets/images/placeholder-product.svg";

  if (breadcrumb) breadcrumb.textContent = product.name;
  if (categoryEl) categoryEl.textContent = categoryLabel;
  if (originEl) originEl.textContent = product.origin;
  if (nameEl) nameEl.textContent = product.name;
  if (taglineEl) taglineEl.textContent = product.shortDescription;
  if (shortEl) shortEl.textContent = product.description;
  if (storyEl) storyEl.textContent = product.story;
  if (ingredientsEl) ingredientsEl.textContent = product.ingredients;
  if (originDetailEl) originDetailEl.textContent = product.origin;
  if (storageEl) storageEl.textContent = product.storage;
  if (enjoyEl) enjoyEl.textContent = product.howToEnjoy;

  if (pricingEl) {
    pricingEl.innerHTML = product.detailsPending
      ? "<strong class='details-pending'>Details coming soon</strong>"
      : `<strong>${Mouneh.formatPrice(product.price)}</strong>${product.oldPrice ? `<span class='old-price'>${Mouneh.formatPrice(product.oldPrice)}</span>` : ""}`;
  }

  if (availabilityEl) {
    availabilityEl.textContent = product.detailsPending ? "Availability to be confirmed" : product.stock > 0 ? `In stock (${product.stock} left)` : "Out of stock";
  }

  function renderGallery(selectedImage) {
    if (!galleryMain || !galleryThumbs) return;
    galleryMain.innerHTML = `<img src="${selectedImage}" alt="${product.name}" decoding="async" />`;
    const mainImage = galleryMain.querySelector("img");
    mainImage.addEventListener("error", () => {
      mainImage.hidden = true;
      galleryMain.classList.add("image-failed");
    }, { once: true });
    galleryThumbs.innerHTML = product.images
      .map(
        (src, index) => `
          <button class="gallery-thumb" type="button" data-src="${src}" aria-label="View image ${index + 1}"><img src="${src}" alt="" loading="lazy" decoding="async" /></button>`
      )
      .join("");
    galleryThumbs.querySelectorAll(".gallery-thumb").forEach((button) => {
      button.addEventListener("click", () => {
        renderGallery(button.dataset.src);
      });
    });
    galleryThumbs.hidden = product.images.length < 2;
  }

  renderGallery(firstImage);

  if (product.detailsPending) {
    purchaseForm.classList.add("details-pending-form");
    purchaseForm.querySelectorAll("button, select, input").forEach((control) => control.disabled = true);
    buyNowButton.disabled = true;
  }

  product.sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeSelect.appendChild(option);
  });

  qtyMinus.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });

  qtyPlus.addEventListener("click", () => {
    qtyInput.value = Number(qtyInput.value) + 1;
  });

  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (product.detailsPending) return;
    Mouneh.addToCart(product.id, sizeSelect.value || product.sizes[0], Number(qtyInput.value));
  });

  buyNowButton.addEventListener("click", () => {
    if (product.detailsPending) return;
    Mouneh.addToCart(product.id, sizeSelect.value || product.sizes[0], Number(qtyInput.value));
    window.location.href = "cart.html";
  });

  function updateWishlistButton() {
    const saved = Mouneh.isInWishlist(product.id);
    wishlistButton.textContent = saved ? "Saved" : "Add to Wishlist";
  }

  wishlistButton.addEventListener("click", () => {
    Mouneh.toggleWishlist(product.id);
    updateWishlistButton();
  });

  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: product.name,
      text: `Explore ${product.name} at Mouneh w Khabrieh`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.warn(error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      Mouneh.toast("Product link copied to clipboard");
    }
  });

  updateWishlistButton();
  Mouneh.addRecentlyViewed(product.id);

  if (relatedGrid) {
    const related = products
      .filter((item) =>
        item.category === product.category &&
        item.id !== product.id &&
        item.images?.[0] &&
        item.sizes?.length &&
        Number.isFinite(item.price) &&
        item.stock > 0
      )
      .slice(0, 4);
    if (related.length) {
      relatedGrid.innerHTML = related.map((item) => Mouneh.renderProductCard(item)).join("");
      Mouneh.attachProductCardEvents(relatedGrid);
    }
  }
});
