document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById("cartItems");
  const orderSummaryContainer = document.getElementById("orderSummary");
  const payNowBtn = document.getElementById("payNowBtn");
  const upiModal = document.getElementById("upiModal");
  const upiPayBtn = document.getElementById("upiPayBtn");
  const upiCancelBtn = document.getElementById("upiCancelBtn");
  const upiScannedBtn = document.getElementById("upiScannedBtn");
  const cartAddressLine = document.getElementById("cartAddressLine");
  const cartCityStateLine = document.getElementById("cartCityStateLine");
  const cartCountryPincodeLine = document.getElementById("cartCountryPincodeLine");

  if (!cartItemsContainer || !orderSummaryContainer) return;

  const API_BASE = window.API_BASE || "http://127.0.0.1:5000";
  const GST_RATE = 0.18;
  let currentCartItems = [];
  function formatPrice(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const trimmed = String(value).trim();
  return trimmed || fallback;
}

function renderCartAddress(user) {
  if (!cartAddressLine || !cartCityStateLine || !cartCountryPincodeLine) return;

  const address = safeText(user.address);
  const city = safeText(user.city);
  const state = safeText(user.state);
  const country = safeText(user.country);
  const pincode = safeText(user.pincode);

  cartAddressLine.textContent = address || "No address added yet.";

  if (city && state) {
    cartCityStateLine.textContent = `${city}, ${state}`;
  } else if (city) {
    cartCityStateLine.textContent = city;
  } else if (state) {
    cartCityStateLine.textContent = state;
  } else {
    cartCityStateLine.textContent = "";
  }

  if (country && pincode) {
    cartCountryPincodeLine.textContent = `${country} - ${pincode}`;
  } else if (country) {
    cartCountryPincodeLine.textContent = country;
  } else if (pincode) {
    cartCountryPincodeLine.textContent = `Pincode - ${pincode}`;
  } else {
    cartCountryPincodeLine.textContent = "";
  }
}

