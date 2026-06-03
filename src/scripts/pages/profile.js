document.addEventListener("DOMContentLoaded", () => {
  const profileUsername = document.getElementById("profileUsername");
  const profileLocation = document.getElementById("profileLocation");

  const addressLine = document.getElementById("addressLine");
  const cityStateLine = document.getElementById("cityStateLine");
  const countryPincodeLine = document.getElementById("countryPincodeLine");
  const phoneLine = document.getElementById("phoneLine");

  const profileForm = document.getElementById("profileForm");
  const usernameInput = document.getElementById("usernameInput");
  const addressInput = document.getElementById("addressInput");
  const cityInput = document.getElementById("cityInput");
  const stateInput = document.getElementById("stateInput");
  const countryInput = document.getElementById("countryInput");
  const pincodeInput = document.getElementById("pincodeInput");
  // const phoneInput = document.getElementById("phoneInput");
  const profileSubmitBtn = document.getElementById("profileSubmitBtn");

  //These two selectors will point to the profile-page wishlist/cart containers, and API_BASE will be used for API calls.
    const profileWishlistPreview = document.getElementById("profileWishlistPreview");
  const profileCartPreview = document.getElementById("profileCartPreview");
const profileOrdersPreview = document.getElementById("profileOrdersPreview");
  //profile section form selectors
  const emailInput = document.getElementById("emailInput");
const otpInput = document.getElementById("otpInput");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpTimerText = document.getElementById("otpTimerText");
const passwordFields = document.getElementById("passwordFields");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

  const API_BASE = window.API_BASE || "http://127.0.0.1:5000";

  let currentUser = null;

// Purpose
// formatPrice() formats rupee values properly
// escapeHtml() keeps product text safe
// getImagePath() handles product image path correctly
  function safeText(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    const trimmed = String(value).trim();
    return trimmed || fallback;
  }

    function formatPrice(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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
    if (product.image_url) {
      return product.image_url.startsWith("/") ? product.image_url : `/${product.image_url}`;
    }
    return "images/products/placeholder.jpg";
  }

  function buildLocationText(user) {
    const city = safeText(user.city);
    const state = safeText(user.state);

    if (city && state) return `📍 ${city}, ${state}`;
    if (city) return `📍 ${city}`;
    if (state) return `📍 ${state}`;
    return "📍 Add your address";
  }

  function renderProfileTop(user) {
    if (!profileUsername || !profileLocation) return;

    profileUsername.textContent = safeText(user.username, "Fanfinity User");
    profileLocation.textContent = buildLocationText(user);
  }

  function renderAddressCard(user) {
    if (!addressLine || !cityStateLine || !countryPincodeLine || !phoneLine) return;

    const address = safeText(user.address);
    const city = safeText(user.city);
    const state = safeText(user.state);
    const country = safeText(user.country);
    const pincode = safeText(user.pincode);
    const phone = safeText(user.phone_no);

    addressLine.textContent = address || "No address added yet.";

    if (city && state) {
      cityStateLine.textContent = `${city}, ${state}`;
    } else if (city) {
      cityStateLine.textContent = city;
    } else if (state) {
      cityStateLine.textContent = state;
    } else {
      cityStateLine.textContent = "";
    }

    if (country && pincode) {
      countryPincodeLine.textContent = `${country} - ${pincode}`;
    } else if (country) {
      countryPincodeLine.textContent = country;
    } else if (pincode) {
      countryPincodeLine.textContent = `Pincode - ${pincode}`;
    } else {
      countryPincodeLine.textContent = "";
    }

    phoneLine.textContent = phone ? `Phone: ${phone}` : "";
  }

  function fillProfileForm(user) {
    if (!profileForm) return;
    emailInput.value = safeText(user.email);
    usernameInput.value = safeText(user.username);
    addressInput.value = safeText(user.address);
    cityInput.value = safeText(user.city);
    stateInput.value = safeText(user.state);
    countryInput.value = safeText(user.country, "India");
    pincodeInput.value = safeText(user.pincode);
    // phoneInput.value = safeText(user.phone_no);
  }

  function updateAllUI(user) {
    renderProfileTop(user);
    renderAddressCard(user);
    fillProfileForm(user);
  }

  async function sendOtpForPasswordChange() {
    const payload = {
        purpose: "change_password",
        email: emailInput.value.trim()
    };

    const response = await fetch(`${window.API_BASE || ""}/api/profile/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.status === 429) {
      alert("Too many OTP requests. Please wait before requesting another OTP.");
      return;
    }

    if (!response.ok) {
        alert(result.error || "Failed to send OTP.");
        return;
    }

    const otpGroup = document.getElementById("otpGroup");
if (otpGroup) otpGroup.style.display = "block";
otpInput.style.display = "block";
verifyOtpBtn.style.display = "inline-block";
    startOtpTimer(result.expires_in_seconds || 300);
    alert(result.message);
}

// async function verifyOtpCode() {
//     const response = await fetch(`${window.API_BASE || ""}/api/profile/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ otp_code: otpInput.value.trim() })
//     });

//     const result = await response.json();

//     if (!response.ok) {
//         alert(result.error || "OTP verification failed.");
//         return;
//     }
    
//     clearInterval(otpTimerInterval);
//     otpTimerText.textContent = "OTP verified";
//     passwordFields.style.display = "block";
//     verifyOtpBtn.textContent = "Verified";
//     verifyOtpBtn.disabled = true;
//     otpInput.disabled = true;
//     alert("OTP verified successfully.");

// }

async function verifyOtpCode() {
    const response = await fetch(`${API_BASE}/api/profile/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp_code: otpInput.value.trim() })
    });

    const result = await response.json();

    if (response.status === 429) {
      alert("Too many OTP verification attempts. Please try again later.");
      return;
    }

    if (!response.ok) {
        alert(result.error || "OTP verification failed.");
        return;
    }

    clearInterval(otpTimerInterval);
    otpTimerText.textContent = "OTP verified";

    passwordFields.style.display = "block";
    verifyOtpBtn.textContent = "Verified";
    verifyOtpBtn.disabled = true;
    otpInput.disabled = true;

    alert("OTP verified successfully.");
}

let otpTimerInterval = null;

function startOtpTimer(seconds) {
    let remaining = seconds;

    clearInterval(otpTimerInterval);

    otpTimerInterval = setInterval(() => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        otpTimerText.textContent = `OTP expires in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            otpTimerText.textContent = "OTP expired";
        }

        remaining--;
    }, 1000);
}

