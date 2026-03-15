// Movies & Series hub page: product modal behavior (category4 grid).

const msModal = document.getElementById("productModal");
const msCloseBtn = document.querySelector(".close-btn");

if (msModal && msCloseBtn) {
  document
    .querySelectorAll(".masonry-item-category4 img")
    .forEach((img) => {
      img.addEventListener("click", function () {
        const modalImage = document.getElementById("modalImage");
        const modalTitle = document.getElementById("modalTitle");
        const modalDescription = document.getElementById("modalDescription");
        const modalPrice = document.getElementById("modalPrice");
        const modalListPrice = document.getElementById("modalListPrice");
        const modalSave = document.getElementById("modalsave");
        const modalRating = document.getElementById("modalRating");

        if (modalImage) modalImage.src = this.src;
        if (modalTitle)
          modalTitle.textContent =
            "Agust D Artist Edition Stainless Steel Mug";
        if (modalDescription)
          modalDescription.textContent =
            "Premium anime inspired insulated travel mug. Perfect for fans.";
        if (modalPrice) modalPrice.textContent = "₹1,299";
        if (modalListPrice)
          modalListPrice.textContent = " List Price: ₹1,999.00";
        if (modalSave) modalSave.textContent = "You Save: ₹700 (35% OFF)";
        if (modalRating)
          modalRating.textContent =
            "⭐ 4.7 out of 5 stars (1,240 ratings)";

        msModal.classList.add("active");
      });
    });

  msCloseBtn.addEventListener("click", () => {
    msModal.classList.remove("active");
  });

  window.addEventListener("click", (e) => {
    if (e.target === msModal) {
      msModal.classList.remove("active");
    }
  });
}

//======================== Dynamic version ===================================================================
//dynamically fetchs data of products from backend 


//const modal = document.getElementById("productModal");
//const closeBtn = document.querySelector(".close-btn");
//
//// Event Delegation (better for dynamic content)
//document.querySelector(".grid-container").addEventListener("click", function(e) {
//
//    const productCard = e.target.closest(".masonry-item-category6");
//
//    if (!productCard) return;
//
//    const productId = productCard.dataset.id;
//
//    // Fetch product from backend
//    fetch(`/api/product/${productId}`)
//        .then(res => res.json())
//        .then(product => {
//
//            // Fill modal data
//            document.getElementById("modalImage").src = product.image;
//            document.getElementById("modalTitle").textContent = product.title;
//            document.getElementById("modalDescription").textContent = product.description;
//            document.getElementById("modalPrice").textContent = "₹" + product.price;
//            document.getElementById("modalListPrice").textContent = "List Price: ₹" + product.listPrice;
//            document.getElementById("modalsave").textContent = product.save;
//            document.getElementById("modalRating").textContent = product.rating;
//
//            renderSpecifications(product.specifications);
//
//            modal.classList.add("active");
//        });
//});
//
////========================================== seperate specs renderer =====================================================================
//
//function renderSpecifications(specs) {
//
//    const specsContainer = document.getElementById("modalSpecsContainer");
//    specsContainer.innerHTML = "";
//
//    for (const section in specs) {
//
//        const sectionDiv = document.createElement("div");
//        sectionDiv.classList.add("more-info");
//
//        const heading = document.createElement("h4");
//        heading.textContent = section;
//
//        const ul = document.createElement("ul");
//        ul.classList.add("product-specs");
//
//        for (const key in specs[section]) {
//            const li = document.createElement("li");
//            li.innerHTML = `<strong>${key}:</strong> ${specs[section][key]}`;
//            ul.appendChild(li);
//        }
//
//        sectionDiv.appendChild(heading);
//        sectionDiv.appendChild(ul);
//        specsContainer.appendChild(sectionDiv);
//    }
//}


//use this when backend is created
//fetch(`/api/product/${productId}`)
//  .then(res => res.json())
//  .then(product => openModal(product));




//============================== modal opening based on how the data is extracted ==============================


//container.addEventListener("click", function (e) {
//
//  const item = e.target.closest(".masonry-item-category6");
//
//  if (!item) return;
//
//  const img = item.querySelector("img");
//
//  const modalImage = document.getElementById("modalImage");
//  const modalTitle = document.getElementById("modalTitle");
//  const modalDescription = document.getElementById("modalDescription");
//  const modalPrice = document.getElementById("modalPrice");
//  const modalListPrice = document.getElementById("modalListPrice");
//  const modalSave = document.getElementById("modalsave");
//  const modalRating = document.getElementById("modalRating");
//
//  if (modalImage) modalImage.src = img.src;
//
//  if (modalTitle)
//    modalTitle.textContent = item.querySelector("h4").textContent;
//
//  if (modalPrice)
//    modalPrice.textContent = item.querySelector(".price1").textContent;
//
//  if (modalRating)
//    modalRating.textContent = item.querySelector(".rating").textContent;
//
//  if (modalDescription)
//    modalDescription.textContent =
//      "Premium anime inspired collectible product.";
//
//  if (modalListPrice)
//    modalListPrice.textContent = "List Price Available";
//
//  if (modalSave)
//    modalSave.textContent = "Special Offer Available";
//
//  modal.classList.add("active");
//
//});
//
//closeBtn.addEventListener("click", () => {
//  modal.classList.remove("active");
//});
//
//window.addEventListener("click", (e) => {
//  if (e.target === modal) {
//    modal.classList.remove("active");
//  }
//});