document.addEventListener("DOMContentLoaded", () => {

    const yetBox = document.getElementById("yetToBeDeliveredList");
    const deliveredBox = document.getElementById("previouslyDeliveredList");
    const returnContainer = document.getElementById("returningProcessContainer");

    const API_BASE = window.API_BASE || "http://127.0.0.1:5000";

    // -------------------------------
    // Helpers
    // -------------------------------

    function formatPrice(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function formatDate(dateValue) {
        if (!dateValue) return "";
        const date = new Date(dateValue);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
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

    function getImagePath(item) {
        const raw = item.image_link || "";
        if (!raw) return "images/products/placeholder.jpg";

        if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
            return raw;
        }

        return `/${raw}`;
    }

    // -------------------------------
    // Card Builder (MATCHES YOUR UI)
    // -------------------------------

    function buildOrderCard(item, isDelivered = false) {

        const price = Number(item.price || 0);
        const mrp = Number(item.mrp || item.price || 0);

        const saveAmount = mrp > price ? mrp - price : 0;
        const savePercent = mrp > price ? Math.round((saveAmount / mrp) * 100) : 0;

        const statusText = isDelivered
            ? `Delivered on: ${formatDate(item.delivered_at || item.estimated_delivery_date)}`
            : `Expected by: ${formatDate(item.estimated_delivery_date)}`;

        let remainingReturnDays = 0;

        if (isDelivered) {
        
            const orderDate =
                item.delivered_at ||
                item.created_at ||
                item.estimated_delivery_date;
        
            if (orderDate) {
            
                const diffMs =
                    new Date() - new Date(orderDate);
            
                const daysPassed =
                    Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
                remainingReturnDays =
                    Math.max(0, 15 - daysPassed);
            }
        }
        return `
            <div class="order-card">

                <img src="${escapeHtml(getImagePath(item))}" 
                     alt="${escapeHtml(item.product_name || "Product")}">

                <div class="order-details">

                    <h4>${escapeHtml(item.product_name || "Untitled Product")}</h4>

                    <p class="price">${formatPrice(price)}</p>

                    <p class="list">
                        List Price: <span>${formatPrice(mrp)}</span>
                    </p>

                    <p class="save">
                        You Save: ${formatPrice(saveAmount)} (${savePercent}%)
                    </p>
                    
                    <p>
                        Quantity: ${item.quantity || 1}
                    </p>

                    <p class="delivery ${isDelivered ? "delivered-text" : ""}">
                        ${statusText}
                    </p>

                    ${item.rating ? `<p>⭐ ${escapeHtml(item.rating)}</p>` : ""}
                    ${
                        isDelivered && remainingReturnDays > 0
                        ? `
                            <button
                                class="return-btn"
                                title="You have ${remainingReturnDays} day${remainingReturnDays === 1 ? "" : "s"} left to return this product"
                                onclick="requestReturn(
                                    ${item.order_item_id},
                                    '${escapeHtml(item.product_name || "")}'
                                )">
                                Return
                            </button>
                          `
                        : ""
                    }

                </div>
            </div>
        `;
    }

    function buildReturnCard(item) {

    const requestDate = item.request_date
        ? new Date(item.request_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "";

    const requestDateObj = item.request_date
        ? new Date(item.request_date)
        : null;

    let daysPassed = 0;

    if (requestDateObj && !isNaN(requestDateObj.getTime())) {
        const diffMs = new Date() - requestDateObj;
        daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    const remainingDays = Math.max(0, 3 - daysPassed);

    const image = item.img
        ? `${API_BASE}${item.img}`
        : "images/products/placeholder.jpg";

    return `
        <div class="order-card">

            <img src="${image}" alt="${escapeHtml(item.product_name)}">

            <div class="order-details">

                <h4>${escapeHtml(item.product_name)}</h4>

                <p class="return-info">
                    Return request is in process
                </p>

                <p class="delivery">
                    Requested on: ${requestDate}
                </p>

                <p class="returned-date">
                    Will be removed in ${remainingDays}
                    day${remainingDays === 1 ? "" : "s"}
                </p>

            </div>

        </div>
    `;
    }

    // -------------------------------
    // Empty UI
    // -------------------------------

    function renderEmpty(message) {
        return `
            <div class="orders-empty-state">
                ${message}
            </div>
        `;
    }

    // -------------------------------
    // Main Loader
    // -------------------------------

    async function loadOrders() {

        const userId =
            localStorage.getItem("user_id");

        if (!userId) {
        
            yetBox.innerHTML =
                renderEmpty(
                    "Please login to view orders."
                );
            
            deliveredBox.innerHTML =
                renderEmpty(
                    "Please login to view orders."
                );
            
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: "GET",
                credentials: "include"
            });

            const data = await res.json();
            const userId =
                localStorage.getItem("user_id");

            let returnedIds = new Set();

            try {
        
                const returnRes =
                    await fetch(
                        `${API_BASE}/return-products`,
                        {
                            credentials: "include"
                        }
                    );
                
                if (returnRes.ok) {
                
                    const returnItems =
                        await returnRes.json();
                
                    returnedIds =
                        new Set(
                            returnItems.map(
                                item => item.order_item_id
                            )
                        );
                }
        
            } catch (error) {
        
                console.error(
                    "Could not load return list",
                    error
                );
            }

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch orders");
            }

            // Split based on status
            const pending = [];
            const delivered = [];

            // data.forEach(item => {
            //     if ((item.order_status || "").toLowerCase() === "delivered") {
            //         delivered.push(item);
            //     } else {
            //         pending.push(item);
            //     }
            // });
            data.forEach(item => {

                const status =
                    (item.order_status || "")
                        .toLowerCase();

                if (
                    status === "delivered"
                ) {

                if (
                    !returnedIds.has(
                    item.order_item_id
                    )
                ) {
                    delivered.push(item);
                }   

            } else {

                pending.push(item);
            }
        });

            // Render Pending
            yetBox.innerHTML = pending.length
                ? pending.map(item => buildOrderCard(item, false)).join("")
                : renderEmpty("No products are waiting for delivery.");

            // Render Delivered
            deliveredBox.innerHTML = delivered.length
                ? delivered.map(item => buildOrderCard(item, true)).join("")
                : renderEmpty("No delivered products yet.");

        } catch (error) {
            console.error("Order page error:", error);

            yetBox.innerHTML = renderEmpty("Failed to load orders.");
            deliveredBox.innerHTML = renderEmpty("Failed to load orders.");
        }
    }

async function loadReturnRequests() {

    try {

        const userId = localStorage.getItem("user_id");

        if (!userId) {
            returnContainer.innerHTML =
                renderEmpty("Please login to view return requests.");
            return;
        }

        const res = await fetch(`${API_BASE}/return-products`, {
            credentials: "include"
        })

        const data = await res.json();

        if (!res.ok) {
            throw new Error("Failed to load returns");
        }

        returnContainer.innerHTML = data.length
            ? data.map(buildReturnCard).join("")
            : renderEmpty(
                  "No products are currently in returning process."
              );

    } catch (error) {

        console.error(error);

        returnContainer.innerHTML =
            renderEmpty("Failed to load return requests.");
    }
}


window.requestReturn = async function (
    orderItemId,
    productName
) {

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Please login first");
        return;
    }

    const confirmReturn = confirm(
        `Do you want to request return for ${productName}?`
    );

    if (!confirmReturn) return;

    try {

        const response = await fetch(
            `${API_BASE}/request-return`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // user_id: Number(userId),
                    order_item_id: orderItemId
                }),
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Could not request return"
            );
            return;
        }

        alert(
            data.message ||
            "Return request submitted successfully"
        );

        loadOrders();
        loadReturnRequests();

    } catch (error) {

        console.error(error);

        alert(
            "Could not request return"
        );
    }
};


    // -------------------------------
    // INIT
    // -------------------------------

    loadOrders();
    loadReturnRequests();

});