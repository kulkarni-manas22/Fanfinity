// async function loadProducts(section, trackId) {
//   const track = document.getElementById(trackId);
//   if (!track) return;

//   try {
//     const response = await fetch(`/api/products/${section}`);
//     const products = await response.json();

//     track.innerHTML = "";

//     products.forEach(product => {
//       const card = `
//         <div class="product-card" data-id="${product.id}">
//           <img src="${product.image}" alt="${product.name}">
//           <h4>${product.name}</h4>
//           <p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p>
//           <p class="list-price">List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
//           <p class="rating">⭐ ${product.rating}</p>
//         </div>
//       `;

//       track.insertAdjacentHTML("beforeend", card);
//     });
//   } catch (error) {
//     console.error(`Error loading ${section} products:`, error);
//   }
// }

// async function loadExploreMore() {
//   const container = document.getElementById("productContainer");
//   if (!container) return;

//   try {
//     const response = await fetch("/api/products/home/explore");
//     const products = await response.json();

//     container.innerHTML = "";

//     products.forEach(product => {
//       const card = `
//         <div class="masonry-item" data-id="${product.id}">
//           <img src="${product.image}" alt="${product.name}">
//           <div class="product-info">
//             <h4>${product.name}</h4>
//             <p class="price1">₹${Number(product.price).toLocaleString("en-IN")}</p>
//             <p>List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
//             <p class="rating">⭐ ${product.rating}</p>
//           </div>
//         </div>
//       `;

//       container.insertAdjacentHTML("beforeend", card);
//     });
//   } catch (error) {
//     console.error("Error loading explore products:", error);
//   }
// }

// function setupSliderButtons() {
//   const buttons = document.querySelectorAll(".slider-btn");

//   buttons.forEach(button => {
//     button.addEventListener("click", () => {
//       const targetId = button.dataset.target;
//       const track = document.getElementById(targetId);
//       if (!track) return;

//       const card = track.querySelector(".product-card");
//       const scrollAmount = card ? card.offsetWidth + 20 : 300;

//       if (button.classList.contains("slider-btn-left")) {
//         track.scrollBy({ left: -(scrollAmount * 3), behavior: "smooth" });
//       } else {
//         track.scrollBy({ left: scrollAmount * 3, behavior: "smooth" });
//       }
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   loadProducts("popular", "popularTrack");
//   loadProducts("recommended", "recommendedTrack");
//   loadProducts("new", "newTrack");
//   loadExploreMore();
//   setupSliderButtons();
// });

//connection to localhost from 5500 and 5000 port
// const BASE_URL = "http://127.0.0.1:5000";
const BASE_URL =
  window.location.port === "5500"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://127.0.0.1:5000";



function createTrackSkeletons(count = 5) {
  return Array.from({ length: count }, () => `
    <div class="product-card skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-price"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-rating"></div>
    </div>
  `).join("");
}

function createExploreSkeletons(count = 10) {
  return Array.from({ length: count }, () => `
    <div class="masonry-item skeleton-explore">
      <div class="skeleton skeleton-explore-image"></div>
      <div class="product-info">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-rating"></div>
      </div>
    </div>
  `).join("");
}

async function loadProducts(section, trackId) {
  const track = document.getElementById(trackId);
  if (!track) return;

  const skeletonCount = section === "new" ? 6 : 4;
  track.innerHTML = createTrackSkeletons(skeletonCount);

  try {
    const response = await fetch(`${BASE_URL}/api/products/${section}`);
    if (!response.ok) throw new Error(`Failed to load ${section} products`);

    const products = await response.json();
    track.innerHTML = "";

    products.forEach(product => {
      const imageSrc = product.image.startsWith("/") ? product.image : `/${product.image}`;

      const card = `
        <div class="product-card display-only-card fade-in-card" data-id="${product.id}">
          <img src="${imageSrc}" alt="${product.name}" loading="lazy">
          <h4>${product.name}</h4>
          <p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p>
          <p class="list-price">List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
          <p class="rating">⭐ ${product.rating}</p>
        </div>
      `;

      track.insertAdjacentHTML("beforeend", card);
    });
  } catch (error) {
    console.error(`Error loading ${section} products:`, error);
    track.innerHTML = `<p class="load-error">Could not load products.</p>`;
  }
}
// async function loadProducts(section, trackId) {
//   const track = document.getElementById(trackId);
//   if (!track) return;

