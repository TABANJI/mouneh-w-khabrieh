document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("shopProductGrid");
  const resultCount = document.getElementById("resultCount");
  const categoryFilters = document.getElementById("categoryFilters");
  const tagFilters = document.getElementById("tagFilters");
  const searchInput = document.getElementById("searchInput");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const filterInStock = document.getElementById("filterInStock");
  const filterOnSale = document.getElementById("filterOnSale");
  const sortSelect = document.getElementById("sortSelect");
  const loadMoreButton = document.getElementById("loadMore");
  const clearFiltersButton = document.getElementById("clearFilters");
  const filtersPanel = document.getElementById("shopFilters");
  const openFiltersButton = document.getElementById("openFilters");
  const closeFiltersButton = document.getElementById("closeFilters");
  const applyFiltersButton = document.getElementById("applyFilters");
  const filterAccordions = Array.from(document.querySelectorAll("[data-filter-accordion]"));

  const tags = ["bestseller", "newArrival", "onSale", "gift", "pantry"];
  let catalogProducts = [];
  let activePage = 1;
  const pageSize = 8;

  function buildFilterOptions() {
    if (categoryFilters) {
      categoryFilters.innerHTML = categories
        .map(
          (category) => `
          <label><input type="checkbox" value="${category.id}" /> ${category.title}</label>`
        )
        .join("");
    }
    if (tagFilters) {
      tagFilters.innerHTML = tags
        .map((tag) => `
          <label><input type="checkbox" value="${tag}" /> ${tag.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</label>`
        )
        .join("");
    }
  }

  function getActiveFilters() {
    const activeCategories = Array.from(categoryFilters.querySelectorAll("input:checked")).map((input) => input.value);
    const activeTags = Array.from(tagFilters.querySelectorAll("input:checked")).map((input) => input.value);
    return {
      search: searchInput.value.trim().toLowerCase(),
      categories: activeCategories,
      tags: activeTags,
      minPrice: Number(priceMin.value) || 0,
      maxPrice: Number(priceMax.value) || Infinity,
      inStock: filterInStock.checked,
      onSale: filterOnSale.checked,
      sort: sortSelect.value
    };
  }

  function filterProducts() {
    const filters = getActiveFilters();
    const queryCategory = Mouneh.getQueryParam("category");
    const searchQuery = Mouneh.getQueryParam("search");

    let filtered = catalogProducts.filter((product) => {
      const matchesCategory = filters.categories.length
        ? filters.categories.includes(product.category)
        : queryCategory
        ? product.category === queryCategory
        : true;
      const matchesTag = filters.tags.length ? filters.tags.some((tag) => product.tags.includes(tag)) : true;
      const matchesStock = filters.inStock ? product.stock > 0 : true;
      const matchesSale = filters.onSale ? Boolean(product.oldPrice) : true;
      const hasPriceFilter = filters.minPrice > 0 || Number.isFinite(filters.maxPrice);
      const matchesPrice = !hasPriceFilter || (Number.isFinite(product.price) && product.price >= filters.minPrice && product.price <= filters.maxPrice);
      const searchValue = [product.name, product.category, product.subcategory, product.shortDescription, product.story].join(" ").toLowerCase();
      const matchesSearch = filters.search ? searchValue.includes(filters.search) : searchQuery ? searchValue.includes(searchQuery.toLowerCase()) : true;
      return matchesCategory && matchesTag && matchesStock && matchesSale && matchesPrice && matchesSearch;
    });

    if (filters.sort === "low") {
      filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (filters.sort === "high") {
      filtered.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (filters.sort === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "newest") {
      filtered.sort((a, b) => (b.newArrival === a.newArrival ? 0 : b.newArrival ? 1 : -1));
    }

    return filtered;
  }

  function renderProducts() {
    const filtered = filterProducts();
    const displayed = filtered.slice(0, activePage * pageSize);
    if (productGrid) productGrid.innerHTML = displayed.map((product) => Mouneh.renderProductCard(product)).join("");
    if (resultCount) resultCount.textContent = `${filtered.length} products available`;
    if (applyFiltersButton) applyFiltersButton.textContent = `Show ${filtered.length} results`;
    if (loadMoreButton) loadMoreButton.style.display = filtered.length > displayed.length ? "inline-flex" : "none";
    Mouneh.attachProductCardEvents(productGrid);
  }

  function clearFilters() {
    searchInput.value = "";
    priceMin.value = "";
    priceMax.value = "";
    filterInStock.checked = false;
    filterOnSale.checked = false;
    categoryFilters.querySelectorAll("input").forEach((input) => (input.checked = false));
    tagFilters.querySelectorAll("input").forEach((input) => (input.checked = false));
    updateAccordionCounts();
  }

  function updateAccordionCounts() {
    filterAccordions.forEach((accordion) => {
      const count = accordion.querySelectorAll(".filter-accordion-content input:checked").length;
      const countLabel = accordion.querySelector(".filter-accordion-count");
      if (countLabel) countLabel.textContent = count ? `(${count})` : "";
    });
  }

  function attachInputEvents() {
    const inputs = [searchInput, priceMin, priceMax, filterInStock, filterOnSale, sortSelect];
    inputs.forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        activePage = 1;
        renderProducts();
      });
    });
    categoryFilters.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        activePage = 1;
        updateAccordionCounts();
        renderProducts();
      });
    });
    tagFilters.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        activePage = 1;
        updateAccordionCounts();
        renderProducts();
      });
    });
    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", () => {
        activePage += 1;
        renderProducts();
      });
    }
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", () => {
        clearFilters();
        activePage = 1;
        renderProducts();
      });
    }
  }

  function setFilterDrawer(open, restoreFocus = true) {
    if (!filtersPanel || !openFiltersButton) return;
    filtersPanel.classList.toggle("is-open", open);
    filtersPanel.setAttribute("aria-hidden", String(!open));
    openFiltersButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("filter-drawer-open", open);
    if (open) closeFiltersButton?.focus();
    else if (restoreFocus) openFiltersButton.focus();
  }

  function initializeFilterDrawer() {
    if (!filtersPanel || !openFiltersButton) return;
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const syncAccordions = () => {
      filterAccordions.forEach((accordion) => {
        const toggle = accordion.querySelector(".filter-accordion-toggle");
        const content = accordion.querySelector(".filter-accordion-content");
        const expanded = mobileQuery.matches ? accordion.classList.contains("is-expanded") : true;
        accordion.classList.toggle("is-expanded", expanded);
        toggle?.setAttribute("aria-expanded", String(expanded));
        content?.setAttribute("aria-hidden", String(!expanded));
      });
    };
    const syncAccessibility = () => {
      if (mobileQuery.matches) {
        filtersPanel.setAttribute("aria-hidden", String(!filtersPanel.classList.contains("is-open")));
      } else {
        filtersPanel.classList.remove("is-open");
        filtersPanel.removeAttribute("aria-hidden");
        openFiltersButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("filter-drawer-open");
      }
      syncAccordions();
    };
    filterAccordions.forEach((accordion) => {
      const toggle = accordion.querySelector(".filter-accordion-toggle");
      toggle?.addEventListener("click", () => {
        if (!mobileQuery.matches) return;
        const expanded = !accordion.classList.contains("is-expanded");
        accordion.classList.toggle("is-expanded", expanded);
        toggle.setAttribute("aria-expanded", String(expanded));
        accordion.querySelector(".filter-accordion-content")?.setAttribute("aria-hidden", String(!expanded));
      });
    });
    openFiltersButton.addEventListener("click", () => setFilterDrawer(true));
    closeFiltersButton?.addEventListener("click", () => setFilterDrawer(false));
    applyFiltersButton?.addEventListener("click", () => setFilterDrawer(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && filtersPanel.classList.contains("is-open")) setFilterDrawer(false);
    });
    mobileQuery.addEventListener?.("change", syncAccessibility);
    window.addEventListener("pagehide", () => setFilterDrawer(false, false));
    syncAccessibility();
    updateAccordionCounts();
  }

  function imageLoads(src) {
    return new Promise((resolve) => {
      if (!src || !src.trim()) return resolve(false);
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  async function initializeCatalogProducts() {
    const checks = await Promise.all(products.map(async (product) => ({
      product,
      valid:await imageLoads(product.images?.[0] || "")
    })));
    catalogProducts = checks.filter((entry) => entry.valid).map((entry) => entry.product);
    renderProducts();
  }

  buildFilterOptions();
  attachInputEvents();
  initializeFilterDrawer();
  if (resultCount) resultCount.textContent = "Loading products";
  initializeCatalogProducts();
});
