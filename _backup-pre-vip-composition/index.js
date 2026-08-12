document.addEventListener("DOMContentLoaded", () => {
  const heroImages = document.querySelectorAll(".hero-image");
  heroImages.forEach((section, index) => {
    section.classList.add(`image-${index + 1}`);
  });

  const featuredContainer = document.getElementById("featuredProducts");
  const storyContainer = document.getElementById("storyProducts");
  const bestsellerContainer = document.getElementById("bestsellerProducts");

  const featured = ["fig-jam", "wild-cucumbers", "green-olives-with-chili-paste", "thyme-labneh-rounds"]
    .map((id) => products.find((product) => product.id === id)).filter(Boolean);
  const bestseller = ["olives-stuffed-with-chili", "mixed-pickles", "berry-jam", "labneh-rounds-in-oil-goat"]
    .map((id) => products.find((product) => product.id === id)).filter(Boolean);
  const storyProducts = [
    products.find((item) => item.id === "fig-jam"),
    products.find((item) => item.id === "green-olives-with-chili-paste"),
    products.find((item) => item.id === "thyme-labneh-rounds")
  ].filter(Boolean);

  if (featuredContainer) Mouneh.renderSectionProducts(featuredContainer, featured);
  if (bestsellerContainer) Mouneh.renderSectionProducts(bestsellerContainer, bestseller);

  if (storyContainer) {
    storyContainer.innerHTML = storyProducts
      .map(
        (product) => `
        <article class="story-product-card">
          <a href="product.html?product=${product.slug}" class="story-product-image has-packshot" style="--story-image:url('${product.images[0]}')"></a>
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
