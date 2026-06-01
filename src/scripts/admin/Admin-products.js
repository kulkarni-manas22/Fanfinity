//========================== product will load dynamically from backend ===========================================
//async function loadProducts() {
//
//  const container = document.getElementById("productsContainer");
//  if (!container) return;
//
//  try {
//
//    const response = await fetch("/api/products");   // backend API
//    const products = await response.json();
//
//    container.innerHTML = "";
//
//    products.forEach(product => {
//
//      const productCard = `
//        <div class="product-img">
//            <img src="${product.image}" alt="${product.name}">
//        </div>
//      `;
//
//      container.insertAdjacentHTML("beforeend", productCard);
//
//    });
//
//  } catch (error) {
//
//    console.error("Error loading products:", error);
//
//  }
//
//}
//
//loadProducts();




//===================================================================
// New code logic
//===================================================================

// document.addEventListener("DOMContentLoaded", () => {
//     loadProducts();
// });

// async function loadProducts() {
//     try {
//         const res = await fetch("/api/products");
//         const data = await res.json();

//         const table = document.getElementById("productTableBody");
//         table.innerHTML = "";

//         data.slice(0, 15).forEach(p => {
//             const row = `
//                 <tr>
//                     <td>${p.id}</td>
//                     <td><img src="${p.image}" class="product-img"></td>
//                     <td>${p.category}</td>
//                     <td>${p.name}</td>
//                     <td>${p.price}</td>
//                     <td>${p.stock}</td>
//                 </tr>
//             `;
//             table.insertAdjacentHTML("beforeend", row);
//         });

//     } catch (err) {
//         console.error("Error loading products", err);
//     }
// }


// // ================= ADD PRODUCT =================
// async function addProduct() {
//     try {
//         const body = {
//             name: document.getElementById("productName").value,
//             description: document.getElementById("productDesc").value,
//             price: document.getElementById("price").value,
//             stock: document.getElementById("stock").value,
//             category: document.getElementById("category").value,

//             keywords: document.getElementById("keywords").value,
//             mrp: document.getElementById("mrp").value,
//             discount: document.getElementById("discount").value,
//             rating: document.getElementById("rating").value,
//             reviews: document.getElementById("reviews").value,
//             image: document.getElementById("imageLink").value,
//             ideal_for: document.getElementById("idealFor").value,
//             specifications: document.getElementById("specifications").value,

//             is_new: document.getElementById("isNew").checked,
//             is_popular: document.getElementById("isPopular").checked,
//             is_recommended: document.getElementById("isRecommended").checked,
//             show_on_home: document.getElementById("showOnHome").checked
//         };

//         const res = await fetch("/api/admin/products", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify(body)
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             alert(data.error || "Failed");
//             return;
//         }

//         alert("Product Added ✅");

//         closeProductForm();
//         loadProducts();

//     } catch (err) {
//         console.error(err);
//     }
// }

// async function addProduct() {
//     const formData = new FormData();

//     formData.append("product_name", document.getElementById("productName").value.trim());
//     formData.append("image", document.getElementById("productImage").files[0]);
//     formData.append("description", document.getElementById("productDesc").value.trim());
//     formData.append("key_words", document.getElementById("keywords").value.trim());
//     formData.append("specifications", document.getElementById("specifications").value.trim());
//     formData.append("ideal_for", document.getElementById("idealFor").value.trim());
//     formData.append("price", document.getElementById("price").value);
//     formData.append("mrp", document.getElementById("mrp").value);
//     formData.append("discount", document.getElementById("discount").value);
//     formData.append("rating", document.getElementById("rating").value);
//     formData.append("reviews", document.getElementById("reviews").value);
//     formData.append("stock", document.getElementById("stock").value);
//     formData.append("category", document.getElementById("category").value);
//     formData.append("is_new", document.getElementById("isNew").checked);
//     formData.append("is_popular", document.getElementById("isPopular").checked);
//     formData.append("is_recommended", document.getElementById("isRecommended").checked);
//     formData.append("show_on_home", document.getElementById("showOnHome").checked);

//     const response = await fetch("/api/admin/products", {
//         method: "POST",
//         credentials: "include",
//         body: formData
//     });

//     const data = await response.json();

//     if (!response.ok) {
//         alert(data.error || "Failed to add product");
//         return;
//     }

//     alert("Product added successfully");
//     closeProductForm();
//     loadProducts();
// }

// async function loadProducts() {
//     const tableBody = document.getElementById("productTableBody");
//     if (!tableBody) return;

//     try {
//         const apiBase = getApiBase();
//         const res = await fetch(`${apiBase}/api/products`, {
//             credentials: "include"
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             throw new Error(data.error || "Failed to load products");
//         }

//         tableBody.innerHTML = "";

//         const limitedProducts = data.slice(0, 15);

//         if (!limitedProducts.length) {
//             tableBody.innerHTML = `
//                 <tr>
//                     <td colspan="6">No products found.</td>
//                 </tr>
//             `;
//             return;
//         }

