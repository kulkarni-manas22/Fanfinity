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