function resetSecurityFields() {
    clearInterval(otpTimerInterval);

    if (otpTimerText) otpTimerText.textContent = "";
    if (otpInput) {
        otpInput.value = "";
        otpInput.disabled = false;
        otpInput.style.display = "none";
    }

    const otpGroup = document.getElementById("otpGroup");
    if (otpGroup) otpGroup.style.display = "none";

    if (verifyOtpBtn) {
        verifyOtpBtn.style.display = "none";
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Verify OTP";
    }

    if (passwordFields) {
        passwordFields.style.display = "none";
    }

    if (newPasswordInput) newPasswordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";
}

//current used one
// async function saveAccountProfile() {
//     const username = usernameInput.value.trim();
//     const email = emailInput.value.trim();
//     const newPassword = newPasswordInput.value.trim();
//     const confirmPassword = confirmPasswordInput.value.trim();

//     if (!username) {
//         alert("Username is required.");
//         return;
//     }

//     if (passwordFields.style.display !== "none") {
//         const response = await fetch(`${window.API_BASE || ""}/api/profile/password/update`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify({
//                 username,
//                 email,
//                 new_password: newPassword,
//                 confirm_password: confirmPassword
//             })
//         });

//         const result = await response.json();
//         if (!response.ok) {
//             alert(result.error || "Failed to update password.");
//             return;
//         }

//         updateAllUI({ ...currentUser, ...result.user, email });
//         alert(result.message);
//         closeProfileModal();
//         return;
//     }

//     const response = await fetch(`${window.API_BASE || ""}/api/profile/account/update`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ username, email })
//     });

//     const result = await response.json();
//     if (!response.ok) {
//         alert(result.error || "Failed to update account.");
//         return;
//     }