//   try {
//     const response = await fetch(`${BASE_URL}/api/products/${section}`);
//     const products = await response.json();

//     track.innerHTML = "";

//     products.forEach(product => {
//       const imageSrc = product.image.startsWith("/") ? product.image : `/${product.image}`;

//       const card = `
//         <div class="product-card display-only-card" data-id="${product.id}">
//           <img src="${imageSrc}" alt="${product.name}" loading="lazy">
//           <h4>${product.name}</h4>
//           <p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p>
//           <p class="list-price">List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
//           <p class="rating">⭐ ${product.rating}</p>
//         </div>
//       `;

//       track.insertAdjacentHTML("beforeend", card);
//     });
//   } catch (error) {
//     console.error(`Error loading ${section} products:`, error);
//   }
// }

const HOME_EXPLORE_ITEM_CLASS = "masonry-item";
async function loadExploreMore() {
  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = createExploreSkeletons(10);

  try {
    const response = await fetch(`${BASE_URL}/api/products/home/explore`);
    if (!response.ok) throw new Error("Failed to fetch explore products");

    const products = await response.json();
    container.innerHTML = "";

    products.slice(0, 18).forEach(product => {
      const card = document.createElement("div");
      card.className = `${HOME_EXPLORE_ITEM_CLASS} fade-in-card`;
      card.dataset.id = product.id;

      const imageSrc = product.image.startsWith("/") ? product.image : `/${product.image}`;

      card.innerHTML = `
        <img src="${imageSrc}" alt="${product.name}" loading="lazy">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p class="price1">₹${Number(product.price).toLocaleString("en-IN")}</p>
          <p>List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
          <p class="rating">⭐ ${product.rating}</p>
        </div>
      `;

      card.addEventListener("click", () => openProductModal(product));
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading explore products:", error);
    container.innerHTML = `
      <p class="load-error">
        Could not load products.
      </p>
    `;
  }
}
// async function loadExploreMore() {
//   const container = document.getElementById("productContainer");
//   if (!container) return;

//   try {
//     const response = await fetch(`${BASE_URL}/api/products/home/explore`);
//     if (!response.ok) throw new Error("Failed to fetch explore products");

//     const products = await response.json();
//     container.innerHTML = "";

//     // if (!products.length) {
//     //   container.innerHTML = `
//     //     <p style="text-align:center; padding:40px; opacity:0.7;">
//     //       No products found.
//     //     </p>
//     //   `;
//     //   return;
//     // }

//     products.slice(0, 21).forEach(product => {
//       const card = document.createElement("div");
//       card.className = HOME_EXPLORE_ITEM_CLASS;
//       card.dataset.id = product.id;

//       const imageSrc = product.image.startsWith("/") ? product.image : `/${product.image}`;

//       card.innerHTML = `
//         <img src="${imageSrc}" alt="${product.name}" loading="lazy">
//         <div class="product-info">
//           <h4>${product.name}</h4>
//           <p class="price1">₹${Number(product.price).toLocaleString("en-IN")}</p>
//           <p>List Price: <del>₹${Number(product.old_price).toLocaleString("en-IN")}</del></p>
//           <p class="rating">⭐ ${product.rating}</p>
//         </div>
//       `;

//       card.addEventListener("click", () => openProductModal(product));

//       container.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Error loading explore products:", error);
//     container.innerHTML = `
//       <p style="text-align:center; padding:40px; color:red;">
//         Could not load products.
//       </p>
//     `;
//   }
// }

function setupSliderButtons() {
  const buttons = document.querySelectorAll(".slider-btn");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const track = document.getElementById(targetId);
      if (!track) return;

      const card = track.querySelector(".product-card");
      const scrollAmount = card ? card.offsetWidth + 20 : 300;

      if (button.classList.contains("slider-btn-left")) {
        track.scrollBy({ left: -(scrollAmount * 3), behavior: "smooth" });
      } else {
        track.scrollBy({ left: scrollAmount * 3, behavior: "smooth" });
      }
    });
  });
}

