//=================================== loads products Dynamically ======================================

//const products = [
//{
//id:101,
//name:"Anime Itachi Uchiha Action Figure with Crows | Premium Collectible Statue | Naruto Shippuden Merchandise",
//price:1899,
//oldPrice:2699,
//rating:4.6,
//image:"images/products/anime.jpg"
//},
//
//{
//id:102,
//name:"Naruto Uzumaki Action Figure | Limited Edition Anime Collectible",
//price:1599,
//oldPrice:2199,
//rating:4.4,
//image:"images/products/itachi.jpg"
//},
//
//{
//id:103,
//name:"Dragon Ball Z Goku Super Saiyan Figure | Anime Display Statue",
//price:2099,
//oldPrice:2899,
//rating:4.7,
//image:"images/products/goku.jpg"
//}
//];
//const container = document.getElementById("productContainer");
//
//products.forEach(product => {
//
//container.innerHTML += `
//<div class="masonry-item-category6" data-id="${product.id}">
//    <img src="${product.image}">
//    <div class="product-info">
//        <h4>${product.name}</h4>
//        <p class="price1">₹${product.price}</p>
//        <p>List Price: <del>₹${product.oldPrice}</del></p>
//        <p class="rating">⭐ ${product.rating}</p>
//    </div>
//</div>
//`;
//
//});

//=========================== checks products according to the category ==================================================

//const container = document.getElementById("productContainer");
//
//if (container) {
//
//const category = container.dataset.category;
//
//console.log(category);
//
//const filteredProducts = products.filter(product => product.category === category);
//
//}