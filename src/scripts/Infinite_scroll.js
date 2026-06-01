//infinite scroll

        //const grid = document.querySelector(".masonry-grid-category4");
        //const trigger = document.getElementById("scrollTrigger");
        //const loader = document.getElementById("loader");

        //let loading = false;

        //const observer = new IntersectionObserver(entries => {
        //    if (entries[0].isIntersecting && !loading) {
        //        loadMoreItems();
        //    }
        //}, {
        //    rootMargin: "200px"
        //});

        //observer.observe(trigger);

        //function loadMoreItems() {
        //loading = true;
        //    loader.style.display = "block";

        //    // Simulate backend delay
        //    setTimeout(() => {

        //        for (let i = 0; i < 6; i++) {
        //            const item = document.createElement("div");
        //            item.classList.add("masonry-item-category4");

        //            item.innerHTML = `
        //                <img src="images/products/fanfinity.png">
        //            `;
        //                
        //            grid.appendChild(item);
        //    }

        //        loader.style.display = "none";
        //        loading = false;

        //    }, 1000);
        //}