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
  const bestsellerContainer = document.getElementById("bestsellerProducts");

  const featured = ["fig-jam", "apricot-jam", "wild-cucumbers", "green-olives-with-chili-paste", "thyme-labneh-rounds", "spicy-labneh-rounds", "pickled-cucumbers"]
    .map((id) => products.find((product) => product.id === id)).filter(Boolean);
  const bestseller = ["olives-stuffed-with-chili", "mixed-pickles", "berry-jam", "labneh-rounds-in-oil-goat"]
    .map((id) => products.find((product) => product.id === id)).filter(Boolean);
  if (featuredContainer) Mouneh.renderSectionProducts(featuredContainer, featured);
  if (bestsellerContainer) Mouneh.renderSectionProducts(bestsellerContainer, bestseller);

  const featuredPrev = document.getElementById("featuredPrev");
  const featuredNext = document.getElementById("featuredNext");

  if (featuredContainer && featuredPrev && featuredNext) {
    let updateFrame;

    const updateFeaturedControls = () => {
      const maxScroll = Math.max(0, featuredContainer.scrollWidth - featuredContainer.clientWidth);
      featuredPrev.disabled = featuredContainer.scrollLeft <= 2;
      featuredNext.disabled = featuredContainer.scrollLeft >= maxScroll - 2;
    };

    const scrollFeaturedByCard = (direction) => {
      const card = featuredContainer.querySelector(".product-card");
      if (!card) return;
      const gap = parseFloat(getComputedStyle(featuredContainer).columnGap) || 0;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      featuredContainer.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior });
    };

    featuredPrev.addEventListener("click", () => scrollFeaturedByCard(-1));
    featuredNext.addEventListener("click", () => scrollFeaturedByCard(1));
    featuredContainer.addEventListener("scroll", () => {
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(updateFeaturedControls);
    }, { passive: true });
    window.addEventListener("resize", updateFeaturedControls);
    updateFeaturedControls();
  }

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
