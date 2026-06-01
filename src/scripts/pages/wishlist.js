document.addEventListener("DOMContentLoaded", async () => {
  const wishlistContainer = document.getElementById("wishlistProducts");
  const recommendationsContainer = document.getElementById("wishlistRecommendations");

  if (!wishlistContainer || !recommendationsContainer) return;

  const API_BASE = window.API_BASE || "http://127.0.0.1:5000";

  function formatPrice(value) {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN")}`;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getImagePath(product) {
    return product.image_url || product.image || "images/products/placeholder.jpg";
  }

  function buildCard(product, options = {}) {
    const price = Number(product.price || 0);
    const oldPrice = Number(product.old_price || product.original_price || 0);
    const rating = product.rating ?? "4.5";

    let saveText = "";
    if (oldPrice > price && price > 0) {
      const savedAmount = oldPrice - price;
      const savedPercent = Math.round((savedAmount / oldPrice) * 100);
      saveText = `<p class="save">You Save: ${formatPrice(savedAmount)} (${savedPercent}%)</p>`;
    }

    const deliveryText = options.deliveryText
      ? `<p class="delivery">${options.deliveryText}</p>`
      : "";
    let actionButton = "";

    if (options.mode === "wishlist") {
    actionButton = `
        <div class="delete-btn" data-id="${product.id}" title="Remove from wishlist">
          🗑️
        </div>
    `;
    } else if (options.mode === "recommendation") {
    actionButton = `
        <button class="wishlist-btn" data-id="${product.id}">
            <i class="fa-regular fa-heart"></i>
        </button>
    `;
    }
    return `
      <div class="order-card">
       
        ${actionButton}
        <img src="${escapeHtml(getImagePath(product))}" alt="${escapeHtml(product.name || product.product_name || "Product")}">
        <div class="order-details">
          <h4>${escapeHtml(product.name || product.product_name || "Untitled Product")}</h4>
          <p class="price">${formatPrice(price)}</p>
          ${
            oldPrice > 0
              ? `<p class="list">List Price: <span>${formatPrice(oldPrice)}</span></p>`
              : ""
          }
          ${saveText}
          ${deliveryText}
          <p>⭐ ${escapeHtml(rating)}</p>
        </div>
      </div>
    `;
  }

  function updateHeartIcon(btn, isWishlisted) {
  const icon = btn.querySelector("i");
  if (!icon) return;

  icon.className = isWishlisted
    ? "fa-solid fa-heart"
    : "fa-regular fa-heart";

  icon.style.color = isWishlisted ? "#e8650a" : "";
}

  async function fetchWishlist() {
    const response = await fetch(`${API_BASE}/api/wishlist`, {
      credentials: "include"
    });

    if (response.status === 401) {
      wishlistContainer.innerHTML = `
        <div class="empty-state">
          Please login first to view your wishlist.
        </div>
      `;
      recommendationsContainer.innerHTML = "";
      return [];
    }

    if (!response.ok) {
      throw new Error("Failed to load wishlist");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async function fetchAllProducts() {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) {
      throw new Error("Failed to load products");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  function pickRandomProducts(products, count) {
    const copy = [...products];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  async function renderWishlistPage() {
    try {
      const wishlistItems = await fetchWishlist();

      if (!wishlistItems.length) {
        wishlistContainer.innerHTML = `
          <div class="empty-state">
            No products in wishlist yet. Tap the heart on a product to add it here.
          </div>
        `;
      } else {
        
         wishlistContainer.innerHTML = wishlistItems
            .map(product => buildCard(product, {
            deliveryText: "Saved to your wishlist",
            mode: "wishlist"
        }))
        .join("");

          // attach delete events
            document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
            const productId = btn.getAttribute("data-id");

            try {
                const res = await fetch(`${API_BASE}/api/wishlist/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ product_id: productId })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Failed to remove item");
                return;
            }     

            // remove from UI instantly
            btn.closest(".order-card").remove();

            } catch (err) {
            console.error(err);
            alert("Server error while removing item");
            }
          });
        });
      }

      const allProducts = await fetchAllProducts();
      const wishlistIds = new Set(wishlistItems.map(item => Number(item.id)));
      const recommendationPool = allProducts.filter(
        product => !wishlistIds.has(Number(product.id))
      );

      const randomRecommendations = pickRandomProducts(recommendationPool, 3);

      if (!randomRecommendations.length) {
        recommendationsContainer.innerHTML = `
          <div class="empty-state">
            No recommendations available right now.
          </div>
        `;
      } else {
       recommendationsContainer.innerHTML = randomRecommendations
        .map(product => buildCard(product, {
        deliveryText: "Recommended for you",
        mode: "recommendation"
    }))
    .join("");
    document.querySelectorAll(".wishlist-btn").forEach(btn => {

    const productId = btn.getAttribute("data-id");

    // check current state
    fetch(`${API_BASE}/api/wishlist/check/${productId}`, {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        updateHeartIcon(btn, data.wishlisted);
    })
    .catch(() => {
        updateHeartIcon(btn, false);
    });

    // toggle on click
    btn.addEventListener("click", async () => {

        try {
        const res = await fetch(`${API_BASE}/api/wishlist/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: productId })
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Failed to update wishlist");
            return;
        }

        // update UI instantly
        updateHeartIcon(btn, data.wishlisted);

        // reload to move item to wishlist section
        setTimeout(() => {
            window.location.reload();
        }, 400);

        } catch (err) {
        console.error(err);
        alert("Server error");
        }

    });

    });
    }
    } catch (error) {
      console.error("Wishlist page error:", error);
      wishlistContainer.innerHTML = `
        <div class="empty-state">
          Failed to load wishlist products.
        </div>
      `;
      recommendationsContainer.innerHTML = `
        <div class="empty-state">
          Failed to load recommendations.
        </div>
      `;
    }
  }

  renderWishlistPage();
});