document.addEventListener("DOMContentLoaded", () => {
  const lifestyleRoot = "assets/images/";

  const applyLifestyleImage = (element, filename, options) => {
    if (!element) return;

    const image = new Image();
    image.addEventListener("load", () => {
      element.style.setProperty(options.imageVariable, `url('${image.currentSrc || image.src}')`);
      element.style.setProperty(options.focalVariable, options.focalPoint || "center");
      element.classList.add(options.loadedClass);
    });
    image.src = `${lifestyleRoot}${filename}`;
  };

  const heroImages = document.querySelectorAll(".hero-image");
  heroImages.forEach((section, index) => {
    section.classList.add(`image-${index + 1}`);
  });

  const featuredContainer = document.getElementById("featuredProducts");

  // Stable, category-diverse homepage recommendations: the first eight cards
  // represent eight pantry categories, with no category appearing more than twice.
  const featured = [
    "fig-jam",
    "pomegranate-molasses",
    "olive-gold-extra-virgin",
    "wild-cucumbers",
    "thyme-labneh-rounds",
    "mountain-zatar",
    "roasted-pistachios",
    "dried-figs",
    "wild-thyme-honey",
    "tamarind-paste",
    "spicy-labneh-rounds",
    "pickled-cucumbers"
  ]
    .map((id) => products.find((product) => product.id === id)).filter(Boolean);
  if (featuredContainer) Mouneh.renderSectionProducts(featuredContainer, featured);

  const initializeProductCarousel = (container, previousButton, nextButton) => {
    if (!container || !previousButton || !nextButton) return;
    let updateFrame;

    const updateControls = () => {
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      previousButton.disabled = container.scrollLeft <= 2;
      nextButton.disabled = container.scrollLeft >= maxScroll - 2;
    };

    const scrollByCard = (direction) => {
      const card = container.querySelector(".product-card");
      if (!card) return;
      const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      container.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior });
    };

    previousButton.addEventListener("click", () => scrollByCard(-1));
    nextButton.addEventListener("click", () => scrollByCard(1));
    container.addEventListener("scroll", () => {
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(updateControls);
    }, { passive: true });
    window.addEventListener("resize", updateControls);
    updateControls();
  };

  initializeProductCarousel(featuredContainer, document.getElementById("featuredPrev"), document.getElementById("featuredNext"));

  document.querySelectorAll('.category-tile[href*="category=sweets"], .category-tile[href*="category=gift-boxes"]').forEach((tile) => tile.remove());

  const featuredCategoryCards = document.querySelectorAll(".category-tile");
  const categoryLifestyleImages = [
    ["IMG_2_.jpg", "center"],
    ["IMG_7_.jpg", "center"],
    ["IMG_5_.jpg", "center"],
    ["IMG_1_.jpg", "76% 18%"],
    ["Dried-fruits.jpg", "center"],
    ["IMG_4_.jpg", "40% center"],
    ["honey.jpg", "center"],
    ["IMG_3_.jpg", "center"]
  ];

  featuredCategoryCards.forEach((tile, index) => {
    tile.style.setProperty("--tile-order", index + 1);
    const media = categoryLifestyleImages[index];
    if (media) {
      applyLifestyleImage(tile, media[0], {
        imageVariable: "--category-image",
        focalVariable: "--category-focal-point",
        focalPoint: media[1],
        loadedClass: "has-category-image"
      });
    }
  });

  applyLifestyleImage(document.querySelector(".hero-image-1"), "IMG_3_.jpg", {
    imageVariable: "--hero-lifestyle-image",
    focalVariable: "--hero-focal-point",
    focalPoint: "center",
    loadedClass: "has-lifestyle-image"
  });

  applyLifestyleImage(document.querySelector(".story-image-1"), "IMG_6_.jpg", {
    imageVariable: "--story-lifestyle-image",
    focalVariable: "--story-focal-point",
    focalPoint: "center",
    loadedClass: "has-lifestyle-image"
  });

});
