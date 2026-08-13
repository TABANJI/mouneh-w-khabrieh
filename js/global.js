const Mouneh = (function () {
  const STORAGE_KEYS = {
    cart: "mounehCart",
    wishlist: "mounehWishlist",
    newsletter: "mounehNewsletter",
    recentlyViewed: "mounehRecentlyViewed"
  };

  const state = {
    cart: [],
    wishlist: [],
    language: "en"
  };

  function formatPrice(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  }

  function getStoredData(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadState() {
    state.cart = getStoredData(STORAGE_KEYS.cart);
    state.wishlist = getStoredData(STORAGE_KEYS.wishlist);
  }

  function getCartQuantity() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function findProduct(productId) {
    return products.find((item) => item.id === productId || item.slug === productId);
  }

  function getCartItem(productId, size) {
    return state.cart.find((item) => item.productId === productId && item.size === size);
  }

  function addToCart(productId, size, quantity = 1) {
    const existing = getCartItem(productId, size);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({ productId, size, quantity });
    }
    saveStoredData(STORAGE_KEYS.cart, state.cart);
    updateHeaderCounts();
    toast("Added to cart");
  }

  function updateCartQuantity(productId, size, quantity) {
    const item = getCartItem(productId, size);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveStoredData(STORAGE_KEYS.cart, state.cart);
      updateHeaderCounts();
    }
  }

  function removeCartItem(productId, size) {
    state.cart = state.cart.filter((item) => !(item.productId === productId && item.size === size));
    saveStoredData(STORAGE_KEYS.cart, state.cart);
    updateHeaderCounts();
    toast("Removed from cart");
  }

  function getWishlist() {
    return state.wishlist;
  }

  function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    if (index === -1) {
      state.wishlist.push(productId);
      toast("Added to wishlist");
    } else {
      state.wishlist.splice(index, 1);
      toast("Removed from wishlist");
    }
    saveStoredData(STORAGE_KEYS.wishlist, state.wishlist);
    updateHeaderCounts();
    return index === -1;
  }

  function isInWishlist(productId) {
    return state.wishlist.includes(productId);
  }

  function addRecentlyViewed(productId) {
    const viewed = getStoredData(STORAGE_KEYS.recentlyViewed);
    const updated = [productId, ...viewed.filter((id) => id !== productId)].slice(0, 12);
    saveStoredData(STORAGE_KEYS.recentlyViewed, updated);
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function createElementFromHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  function toast(message) {
    const overlay = document.getElementById("toastContainer");
    if (!overlay) return;
    const toastItem = document.createElement("div");
    toastItem.className = "toast-item";
    toastItem.textContent = message;
    overlay.appendChild(toastItem);
    requestAnimationFrame(() => toastItem.classList.add("visible"));
    setTimeout(() => {
      toastItem.classList.remove("visible");
      toastItem.addEventListener("transitionend", () => toastItem.remove(), { once: true });
    }, 2200);
  }

  function updateHeaderCounts() {
    const cartCount = document.querySelector("[data-cart-count]");
    const wishCount = document.querySelector("[data-wishlist-count]");
    if (cartCount) cartCount.textContent = getCartQuantity();
    if (wishCount) wishCount.textContent = state.wishlist.length;
  }

  function setHtmlDirection(direction) {
    document.documentElement.dir = direction;
  }

  function renderHeader() {
    const icon = (name) => {
      const paths = {
        search: '<circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path>',
        user: '<circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>',
        heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"></path>',
        bag: '<path d="M5 8h14l-1 13H6L5 8Z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path>',
        menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>'
      };
      return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
    };
    const nav = `
      <header class="site-header" role="banner">
        <div class="header-inner">
          <a class="brand-logo" href="index.html" aria-label="Mouneh w Khabrieh home">
            <div>
              <span class="brand-name">Mouneh w Khabrieh</span>
              <small>Lebanese artisanal pantry</small>
            </div>
          </a>
          <nav class="desktop-nav" aria-label="Primary navigation">
            <a href="index.html">Home</a>
            <a href="shop.html">Shop</a>
            <a href="about.html">Our Story</a>
            <a href="shop.html">Collections</a>
            <a href="contact.html">Contact</a>
          </nav>
          <div class="header-actions">
            <button class="icon-button" id="searchToggle" aria-label="Open search">
              ${icon("search")}
            </button>
            <button class="icon-button account-button" id="accountToggle" aria-label="Account">
              ${icon("user")}
            </button>
            <button class="icon-button mobile-menu-toggle" id="mobileMenuToggle" aria-label="Open menu">
              ${icon("menu")}
            </button>
            <a class="icon-button" href="wishlist.html" aria-label="Wishlist">
              ${icon("heart")}
              <span class="count-badge" data-wishlist-count>0</span>
            </a>
            <a class="icon-button" href="cart.html" aria-label="Cart">
              ${icon("bag")}
              <span class="count-badge" data-cart-count>0</span>
            </a>
            <div class="language-switcher" aria-label="Language selection">
              <button class="lang-button" data-lang="en">EN</button>
              <button class="lang-button" data-lang="ar">AR</button>
            </div>
          </div>
        </div>
      </header>
      <div class="mobile-menu-overlay" id="mobileMenuOverlay" aria-hidden="true">
        <div class="mobile-menu-panel">
          <button class="nav-close" id="mobileMenuClose" aria-label="Close menu">×</button>
          <div class="mobile-menu-brand">
            <strong>Mouneh w Khabrieh</strong>
            <p>Premium Lebanese pantry essentials.</p>
          </div>
          <nav class="mobile-nav" aria-label="Mobile primary navigation">
            <a href="index.html">Home</a>
            <a href="shop.html">Shop</a>
            <a href="about.html">Our Story</a>
            <a href="shop.html">Collections</a>
            <a href="contact.html">Contact</a>
          </nav>
          <div class="mobile-menu-footer">
            <a href="wishlist.html">Wishlist</a>
            <a href="cart.html">Cart</a>
            <div class="language-switcher-mobile">
              <button class="lang-button" data-lang="en">EN</button>
              <button class="lang-button" data-lang="ar">AR</button>
            </div>
          </div>
        </div>
      </div>
      <div class="site-search-overlay" id="searchOverlay" aria-hidden="true">
        <div class="search-panel">
          <button class="nav-close" id="searchClose" aria-label="Close search">×</button>
          <h2>Search products</h2>
          <input id="globalSearchInput" type="search" placeholder="Search by product, category or ingredient" autocomplete="off" />
          <div class="search-suggestions" id="searchSuggestions"></div>
        </div>
      </div>
      <div id="toastContainer" class="toast-container"></div>
    `;
    const headerContainer = document.getElementById("site-header");
    if (headerContainer) headerContainer.innerHTML = nav;
  }

  function renderFooter() {
    const footer = `
      <footer class="site-footer">
        <div class="footer-brand">
          <span>Lebanese pantry &amp; stories</span>
          <strong>Mouneh w Khabrieh</strong>
          <p>Lebanese flavors, stories and traditions preserved for modern tables.</p>
        </div>
        <div class="footer-grid">
          <div>
            <span>Shop</span>
            <a href="shop.html">Shop All</a>
            <a href="shop.html?category=mouneh">Mouneh</a>
            <a href="shop.html?category=olive-oil">Olive Oil</a>
            <a href="shop.html?category=spices-herbs">Spices &amp; Herbs</a>
            <a href="shop.html?category=nuts">Nuts</a>
          </div>
          <div>
            <span>Our Story</span>
            <a href="about.html">About</a>
            <a href="index.html#product-stories">Stories</a>
            <a href="contact.html">Contact</a>
          </div>
          <div>
            <span>Customer Care</span>
            <a href="#">FAQ</a>
            <a href="#">Delivery</a>
            <a href="#">Returns</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <div>
            <span>Contact</span>
            <a href="mailto:mounehwkhabrieh@gmail.com">mounehwkhabrieh@gmail.com</a>
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">Facebook</a>
            <a href="#">WhatsApp</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Mouneh w Khabrieh</p>
          <p><a href="https://mounehwkhabrieh.com">mounehwkhabrieh.com</a> · <a href="#">Privacy</a> · <a href="#">Terms</a></p>
        </div>
      </footer>
    `;
    const footerContainer = document.getElementById("site-footer");
    if (footerContainer) footerContainer.innerHTML = footer;
  }

  function openOverlay(element) {
    element.classList.add("active");
    element.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
  }

  function closeOverlay(element) {
    element.classList.remove("active");
    element.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
  }

  function initHeaderInteractions() {
    const searchToggle = document.getElementById("searchToggle");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchClose = document.getElementById("searchClose");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const mobileMenuClose = document.getElementById("mobileMenuClose");
    const accountToggle = document.getElementById("accountToggle");
    const langButtons = document.querySelectorAll(".lang-button");

    if (searchToggle && searchOverlay && searchClose) {
      searchToggle.addEventListener("click", () => openOverlay(searchOverlay));
      searchClose.addEventListener("click", () => closeOverlay(searchOverlay));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeOverlay(searchOverlay);
      });
    }

    if (mobileMenuToggle && mobileMenuOverlay && mobileMenuClose) {
      mobileMenuToggle.addEventListener("click", () => openOverlay(mobileMenuOverlay));
      mobileMenuClose.addEventListener("click", () => closeOverlay(mobileMenuOverlay));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeOverlay(mobileMenuOverlay);
      });
    }

    langButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.language = button.dataset.lang;
        setHtmlDirection(state.language === "ar" ? "rtl" : "ltr");
      });
    });

    if (accountToggle) accountToggle.addEventListener("click", () => toast("Customer accounts are coming soon."));

    window.addEventListener("scroll", () => {
      const header = document.querySelector(".site-header");
      if (!header) return;
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  function renderCategoryTiles(container, items) {
    if (!container) return;
    container.innerHTML = items
      .map(
        (category, index) => `
        <a href="shop.html?category=${category.id}" class="category-tile category-tile-${index + 1}" aria-label="Shop ${category.title}">
          <div>
            <span class="category-index">${String(index + 1).padStart(2, "0")}</span>
            <strong>${category.title}</strong>
            <p>${category.description}</p>
          </div>
        </a>`
      )
      .join("");
  }

  function renderProductCard(product, options = {}) {
    const isWishlisted = isInWishlist(product.id);
    const cardClasses = ["product-card"];
    if (product.badge) cardClasses.push("has-badge");
    if (product.detailsPending) cardClasses.push("details-pending");
    const minimalPending = options.minimalPending && product.detailsPending;
    return `
      <article class="${cardClasses.join(" ")}">
        <a class="product-image-link" href="product.html?product=${product.slug}">
          <div class="product-image" data-image-src="${product.images[0]}">
            <span class="image-fallback-label">${product.name}</span>
            <img class="product-packshot" src="${product.images[0]}" alt="${product.name}" loading="lazy" decoding="async" style="--packshot-size:${product.imageScale || 112}%;object-position:${product.imagePosition || "center"}" />
          </div>
        </a>
        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-category">${categories.find((cat) => cat.id === product.category)?.title || product.category}</span>
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          </div>
          <a class="product-title" href="product.html?product=${product.slug}">${product.name}</a>
          ${minimalPending ? "" : `<span class="product-size">${product.sizes.join(" · ")}</span>`}
          ${minimalPending ? "" : `<div class="product-line">
            <span class="product-price">${product.detailsPending ? "Details coming soon" : formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span class="product-old-price">${formatPrice(product.oldPrice)}</span>` : ""}
          </div>`}
          <div class="product-actions">
            <button class="wishlist-button ${isWishlisted ? "is-saved" : ""}" data-product-id="${product.id}" type="button" aria-label="${isWishlisted ? "Remove from" : "Add to"} wishlist">♡</button>
            ${minimalPending ? "" : `<button class="button button-sm add-cart-button" data-product-id="${product.id}" type="button" ${product.detailsPending ? "disabled" : ""}>${product.detailsPending ? "Coming Soon" : "Add to Cart"}</button>`}
          </div>
        </div>
      </article>
    `;
  }

  function renderSectionProducts(container, items, options = {}) {
    if (!container) return;
    container.innerHTML = items.map((product) => renderProductCard(product, options)).join("");
    attachProductCardEvents(container);
  }

  function attachProductCardEvents(context) {
    if (!context) return;
    context.querySelectorAll("[data-image-src]").forEach((visual) => {
      const probe = new Image();
      probe.onload = () => visual.classList.add("has-real-image");
      probe.src = visual.dataset.imageSrc;
      const image = visual.querySelector(".product-packshot");
      if (image) {
        const markLoaded = () => visual.classList.add("has-real-image");
        const markFailed = () => { image.hidden = true; visual.classList.remove("has-real-image"); };
        image.addEventListener("load", markLoaded, { once: true });
        image.addEventListener("error", markFailed, { once: true });
        if (image.complete) image.naturalWidth ? markLoaded() : markFailed();
      }
    });
    const addButtons = context.querySelectorAll(".add-cart-button");
    addButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const product = findProduct(productId);
        if (product) addToCart(product.id, product.sizes[0], 1);
      });
    });
    const wishlistButtons = context.querySelectorAll(".wishlist-button");
    wishlistButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const added = toggleWishlist(productId);
        button.textContent = added ? "♥" : "♡";
        button.classList.toggle("is-saved", added);
      });
    });
  }

  function initializeSearchOverlay() {
    const searchInput = document.getElementById("globalSearchInput");
    const suggestions = document.getElementById("searchSuggestions");
    if (!searchInput || !suggestions) return;

    searchInput.addEventListener("input", () => {
      const value = searchInput.value.trim().toLowerCase();
      if (!value) {
        suggestions.innerHTML = "<p class='suggestion-note'>Search products by name, category or ingredients.</p>";
        return;
      }
      const matches = products
        .filter((product) => {
          return [product.name, product.category, product.subcategory, product.shortDescription, product.story]
            .join(" ")
            .toLowerCase()
            .includes(value);
        })
        .slice(0, 6);
      suggestions.innerHTML = matches.length
        ? matches
            .map(
              (product) => `
                <a class="search-suggestion" href="product.html?product=${product.slug}">
                  <span>${product.name}</span>
                  <small>${categories.find((cat) => cat.id === product.category)?.title || product.category}</small>
                </a>`
            )
            .join("")
        : `<p class='suggestion-note'>No matches found.</p>`;
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const term = searchInput.value.trim();
        if (term) window.location.href = `shop.html?search=${encodeURIComponent(term)}`;
      }
    });
  }

  function initializeNewsletterForm() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.querySelector("input[type='email']").value.trim();
      if (!email) return;
      const stored = getStoredData(STORAGE_KEYS.newsletter);
      const updated = Array.from(new Set([email, ...stored]));
      saveStoredData(STORAGE_KEYS.newsletter, updated);
      form.reset();
      toast("Thank you — you'll hear from us soon.");
    });
  }

  function init() {
    loadState();
    renderHeader();
    renderFooter();
    updateHeaderCounts();
    initHeaderInteractions();
    initializeSearchOverlay();
    initializeNewsletterForm();
    const categoryGrid = document.getElementById("categoryGrid");
    if (categoryGrid) {
      renderCategoryTiles(categoryGrid, categories);
    }
  }

  return {
    init,
    formatPrice,
    getQueryParam,
    renderProductCard,
    renderSectionProducts,
    attachProductCardEvents,
    toast,
    categories,
    products,
    findProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    getCartQuantity,
    getWishlist,
    addRecentlyViewed,
    state
  };
})();

document.addEventListener("DOMContentLoaded", Mouneh.init);