async function loadCartAddress() {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      method: "GET",
      credentials: "include"
    });

    if (res.status === 401) {
      renderCartAddress({});
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to load address");
    }

    const user = await res.json();
    renderCartAddress(user);
  } catch (error) {
    console.error("Cart address load error:", error);
    renderCartAddress({});
  }
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
    if (product.image) {
      return product.image.startsWith("/") ? product.image : `/${product.image}`;
    }
    return "images/products/placeholder.jpg";
  }

  function buildCartCard(product) {
    const price = Number(product.price || 0);
    const oldPrice = Number(product.old_price || 0);
    const qty = Number(product.quantity || 1);
    const saveAmount = oldPrice > price ? oldPrice - price : 0;
    const savePercent = oldPrice > price ? Math.round((saveAmount / oldPrice) * 100) : 0;

    return `
      <div class="cart-item-card" data-id="${product.id}">
        <img src="${escapeHtml(getImagePath(product))}" alt="${escapeHtml(product.name || "Product")}">

        <div class="cart-item-details">
          <h4>${escapeHtml(product.name || "Untitled Product")}</h4>
          <p class="cart-price">${formatPrice(price)}</p>
          <p class="cart-list-price">List Price: <span>${formatPrice(oldPrice)}</span></p>
          <p class="cart-save">You Save: ${formatPrice(saveAmount)} (${savePercent}%)</p>
        </div>

        <div class="cart-remove-btn" data-id="${product.id}" title="Remove from cart">🗑️</div>

        <div class="qty-control">
          <button class="qty-btn qty-decrease" data-id="${product.id}" data-qty="${qty}">-</button>
          <span>${qty}</span>
          <button class="qty-btn qty-increase" data-id="${product.id}" data-qty="${qty}">+</button>
        </div>
      </div>
    `;
  }

  function buildSummary(items) {
    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    orderSummaryContainer.innerHTML = `
      <div class="summary-row">
        <span>Items Total</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>GST(18%)</span>
        <span>${formatPrice(gst)}</span>
      </div>
      <hr>
      <div class="summary-row total-row">
        <strong>TOTAL</strong>
        <strong>${formatPrice(total)}</strong>
      </div>
    `;
    if (payNowBtn) {
    payNowBtn.textContent = `Pay ${formatPrice(total)} Securely`;
    }
  }

  async function fetchCart() {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "GET",
      credentials: "include"
    });

    if (res.status === 401) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">Please login first to view your cart.</div>
      `;
      orderSummaryContainer.innerHTML = "";
      return [];
    }

    if (!res.ok) {
      throw new Error("Failed to load cart");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function updateCartQuantity(productId, quantity) {
    const res = await fetch(`${API_BASE}/api/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update cart");
    }
  }

  async function removeCartItem(productId) {
    const res = await fetch(`${API_BASE}/api/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_id: productId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to remove item");
    }
  }

  async function placeOrder(paymentMethod) {
  const res = await fetch(`${API_BASE}/api/orders/place`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      payment_method: paymentMethod
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to place order");
  }

  return data;
}

  async function renderCartPage() {
    try {
      const items = await fetchCart();
      currentCartItems = items;

      if (!items.length) {
        // currentCartItems = items;
         currentCartItems = [];
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            No products in your cart yet. Add products from the product modal.
          </div>
        `;
        orderSummaryContainer.innerHTML = `
          <div class="empty-cart">No order summary available.</div>
        `;
        if (payNowBtn) {
            payNowBtn.textContent = "Pay ₹0 Securely";
        }
        return;
      }

      cartItemsContainer.innerHTML = items.map(buildCartCard).join("");
      buildSummary(items);

      document.querySelectorAll(".cart-remove-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const productId = btn.getAttribute("data-id");

          try {
            await removeCartItem(productId);
            renderCartPage();
          } catch (err) {
            console.error(err);
            alert("Failed to remove item");
          }
        });
      });

      document.querySelectorAll(".qty-decrease").forEach(btn => {
        btn.addEventListener("click", async () => {
          const productId = btn.getAttribute("data-id");
          const qty = Number(btn.getAttribute("data-qty"));

          try {
            await updateCartQuantity(productId, qty - 1);
            renderCartPage();
          } catch (err) {
            console.error(err);
            alert("Failed to update quantity");
          }
        });
      });

      document.querySelectorAll(".qty-increase").forEach(btn => {
        btn.addEventListener("click", async () => {
          const productId = btn.getAttribute("data-id");
          const qty = Number(btn.getAttribute("data-qty"));

          try {
            await updateCartQuantity(productId, qty + 1);
            renderCartPage();
          } catch (err) {
            console.error(err);
            alert("Failed to update quantity");
          }
        });
      });
} catch (error) {
  console.error("Cart page error:", error);
  currentCartItems = [];
  cartItemsContainer.innerHTML = `
    <div class="empty-cart">Failed to load cart items.</div>
  `;
  orderSummaryContainer.innerHTML = `
    <div class="empty-cart">Failed to load order summary.</div>
  `;
  if (payNowBtn) {
    payNowBtn.textContent = "Pay ₹0 Securely";
    payNowBtn.disabled = false;
  }
}
}
  //   } catch (error) {
  //     console.error("Cart page error:", error);
  //     currentCartItems = items;
  //     cartItemsContainer.innerHTML = `
  //       <div class="empty-cart">Failed to load cart items.</div>
  //     `;
  //     orderSummaryContainer.innerHTML = `
  //       <div class="empty-cart">Failed to load order summary.</div>
  //     `;
  //       // if (payNowBtn) {
  //       //     payNowBtn.textContent = "Pay ₹0 Securely";
  //       // }
  //   }
  // }
    // if (payNowBtn) {
    //     payNowBtn.addEventListener("click", () => {
    //     const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');

    //     if (!selectedMethod) {
    //         alert("Select the payment method first: Online or Cash on Delivery.");
    //     return;
    //     }

    //     if (selectedMethod.value === "online") {
    //         alert("Online payment selected.");
    //     } else if (selectedMethod.value === "cod") {
    //         alert("Cash on Delivery selected.");
    //     }
    //   });
    // }

