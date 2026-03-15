// Admin product-info page: add product + show/hide form modal.

let products = [];

function renderProducts() {
  // This page currently doesn't have <tbody id="productTableBody"> in the HTML.
  // If/when you add it, this will start rendering dynamically.
  
  let table = document.getElementById("productTableBody");
  if (!table) return;

  table.innerHTML = "";

  products.forEach((p) => {
    let row = `
<tr>
<td>${p.name}</td>
<td>${p.category}</td>
<td>₹${p.price}</td>
<td>${p.stock}</td>
<td>${p.date}</td>
</tr>
`;

    table.innerHTML += row;
  });
}

window.addProduct = function addProduct() {
  let name = document.getElementById("productName")?.value ?? "";
  let category = document.getElementById("category")?.value ?? "";
  let price = document.getElementById("price")?.value ?? "";
  let stock = document.getElementById("stock")?.value ?? "";

  let date = new Date().toLocaleDateString();

  let product = { name, category, price, stock, date };
  products.push(product);

  renderProducts();
};


//======================= product form ==================================================

window.openProductForm = function openProductForm() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "flex";
};

window.closeProductForm = function closeProductForm() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "none";
};