//         limitedProducts.forEach((p) => {
//             const row = `
//                 <tr>
//                     <td>${p.id ?? "-"}</td>
//                     <td>
//                         <img src="${p.image || ""}" alt="${p.name || "Product"}" class="product-img">
//                     </td>
//                     <td>${formatCategory(p.category)}</td>
//                     <td>${p.name ?? "-"}</td>
//                     <td>₹ ${Number(p.price || 0).toLocaleString("en-IN")}</td>
//                     <td>${p.stock ?? 0}</td>
//                 </tr>
//             `;
//             tableBody.insertAdjacentHTML("beforeend", row);
//         });

//     } catch (err) {
//         console.error("Error loading products:", err);
//         tableBody.innerHTML = `
//             <tr>
//                 <td colspan="6">Failed to load products.</td>
//             </tr>
//         `;
//     }
// }


function getApiBase() {
  return window.location.port === "5500"
    ? "http://127.0.0.1:5000"
    : "";
}

function resolveImagePath(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("/")
  ) {
    return path;
  }

  if (path.startsWith("../")) {
    return path;
  }

  return `../${path.replace(/^\.?\//, "")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadDashboardProducts();  // Admin dashboard
});

function getApiBase() {
    return window.location.port === "5500"
        ? "http://127.0.0.1:5000"
        : "";
}






async function loadProducts() {
    const tableBody = document.getElementById("productTableBody");
    if (!tableBody) return;

    try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/products`, {
            credentials: "include"
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to load products");
        }

        tableBody.innerHTML = "";

        // mix products randomly, then show only 15
        const mixedProducts = [...data]
            .sort(() => Math.random() - 0.5)
            .slice(0, 15);

        if (!mixedProducts.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No products found.</td>
                </tr>
            `;
            return;
        }

        mixedProducts.forEach((p) => {
            const imageSrc = resolveImagePath(p.image);

            const row = `
                <tr>
                    <td>${p.id ?? "-"}</td>
                    <td>
                        <img 
                            src="${imageSrc}" 
                            alt="${escapeHtml(p.name || "Product")}" 
                            class="product-img"
                            onerror="this.style.display='none';"
                        >
                    </td>
                    <td>${escapeHtml(formatCategory(p.category))}</td>
                    <td>${escapeHtml(p.name ?? "-")}</td>
                    <td>₹ ${Number(p.price || 0).toLocaleString("en-IN")}</td>
                    <td>${p.stock ?? 0}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

    } catch (err) {
        console.error("Error loading products:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Failed to load products.</td>
            </tr>
        `;
    }
}

async function loadDashboardProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  try {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/admin/dashboard-products`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load dashboard products");
    }

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<p>No products found.</p>`;
      return;
    }

    data.forEach(product => {
      const imageSrc = resolveImagePath(product.image_link);

      const card = `
        <div class="product-img">
          <img 
            src="${imageSrc}" 
            alt="${escapeHtml(product.product_name || "Product")}"
            onerror="this.style.display='none';"
          >
        </div>
      `;

      container.insertAdjacentHTML("beforeend", card);
    });

  } catch (error) {
    console.error("Error loading dashboard products:", error);
    container.innerHTML = `<p>Failed to load products.</p>`;
  }
}



function formatCategory(category) {
    if (!category) return "-";
    return category
        .replaceAll("&", " & ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

async function addProduct() {
    const apiBase = getApiBase();

    const imageFile = document.getElementById("productImage").files[0];
    if (!imageFile) {
        alert("Please select a product image.");
        return;
    }

    const formData = new FormData();
    formData.append("product_name", document.getElementById("productName").value.trim());
    formData.append("image", imageFile);
    formData.append("description", document.getElementById("productDesc").value.trim());
    formData.append("key_words", document.getElementById("keywords").value.trim());
    formData.append("specifications", document.getElementById("specifications").value.trim());
    formData.append("ideal_for", document.getElementById("idealFor").value.trim());
    formData.append("price", document.getElementById("price").value);
    formData.append("mrp", document.getElementById("mrp").value);
    formData.append("discount", document.getElementById("discount").value);
    formData.append("rating", document.getElementById("rating").value);
    formData.append("reviews", document.getElementById("reviews").value);
    formData.append("stock", document.getElementById("stock").value);
    formData.append("category", document.getElementById("category").value.toLowerCase());
    formData.append("is_new", document.getElementById("isNew").checked);
    formData.append("is_popular", document.getElementById("isPopular").checked);
    formData.append("is_recommended", document.getElementById("isRecommended").checked);
    formData.append("show_on_home", document.getElementById("showOnHome").checked);

    try {
        const res = await fetch(`${apiBase}/api/admin/products`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to add product");
            return;
        }

        alert("Product added successfully");
        document.getElementById("addProductForm").reset();

        const preview = document.getElementById("productImagePreview");
        if (preview) preview.src = "";

        closeProductForm();
        loadProducts();

    } catch (err) {
        console.error("Add product error:", err);
        alert("Failed to add product");
    }
}

function resolveImagePath(path) {
    if (!path) return "../images/products/fallback.png";

    // already absolute URL
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
        return path;
    }

    // already correct relative path
    if (path.startsWith("../")) {
        return path;
    }

    // root path
    if (path.startsWith("/")) {
        return path;
    }

    // if DB stored like "images/products/..."
    return `../${path.replace(/^\.?\//, "")}`;
}