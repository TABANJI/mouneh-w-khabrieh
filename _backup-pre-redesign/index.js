document.addEventListener("DOMContentLoaded", () => {
  const heroImages = document.querySelectorAll(".hero-image");
  heroImages.forEach((section, index) => {
    section.classList.add(`image-${index + 1}`);
  });

  const featuredContainer = document.getElementById("featuredProducts");
  const storyContainer = document.getElementById("storyProducts");
  const bestsellerContainer = document.getElementById("bestsellerProducts");

  const featured = products.filter((product) => product.featured).slice(0, 8);
  const bestseller = products.filter((product) => product.bestseller).slice(0, 6);
  const storyProducts = [
    products.find((item) => item.id === "mountain-zatar"),
    products.find((item) => item.id === "olive-gold-extra-virgin"),
    products.find((item) => item.id === "fig-jam")
  ].filter(Boolean);

  if (featuredContainer) Mouneh.renderSectionProducts(featuredContainer, featured);
  if (bestsellerContainer) Mouneh.renderSectionProducts(bestsellerContainer, bestseller);

  if (storyContainer) {
    storyContainer.innerHTML = storyProducts
      .map(
        (product) => `
        <article class="story-product-card">
          <a href="product.html?product=${product.slug}" class="story-product-image" style="background-image:url('${product.images[0]}')"></a>
          <div class="story-product-copy">
            <span>${categories.find((cat) => cat.id === product.category)?.title || product.category}</span>
            <h3>${product.name}</h3>
            <p>${product.story}</p>
            <a class="text-link" href="product.html?product=${product.slug}">Discover product</a>
          </div>
        </article>`
      )
      .join("");
  }

  const featuredCategoryCards = document.querySelectorAll(".category-tile");
  featuredCategoryCards.forEach((tile, index) => {
    tile.style.setProperty("--tile-order", index + 1);
  });
});