// Shared modal opener copied from category-page logic
function openProductModal(product) {
    const modal = document.getElementById("productModal");
    if (!modal) return;

    try {
        const savings = (product.old_price || 0) - (product.price || 0);
        const savePct = product.old_price ? Math.round((savings / product.old_price) * 100) : 0;

        const modalImage = document.getElementById("modalImage");
        const modalTitle = document.getElementById("modalTitle");
        const modalDesc  = document.getElementById("modalDescription");
        const modalPrice = document.getElementById("modalPrice");
        const modalList  = document.getElementById("modalListPrice");
        const modalSave  = document.getElementById("modalsave");
        const modalRate  = document.getElementById("modalRating");

        if (modalImage && product.image) {
            modalImage.src = product.image.startsWith("/") ? product.image : `/${product.image}`;
        }
        if (modalTitle) modalTitle.textContent = product.name || "";
        if (modalDesc)  modalDesc.textContent  = product.description || "";
        if (modalPrice) modalPrice.textContent = `₹${Number(product.price || 0).toLocaleString("en-IN")}`;
        if (modalList)  modalList.textContent  = `List Price: ₹${Number(product.old_price || 0).toLocaleString("en-IN")}`;
        if (modalSave)  modalSave.textContent  = savings > 0 ? `You Save: ₹${savings} (${savePct}% OFF)` : "";
        if (modalRate)  modalRate.textContent  = `⭐ ${product.rating || 0} out of 5 (${product.rating_count || 0} ratings)`;

        // Open modal immediately after basic content is ready
        modal.classList.add("active");

        // These should not block opening if they fail
        try {
            renderSpecifications(product.specifications);
        } catch (err) {
            console.error("renderSpecifications error:", err);
        }

        const cartBtn = modal.querySelector(".cart-btn-product");
        if (cartBtn) {
            cartBtn.onclick = () => addToCart(product.id, product.name);
        }

        const buyBtn = modal.querySelector(".buy-btn");
        if (buyBtn) {
            buyBtn.onclick = () => buyNow(product.id);
        }

        try {
            setupWishlistButton(product.id);
        } catch (err) {
            console.error("setupWishlistButton error:", err);
        }

    } catch (err) {
        console.error("openProductModal failed:", err);
    }
}
// function openProductModal(product) {

//     const modal = document.getElementById("productModal");
//     if (!modal) return;

//     const savings = product.old_price - product.price;
//     const savePct = Math.round((savings / product.old_price) * 100);

//     // Fill basic info
//     const modalImage = document.getElementById("modalImage");
//     const modalTitle = document.getElementById("modalTitle");
//     const modalDesc  = document.getElementById("modalDescription");
//     const modalPrice = document.getElementById("modalPrice");
//     const modalList  = document.getElementById("modalListPrice");
//     const modalSave  = document.getElementById("modalsave");
//     const modalRate  = document.getElementById("modalRating");

//     if (modalImage) {
//     modalImage.src = product.image.startsWith("/") ? product.image : `/${product.image}`;
//     }
//     if (modalTitle) modalTitle.textContent = product.name;
//     if (modalDesc)  modalDesc.textContent  = product.description || "";
//     if (modalPrice) modalPrice.textContent = `₹${product.price.toLocaleString("en-IN")}`;
//     if (modalList)  modalList.textContent  = `List Price: ₹${product.old_price.toLocaleString("en-IN")}`;
//     if (modalSave)  modalSave.textContent  = savings > 0 ? `You Save: ₹${savings} (${savePct}% OFF)` : "";
//     if (modalRate)  modalRate.textContent  = `⭐ ${product.rating} out of 5 (${product.rating_count} ratings)`;

//     // Fill specifications dynamically
//     renderSpecifications(product.specifications);

//     // Set up Add to Cart button
//     const cartBtn = modal.querySelector(".cart-btn-product");
//     if (cartBtn) {
//         cartBtn.onclick = () => addToCart(product.id, product.name);
//     }

//     // Set up Buy Now button
//     const buyBtn = modal.querySelector(".buy-btn");
//     if (buyBtn) {
//         buyBtn.onclick = () => buyNow(product.id);
//     }

//     // Set up Wishlist button
//     setupWishlistButton(product.id);

//     modal.classList.add("active");
// }


//-----------working model currently-------------
// function renderSpecifications(specs) {
//     const detailsContainer = document.getElementById("modalmoreInfo");
//     const materialContainer = document.getElementById("modalMaterialInfo");

//     if (detailsContainer) detailsContainer.innerHTML = "";
//     if (materialContainer) materialContainer.innerHTML = "";

//     if (!specs || typeof specs !== "object") return;

//     // Preferred sections
//     const materialBuild = specs["Material & Build"] || specs["Material"] || specs["Build"] || {};
//     const productDetails = specs["Product Details"] || specs["Details"] || {};

