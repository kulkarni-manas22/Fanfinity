//============================ loads products into newly released section dynamically ============================================

async function loadProducts(section, trackId) {

  const track = document.getElementById(trackId);
  if (!track) return;

  try {

    const response = await fetch(`/api/products/${section}`);
    const products = await response.json();

    track.innerHTML = "";

    products.forEach(product => {

      const stars = "⭐".repeat(product.rating);

      const card = `
      <div class="product-card">
          <img src="${product.image}" alt="${product.name}">
          <h4>${product.name}</h4>
          <p class="price">₹${product.price}</p>
          <p class="rating">${stars}</p>
      </div>
      `;

      track.insertAdjacentHTML("beforeend", card);

    });

    /* duplicate for infinite slider */
    track.innerHTML += track.innerHTML;

  } catch (error) {

    console.error("Error loading products:", error);

  }

}

loadProducts("popular", "popularTrack");
loadProducts("recommended", "recommendedTrack");
loadProducts("new", "newTrack");