//     currentUser = { ...currentUser, ...result.user };
//     updateAllUI(currentUser);
//     alert(result.message);
//     closeProfileModal();
// }

async function loadOrdersPreview() {
  if (!profileOrdersPreview) return;

  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "GET",
      credentials: "include"
    });

    if (response.status === 401) {
      profileOrdersPreview.innerHTML = `
        <div class="preview-empty-state">Please login to view orders.</div>
      `;
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load orders");
    }

    const orders = await response.json();

    if (!orders.length) {
      profileOrdersPreview.innerHTML = `
        <div class="preview-empty-state">No orders yet.</div>
      `;
      return;
    }

    // 🔥 STEP 4: FILTER LOGIC
    const delivered = orders.filter(o => o.order_status === "Delivered");
    const pending = orders.filter(o => o.order_status === "Yet to be Delivered");

    const finalOrders = delivered.length > 0 ? delivered : pending;

    renderOrdersPreview(finalOrders);

  } catch (error) {
    console.error("Orders preview error:", error);
    profileOrdersPreview.innerHTML = `
      <div class="preview-empty-state">Failed to load orders.</div>
    `;
  }
}

function renderOrdersPreview(items) {
  if (!items.length) return;

  const product = items[0]; // only show latest

  const price = Number(product.price || 0);
  const oldPrice = Number(product.mrp || 0);

  const statusText =
    product.order_status === "Delivered"
      ? "✅ Delivered"
      : "🚚 Yet to be Delivered";

  profileOrdersPreview.innerHTML = `
    <div class="product-item profile-product-preview">
      
      <div class="product-image">
        <img src="${escapeHtml(product.image_link || "images/products/placeholder.jpg")}">
      </div>

      <div class="product-details">
        <h3>${escapeHtml(product.product_name)}</h3>

        <div class="price">${formatPrice(price)}</div>

        <div class="list-price">
          List Price: <span>${formatPrice(oldPrice)}</span>
        </div>

        <div class="save" style="color:${
          product.order_status === "Delivered" ? "green" : "orange"
        }">
          ${statusText}
        </div>

      </div>
    </div>
  `;
}

async function saveAccountProfile() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!username) {
        alert("Username is required.");
        usernameInput.focus();
        return;
    }

    if (username.length < 3) {
        alert("Username must be at least 3 characters.");
        usernameInput.focus();
        return;
    }

    const originalBtnText = profileSubmitBtn.textContent;
    profileSubmitBtn.disabled = true;
    profileSubmitBtn.textContent = "Saving...";

    try {
        // Password change flow
        if (passwordFields && passwordFields.style.display !== "none") {
            if (!otpInput.value.trim()) {
                alert("Please enter and verify OTP first.");
                otpInput.focus();
                return;
            }

            if (!newPassword) {
                alert("New password is required.");
                newPasswordInput.focus();
                return;
            }

            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters.");
                newPasswordInput.focus();
                return;
            }

            if (!confirmPassword) {
                alert("Please confirm your password.");
                confirmPasswordInput.focus();
                return;
            }

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                confirmPasswordInput.focus();
                return;
            }

            const response = await fetch(`${API_BASE}/api/profile/password/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || "Failed to update password.");
                return;
            }

            currentUser = { ...currentUser, ...result.user };
            updateAllUI(currentUser);
            resetSecurityFields();
            alert(result.message);

            if (typeof window.closeProfileModal === "function") {
                window.closeProfileModal();
            }
            return;
        }

        // Username / email only flow
        const response = await fetch(`${API_BASE}/api/profile/account/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, email })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to update account.");
            return;
        }

        currentUser = { ...currentUser, ...result.user };
        updateAllUI(currentUser);
        resetSecurityFields();
        alert(result.message);

        if (typeof window.closeProfileModal === "function") {
            window.closeProfileModal();
        }
    } catch (error) {
        console.error("Error updating account profile:", error);
        alert("Something went wrong while saving account details.");
    } finally {
        profileSubmitBtn.disabled = false;
        profileSubmitBtn.textContent = originalBtnText;
    }
}