//     function hasData(obj) {
//         return obj && typeof obj === "object" && Object.keys(obj).length > 0;
//     }

//     function renderSection(container, title, data) {
//         if (!container || !hasData(data)) return;

//         const heading = document.createElement("h4");
//         heading.textContent = title;
//         container.appendChild(heading);

//         const ul = document.createElement("ul");
//         ul.className = "product-specs";

//         Object.entries(data).forEach(([key, value]) => {
//             const li = document.createElement("li");
//             li.innerHTML = `<strong>${key}:</strong> ${value}`;
//             ul.appendChild(li);
//         });

//         container.appendChild(ul);
//     }

//     // Render preferred sections first
//     renderSection(materialContainer, "Material & Build", materialBuild);
//     renderSection(detailsContainer, "Product Details", productDetails);

//     // Render any remaining sections that don't match the preferred names
//     const usedKeys = new Set([
//         "Material & Build", "Material", "Build",
//         "Product Details", "Details"
//     ]);

//     const remainingSections = Object.entries(specs).filter(([sectionName]) => !usedKeys.has(sectionName));

//     remainingSections.forEach(([sectionName, sectionData], index) => {
//         const target = hasData(productDetails)
//             ? materialContainer
//             : detailsContainer;

//         renderSection(target, sectionName, sectionData);
//     });
// }