//    payNowBtn.addEventListener("click", () => {
//     if (!currentCartItems.length) {
//       if (typeof window.showToast === "function") {
//           window.showToast("No products in cart. Add products first.");
//       } else {
//           alert("No products in cart. Add products to cart first.");
//       }
//       return;
//   }

//     const selected = document.querySelector('input[name="paymentMethod"]:checked');

//     if (!selected) {
//         alert("Please select a payment method first.");
//         return;
//     }

//     if (selected.value === "cod") {
//         payNowBtn.textContent = "Payment Successful ✅";
//         payNowBtn.disabled = true;
//         alert("Order placed successfully! Payment mode: Cash on Delivery 🚚");
//         return;
//     }

//     if (selected.value === "online") {
//         upiModal.style.display = "flex";
//     }
// });

// if (upiCancelBtn) {
//     upiCancelBtn.addEventListener("click", () => {
//         upiModal.style.display = "none";
//     });
// }

// if (upiPayBtn) {
//     upiPayBtn.addEventListener("click", () => {
//         const upiId = document.getElementById("upiIdInput").value.trim();

//         if (!upiId) {
//             alert("Please enter UPI ID or scan QR.");
//             return;
//         }

//         payNowBtn.textContent = "Payment Successful ✅";
//         payNowBtn.disabled = true;

//         alert("Payment Successful ✅\nOrder Placed Successfully 🎉");

//         upiModal.style.display = "none";
//     });
// }

// if (upiScannedBtn) {
//     upiScannedBtn.addEventListener("click", () => {
//         payNowBtn.textContent = "Payment Successful ✅";
//         payNowBtn.disabled = true;

//         alert("Payment Successful ✅\nOrder Placed Successfully 🎉");

//         upiModal.style.display = "none";
//     });
// }

if (payNowBtn) {
  payNowBtn.addEventListener("click", async () => {
    if (!currentCartItems.length) {
      if (typeof window.showToast === "function") {
        window.showToast("No products in cart. Add products first.");
      } else {
        alert("No products in cart. Add products to cart first.");
      }
      return;
    }

    const selected = document.querySelector('input[name="paymentMethod"]:checked');

    if (!selected) {
      alert("Please select a payment method first.");
      return;
    }

    // COD -> place order directly
    if (selected.value === "cod") {
      try {
        const data = await placeOrder("cod");

        payNowBtn.textContent = "Payment Successful ✅";
        payNowBtn.disabled = true;

        alert(`Order placed successfully! Payment mode: Cash on Delivery 🚚\nOrder(s): ${data.orders.join(", ")}`);

        await renderCartPage();
      } catch (err) {
        console.error(err);
        alert("Failed to place order");
      }
      return;
    }

    // UPI -> open popup first
    if (selected.value === "online") {
      upiModal.style.display = "flex";
    }
  });
}

if (upiCancelBtn) {
  upiCancelBtn.addEventListener("click", () => {
    upiModal.style.display = "none";
  });
}

if (upiPayBtn) {
  upiPayBtn.addEventListener("click", async () => {
    const upiId = document.getElementById("upiIdInput").value.trim();

    if (!upiId) {
      alert("Please enter UPI ID or scan QR.");
      return;
    }

    try {
      const data = await placeOrder("upi");

      payNowBtn.textContent = "Payment Successful ✅";
      payNowBtn.disabled = true;

      alert(`Payment Successful ✅\nOrder Placed Successfully 🎉\nOrder(s): ${data.orders.join(", ")}`);

      upiModal.style.display = "none";
      document.getElementById("upiIdInput").value = "";

      await renderCartPage();
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  });
}

if (upiScannedBtn) {
  upiScannedBtn.addEventListener("click", async () => {
    try {
      const data = await placeOrder("upi");

      payNowBtn.textContent = "Payment Successful ✅";
      payNowBtn.disabled = true;

      alert(`Payment Successful ✅\nOrder Placed Successfully 🎉\nOrder(s): ${data.orders.join(", ")}`);

      upiModal.style.display = "none";
      document.getElementById("upiIdInput").value = "";

      await renderCartPage();
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  });
}

  renderCartPage();
  loadCartAddress();
});