//current used one
// async function saveAddressProfile() {
//     const payload = {
//         address: addressInput.value.trim(),
//         city: cityInput.value.trim(),
//         state: stateInput.value.trim(),
//         country: countryInput.value.trim(),
//         pincode: pincodeInput.value.trim()
//     };

//     const response = await fetch(`${window.API_BASE || ""}/api/profile/address/update`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload)
//     });

//     const result = await response.json();
//     if (!response.ok) {
//         alert(result.error || "Failed to update address.");
//         return;
//     }

//     currentUser = { ...currentUser, ...result.user };
//     updateAllUI(currentUser);
//     alert(result.message);
//     closeProfileModal();
// }

//new one 
async function saveAddressProfile() {
    const address = addressInput.value.trim();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    const country = countryInput.value.trim();
    const pincode = pincodeInput.value.trim();

    if (!address) {
        alert("Address is required.");
        addressInput.focus();
        return;
    }

    if (!city) {
        alert("City is required.");
        cityInput.focus();
        return;
    }

    if (!state) {
        alert("State is required.");
        stateInput.focus();
        return;
    }

    if (!country) {
        alert("Country is required.");
        countryInput.focus();
        return;
    }

    if (!pincode) {
        alert("Pincode is required.");
        pincodeInput.focus();
        return;
    }

    if (!/^\d+$/.test(pincode)) {
        alert("Pincode must contain only digits.");
        pincodeInput.focus();
        return;
    }

    const originalBtnText = profileSubmitBtn.textContent;
    profileSubmitBtn.disabled = true;
    profileSubmitBtn.textContent = "Saving...";

    try {
        const response = await fetch(`${API_BASE}/api/profile/address/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                address,
                city,
                state,
                country,
                pincode
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to update address.");
            return;
        }

        currentUser = { ...currentUser, ...result.user };
        updateAllUI(currentUser);
        alert(result.message);

        if (typeof window.closeProfileModal === "function") {
            window.closeProfileModal();
        }
    } catch (error) {
        console.error("Error updating address profile:", error);
        alert("Something went wrong while saving address.");
    } finally {
        profileSubmitBtn.disabled = false;
        profileSubmitBtn.textContent = originalBtnText;
    }
}

  //This shows only the latest up to 4 product images in the wishlist preview, just like you asked.
    function renderWishlistPreview(items) {
    if (!profileWishlistPreview) return;

    if (!items || !items.length) {
      profileWishlistPreview.innerHTML = `
        <div class="preview-empty-state">No products in wishlist yet.</div>
      `;
      return;
    }

    const limitedItems = items.slice(0, 4);

    profileWishlistPreview.innerHTML = limitedItems.map(product => `
      <div class="wishlist-card">
        <img src="${escapeHtml(getImagePath(product))}" alt="${escapeHtml(product.name || "Product")}">
      </div>
    `).join("");
  }

  //This shows the latest cart item only in the same preview card structure.
    function renderCartPreview(items) {
    if (!profileCartPreview) return;

    if (!items || !items.length) {
      profileCartPreview.innerHTML = `
        <div class="preview-empty-state">No products in cart yet.</div>
      `;
      return;
    }

    const product = items[0];
    const price = Number(product.price || 0);
    const oldPrice = Number(product.old_price || 0);
    const saveAmount = oldPrice > price ? oldPrice - price : 0;
    const savePercent = oldPrice > price ? Math.round((saveAmount / oldPrice) * 100) : 0;

    profileCartPreview.innerHTML = `
      <div class="product-item profile-product-preview">
        <div class="product-image">
          <img src="${escapeHtml(getImagePath(product))}" alt="${escapeHtml(product.name || "Product")}">
        </div>

        <div class="product-details">
          <h3>${escapeHtml(product.name || "Untitled Product")}</h3>
          <div class="price">${formatPrice(price)}</div>
          <div class="list-price">
            List Price: <span>${formatPrice(oldPrice)}</span>
          </div>
          <div class="save">
            💸 You Save: ${formatPrice(saveAmount)} (${savePercent}%)
          </div>
        </div>
      </div>
    `;
  }

  async function loadProfileData() {
    try {
      let user = null;

      if (typeof window.fetchLoggedInUser === "function") {
        user = await window.fetchLoggedInUser();
      } else {
        const response = await fetch(`${window.API_BASE || ""}/api/me`, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Unable to fetch user profile");
        }

        user = await response.json();
      }

      if (!user) {
        alert("Please login first.");
        window.location.href = "home.html";
        return;
      }

      currentUser = user;
      updateAllUI(user);
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("Unable to load profile details.");
    }
  }

//These functions fetch real data from backend and pass it to the preview renderers.
    async function loadWishlistPreview() {
    if (!profileWishlistPreview) return;

    try {
      const response = await fetch(`${API_BASE}/api/wishlist`, {
        method: "GET",
        credentials: "include"
      });

      if (response.status === 401) {
        profileWishlistPreview.innerHTML = `
          <div class="preview-empty-state">Please login first to view wishlist.</div>
        `;
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load wishlist preview");
      }

      const items = await response.json();
      renderWishlistPreview(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Wishlist preview error:", error);
      profileWishlistPreview.innerHTML = `
        <div class="preview-empty-state">Failed to load wishlist preview.</div>
      `;
    }
  }

  //These functions fetch real data from backend and pass it to the preview renderers.
  async function loadCartPreview() {
    if (!profileCartPreview) return;

    try {
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: "GET",
        credentials: "include"
      });

      if (response.status === 401) {
        profileCartPreview.innerHTML = `
          <div class="preview-empty-state">Please login first to view cart.</div>
        `;
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load cart preview");
      }

      const items = await response.json();
      renderCartPreview(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Cart preview error:", error);
      profileCartPreview.innerHTML = `
        <div class="preview-empty-state">Failed to load cart preview.</div>
      `;
    }
  }
//current used one
// function validateProfileForm() {
//     const username = usernameInput.value.trim();
//     const address = addressInput.value.trim();
//     const city = cityInput.value.trim();
//     const state = stateInput.value.trim();
//     const country = countryInput.value.trim();
//     const pincode = pincodeInput.value.trim();
//     const phone = phoneInput.value.trim();

//     if (window.profileEditMode === "profile") {
//         if (!username) {
//             alert("Username is required.");
//             usernameInput.focus();
//             return false;
//         }

//         if (username.length < 3) {
//             alert("Username must be at least 3 characters.");
//             usernameInput.focus();
//             return false;
//         }

//         if (!phone) {
//             alert("Phone number is required.");
//             phoneInput.focus();
//             return false;
//         }

//         if (!/^\d+$/.test(phone)) {
//             alert("Phone number must contain only digits.");
//             phoneInput.focus();
//             return false;
//         }

//         if (phone.length < 10 || phone.length > 15) {
//             alert("Phone number must be between 10 and 15 digits.");
//             phoneInput.focus();
//             return false;
//         }
//     }

//     if (!address) {
//         alert("Address is required.");
//         addressInput.focus();
//         return false;
//     }

//     if (!city) {
//         alert("City is required.");
//         cityInput.focus();
//         return false;
//     }

//     if (!state) {
//         alert("State is required.");
//         stateInput.focus();
//         return false;
//     }

//     if (!country) {
//         alert("Country is required.");
//         countryInput.focus();
//         return false;
//     }

//     if (!pincode) {
//         alert("Pincode is required.");
//         pincodeInput.focus();
//         return false;
//     }

//     if (!/^\d+$/.test(pincode)) {
//         alert("Pincode must contain only digits.");
//         pincodeInput.focus();
//         return false;
//     }

//     return true;
// }

//old one 
//   function validateProfileForm() {
//     const username = usernameInput.value.trim();
//     const address = addressInput.value.trim();
//     const city = cityInput.value.trim();
//     const state = stateInput.value.trim();
//     const country = countryInput.value.trim();
//     const pincode = pincodeInput.value.trim();
//     const phone = phoneInput.value.trim();

//     // if (!username) {
//     //   alert("Username is required.");
//     //   usernameInput.focus();
//     //   return false;
//     // }

//     // if (username.length < 3) {
//     //   alert("Username must be at least 3 characters.");
//     //   usernameInput.focus();
//     //   return false;
//     // }

//     // Only validate username & phone in full profile mode
// if (window.profileEditMode === "profile") {
//     if (!usernameInput.value.trim()) {
//         alert("Username is required.");
//         usernameInput.focus();
//         return false;
//     }

//     if (!phoneInput.value.trim()) {
//         alert("Phone number is required.");
//         phoneInput.focus();
//         return false;
//     }
// }
//     if (!address) {
//       alert("Address is required.");
//       addressInput.focus();
//       return false;
//     }

//     if (!city) {
//       alert("City is required.");
//       cityInput.focus();
//       return false;
//     }

//     if (!state) {
//       alert("State is required.");
//       stateInput.focus();
//       return false;
//     }

//     if (!country) {
//       alert("Country is required.");
//       countryInput.focus();
//       return false;
//     }

//     if (!pincode) {
//       alert("Pincode is required.");
//       pincodeInput.focus();
//       return false;
//     }

//     if (!/^\d+$/.test(pincode)) {
//       alert("Pincode must contain only digits.");
//       pincodeInput.focus();
//       return false;
//     }

//     if (!phone) {
//       alert("Phone number is required.");
//       phoneInput.focus();
//       return false;
//     }

//     if (!/^\d+$/.test(phone)) {
//       alert("Phone number must contain only digits.");
//       phoneInput.focus();
//       return false;
//     }

//     if (phone.length < 10 || phone.length > 15) {
//       alert("Phone number must be between 10 and 15 digits.");
//       phoneInput.focus();
//       return false;
//     }

//     return true;
//   }

//   async function saveProfile(event) {
//     event.preventDefault();

//     if (!validateProfileForm()) return;

//     // const payload = {
//     //   username: usernameInput.value.trim(),
//     //   address: addressInput.value.trim(),
//     //   city: cityInput.value.trim(),
//     //   state: stateInput.value.trim(),
//     //   country: countryInput.value.trim(),
//     //   pincode: pincodeInput.value.trim(),
//     //   phone_no: phoneInput.value.trim()
//     // };
//     let payload = {
//   address: addressInput.value.trim(),
//   city: cityInput.value.trim(),
//   state: stateInput.value.trim(),
//   country: countryInput.value.trim(),
//   pincode: pincodeInput.value.trim()
// };

async function saveProfile(event) {
    event.preventDefault();

    if (window.profileEditMode === "address") {
        await saveAddressProfile();
    } else {
        await saveAccountProfile();
    }
}

if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", sendOtpForPasswordChange);
}

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", verifyOtpCode);
}

// if (window.profileEditMode === "profile") {
//   payload.username = usernameInput.value.trim();
//   payload.phone_no = phoneInput.value.trim();
// }

//     const originalBtnText = profileSubmitBtn.textContent;
//     profileSubmitBtn.disabled = true;
//     profileSubmitBtn.textContent = "Saving...";

//     try {
//       const response = await fetch(`${window.API_BASE || ""}/api/profile/update`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: "include",
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         alert(result.error || "Failed to update profile.");
//         return;
//       }

//       currentUser = result.user;

//       if (typeof window.currentLoggedInUser === "object" && window.currentLoggedInUser) {
//         window.currentLoggedInUser = {
//           ...window.currentLoggedInUser,
//           ...result.user
//         };
//       } else {
//         window.currentLoggedInUser = result.user;
//       }

//       updateAllUI(result.user);
//       loadWishlistPreview();
//       loadCartPreview();

//       if (typeof window.closeProfileModal === "function") {
//         window.closeProfileModal();
//       }

//       alert("Profile updated successfully.");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       alert("Something went wrong while updating profile.");
//     } finally {
//       profileSubmitBtn.disabled = false;
//       profileSubmitBtn.textContent = originalBtnText;
//     }
//   }

   if (profileForm) {
     profileForm.addEventListener("submit", saveProfile);
   }

   window.resetSecurityFields = resetSecurityFields;

  loadProfileData();
  loadWishlistPreview();
  loadCartPreview();
  loadOrdersPreview();
});