function renderSpecifications(specs) {
    const detailsContainer = document.getElementById("modalmoreInfo");
    const materialContainer = document.getElementById("modalMaterialInfo");

    if (detailsContainer) detailsContainer.innerHTML = "";
    if (materialContainer) materialContainer.innerHTML = "";

    if (!specs || typeof specs !== "object") return;

    function renderSection(container, title, data) {
        const heading = document.createElement("h4");
        heading.textContent = title;
        container.appendChild(heading);

        const ul = document.createElement("ul");
        ul.className = "product-specs";

        Object.entries(data).forEach(([key, value]) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${key}:</strong> ${value}`;
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    // Normalize sections
    let materialData = {};
    let detailData = {};

    Object.entries(specs).forEach(([sectionName, sectionData]) => {
        const name = sectionName.toLowerCase();

        if (name.includes("material") || name.includes("build")) {
            Object.assign(materialData, sectionData);
        } else {
            Object.assign(detailData, sectionData);
        }
    });

    // Fallback if one side empty → balance it
    const entries = Object.entries(detailData);

    if (Object.keys(materialData).length === 0 && entries.length > 0) {
        const half = Math.ceil(entries.length / 2);
        materialData = Object.fromEntries(entries.slice(0, half));
        detailData = Object.fromEntries(entries.slice(half));
    }

    // Render ALWAYS both sections
    renderSection(materialContainer, "Material & Build", materialData);
    renderSection(detailsContainer, "Product Details", detailData);
}

// function renderSpecifications(specs) {
//   const container1 = document.getElementById("modalmoreInfo");
//   const container2 = document.getElementById("modalMaterialInfo");

//   if (container1) container1.innerHTML = "";
//   if (container2) container2.innerHTML = "";

//   if (!specs || typeof specs !== "object") return;

//    const productDetails = specs["Product Details"] || {};
//   const materialBuild = specs["Material & Build"] || {};

//   function renderSection(container, title, data) {
//     if (!container) return;

//     const heading = document.createElement("h4");
//     heading.textContent = title;
//     container.appendChild(heading);

//     const ul = document.createElement("ul");
//     ul.className = "product-specs";

//     Object.entries(data).forEach(([key, value]) => {
//       const li = document.createElement("li");
//       li.innerHTML = `<strong>${key}:</strong> ${value}`;
//       ul.appendChild(li);
//     });

//     container.appendChild(ul);
//   }

//   renderSection(materialContainer, "Material & Build", materialBuild);
//   renderSection(detailsContainer, "Product Details", productDetails);
// }

  // const sections = Object.entries(specs);

  // sections.forEach(([sectionName, sectionData], index) => {
  //   const target = index === 0 ? container1 : container2;
  //   if (!target) return;

  //   const heading = document.createElement("h4");
  //   heading.textContent = sectionName;
  //   target.appendChild(heading);

  //   const ul = document.createElement("ul");
  //   ul.className = "product-specs";

  //   if (sectionData && typeof sectionData === "object") {
  //     for (const [key, value] of Object.entries(sectionData)) {
  //       const li = document.createElement("li");
  //       li.innerHTML = `<strong>${key}:</strong> ${value}`;
  //       ul.appendChild(li);
  //     }
  //   }

  //   target.appendChild(ul);
  // });


// ============================================================
// CART  –  Add to Cart
// ============================================================

async function requireLoginBeforeAction() {
    try {
        const response = await fetch(`${BASE_URL}/api/me`, {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            return true;
        }

        alert("Login/Signup first to continue");

         const productModal = document.getElementById("productModal");
        if (productModal) {
            productModal.classList.remove("active");
        }

         setTimeout(() => {
            const authContainer = document.getElementById("authContainer");
            if (authContainer) {
                authContainer.style.display = "flex";
            }
            document.body.classList.add("auth-open");
        }, 500);

        return false;
    } catch (error) {
        console.error("Login check failed:", error);
        alert("Login/Signup first to continue");

        const authContainer = document.getElementById("authContainer");
        if (authContainer) {
            authContainer.style.display = "flex";
        }

        return false;
    }
}

// function addToCart(productId, productName) {

//     fetch(`${BASE_URL}/api/cart/add`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ product_id: productId, quantity: 1 })
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.error) {
//             // If not logged in, prompt login
//             if (data.error === "Login required") {
//                 showToastMsg("Please login to add items to cart 🛒");
//             } else {
//                 showToastMsg(data.error);
//             }
//         } else {
//             showToastMsg(`${productName} added to cart! 🛒`);
//         }
//     })
//     .catch(() => showToastMsg("Could not reach server. Is backend running?"));
// }

async function addToCart(productId, productName) {
    const allowed = await requireLoginBeforeAction();
    if (!allowed) return;

    fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showToastMsg(data.error);
        } else {
            showToastMsg(`${productName} added to cart! 🛒`);
        }
    })
    .catch(() => showToastMsg("Could not reach server. Is backend running?"));
}

// function buyNow(productId) {
//     // Add to cart first, then redirect to cart page
//     fetch(`${BASE_URL}/api/cart/add`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ product_id: productId, quantity: 1 })
//     })
//     .then(() => {
//         window.location.href = "../cart.html";
//     })
//     .catch(() => showToastMsg("Could not reach server."));
// }

async function buyNow(productId) {
    const allowed = await requireLoginBeforeAction();
    if (!allowed) return;

    fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showToastMsg(data.error);
            return;
        }
        window.location.href = "../cart.html";
    })
    .catch(() => showToastMsg("Could not reach server."));
}

// ============================================================
// WISHLIST  –  Heart button in modal
// ============================================================

function setupWishlistButton(productId) {

    const wishlistBtn = document.getElementById("wishlistBtn");
    if (!wishlistBtn) return;

    // Check current wishlist status
    fetch(`${BASE_URL}/api/wishlist/check/${productId}`, {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        updateHeartIcon(wishlistBtn, data.wishlisted);
    })
    .catch(() => {
        // Not logged in – show empty heart
        updateHeartIcon(wishlistBtn, false);
    });

    // Toggle on click
    wishlistBtn.onclick = () => {

        fetch(`${BASE_URL}/api/wishlist/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: productId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error === "Login required") {
                showToastMsg("Please login to use wishlist ❤️");
                return;
            }
            updateHeartIcon(wishlistBtn, data.wishlisted);
            showToastMsg(data.wishlisted ? "Added to wishlist ❤️" : "Removed from wishlist");
        })
        .catch(() => showToastMsg("Could not reach server."));
    };
}

function updateHeartIcon(btn, isWishlisted) {
    const icon = btn.querySelector("i");
    if (icon) {
        icon.className = isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart";
        icon.style.color = isWishlisted ? "#e8650a" : "";
    }
}

// ============================================================
// TOAST  –  Small notification messages
// ============================================================

function showToastMsg(message) {
    // Use the existing showToast from common.js if available
    if (typeof window.showToast === "function") {
        window.showToast(message);
        return;
    }
    // Fallback: create a simple toast
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
            background:#333; color:#fff; padding:12px 24px; border-radius:8px;
            font-size:14px; z-index:9999; opacity:0; transition:opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}


function setupModalClose() {
  const modal = document.getElementById("productModal");
  const closeBtn = document.querySelector(".close-btn-model");

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts("popular", "popularTrack");
  loadProducts("recommended", "recommendedTrack");
  loadProducts("new", "newTrack");
  loadExploreMore();
  setupSliderButtons();
  setupModalClose();
});