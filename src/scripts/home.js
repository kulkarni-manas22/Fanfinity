// Home page only behavior (safe if elements missing).

// ================= AUTH MODAL OPEN/CLOSE =================
// Home page only behavior (safe if elements missing).

// ================= AUTH SECTION =================
const openAuthBtn = document.getElementById("loginBtn");
const authContainer = document.getElementById("authContainer");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const logoutBtn = document.getElementById("logOutBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z\s]{2,}$/;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

let currentUser = null;

// Central API config
// If page runs on Live Server (5500), API should go to Flask (5000)
// If page runs from Flask (5000), use same-origin API
const API_BASE =
  window.location.port === "5500"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "";

function showError(input, message) {
  const small = input?.nextElementSibling;
  if (small) small.innerText = message;
  if (input) input.style.border = "2px solid red";
}

function showSuccess(input) {
  const small = input?.nextElementSibling;
  if (small) small.innerText = "";
  if (input) input.style.border = "2px solid green";
}

function clearInputState(input) {
  const small = input?.nextElementSibling;
  if (small) small.innerText = "";
  if (input) input.style.border = "";
}

function closeAuthModal() {
  if (authContainer) {
    authContainer.style.display = "none";
    document.body.classList.remove("auth-open");
  }
}

function switchToLogin() {
  if (signupForm) signupForm.classList.remove("active");
  if (loginForm) loginForm.classList.add("active");
}

function switchToSignup() {
  if (loginForm) loginForm.classList.remove("active");
  if (signupForm) signupForm.classList.add("active");
}

function resetAuthForms() {
  [loginEmail, loginPassword, signupName, signupEmail, signupPassword, confirmPassword]
    .forEach((input) => clearInputState(input));

  if (loginEmail) loginEmail.value = "";
  if (loginPassword) loginPassword.value = "";
  if (signupName) signupName.value = "";
  if (signupEmail) signupEmail.value = "";
  if (signupPassword) signupPassword.value = "";
  if (confirmPassword) confirmPassword.value = "";
}

function updateAuthUI(user) {
  currentUser = user || null;

  if (openAuthBtn) {
    openAuthBtn.textContent = currentUser ? currentUser.username : "Login";
  }

  if (logoutBtn) {
    logoutBtn.style.display = currentUser ? "block" : "none";
  }
}

async function fetchCurrentUser() {
  try {
    const response = await fetch(`${API_BASE}/api/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      updateAuthUI(null);
      return;
    }

    const user = await response.json();
    updateAuthUI(user);
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    updateAuthUI(null);
  }
}

if (openAuthBtn && authContainer) {
  openAuthBtn.addEventListener("click", function () {
    if (currentUser) {
      window.location.href = "profile.html";
      return;
    }
    authContainer.style.display = "flex";
    document.body.classList.add("auth-open");
  });
}

if (showSignup) {
  showSignup.addEventListener("click", function (e) {
    e.preventDefault();
    switchToSignup();
  });
}

if (showLogin) {
  showLogin.addEventListener("click", function (e) {
    e.preventDefault();
    switchToLogin();
  });
}

if (authContainer) {
  window.addEventListener("click", function (e) {
    if (e.target === authContainer) {
      closeAuthModal();
    }
  });
}

if (loginSubmitBtn && loginEmail && loginPassword) {
  loginSubmitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    let valid = true;

    if (!emailPattern.test(loginEmail.value.trim())) {
      showError(loginEmail, "Enter valid email");
      valid = false;
    } else {
      showSuccess(loginEmail);
    }

    if (loginPassword.value.trim().length < 6) {
      showError(loginPassword, "Minimum 6 characters");
      valid = false;
    } else {
      showSuccess(loginPassword);
    }

    if (!valid) return;

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail.value.trim(),
          password: loginPassword.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }
// 🔴 ADMIN LOGIN → go to admin panel
if (data.redirect === "admin") {
   window.location.href = window.location.origin + "/Admin/Admin.html";
  return;
}

// 🟢 NORMAL USER → keep existing behavior
updateAuthUI(data.user);
closeAuthModal();
resetAuthForms();
alert("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong while logging in");
    }
  });
}

if (
  signupSubmitBtn &&
  signupName &&
  signupEmail &&
  signupPassword &&
  confirmPassword
) {
  signupSubmitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    let valid = true;

    if (!namePattern.test(signupName.value.trim())) {
      showError(signupName, "Enter valid name");
      valid = false;
    } else {
      showSuccess(signupName);
    }

    if (!emailPattern.test(signupEmail.value.trim())) {
      showError(signupEmail, "Enter valid email");
      valid = false;
    } else {
      showSuccess(signupEmail);
    }

    if (!strongPassword.test(signupPassword.value)) {
      showError(signupPassword, "Min 8 chars, 1 uppercase, 1 number");
      valid = false;
    } else {
      showSuccess(signupPassword);
    }

    if (confirmPassword.value !== signupPassword.value) {
      showError(confirmPassword, "Passwords do not match");
      valid = false;
    } else {
      showSuccess(confirmPassword);
    }

    if (!valid) return;

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: signupName.value.trim(),
          email: signupEmail.value.trim(),
          password: signupPassword.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      updateAuthUI(data.user);
      closeAuthModal();
      resetAuthForms();
      switchToLogin();
      alert("Account created successfully");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong while creating account");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async function () {
    try {
      const response = await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Logout failed");
        return;
      }

      updateAuthUI(null);
      alert("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong while logging out");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  updateAuthUI(null);
  fetchCurrentUser();
});

// ================= CATEGORY WHEEL (HOME) =================
// var NAMES = {
//   anime: "Anime",
//   movies: "Movies",
//   games: "Games",
//   music: "Music",
// };

// window.goTo = function goTo(key) {
//   if (typeof window.showToast === "function") {
//     window.showToast("Opening " + NAMES[key] + " ...");
//   }

//   setTimeout(() => {
//     window.location.href = key + ".html";
//   }, 500);
// };

// const btn = document.getElementById("exploreBtn");
// const wheel = document.getElementById("categoryWheel");

// if (btn && wheel) {
//   btn.addEventListener("click", () => {
//     wheel.style.display = "block";
//   });

//   wheel.addEventListener("click", (e) => {
//     if (e.target.id === "categoryWheel") {
//       wheel.style.display = "none";
//     }
//   });
// }
// const openAuthBtn = document.getElementById("loginBtn");
// const authContainer = document.getElementById("authContainer");
// const showSignup = document.getElementById("showSignup");
// const showLogin = document.getElementById("showLogin");
// const loginForm = document.querySelector(".login-form");
// const signupForm = document.querySelector(".signup-form");

// if (openAuthBtn && authContainer) {
//   openAuthBtn.onclick = () => {
//     authContainer.style.display = "flex";
//   };
// }

// if (showSignup && loginForm && signupForm) {
//   showSignup.onclick = () => {
//     loginForm.classList.remove("active");
//     signupForm.classList.add("active");
//   };
// }

// if (showLogin && loginForm && signupForm) {
//   showLogin.onclick = () => {
//     signupForm.classList.remove("active");
//     loginForm.classList.add("active");
//   };
// }

// if (authContainer) {
//   window.addEventListener("click", function (e) {
//     if (e.target === authContainer) {
//       authContainer.style.display = "none";
//     }
//   });
// }

// // ================= VALIDATION SECTION =================
// const loginEmail = document.getElementById("loginEmail");
// const loginPassword = document.getElementById("loginPassword");
// const loginSubmitBtn = document.getElementById("loginSubmitBtn");

// const signupName = document.getElementById("signupName");
// const signupEmail = document.getElementById("signupEmail");
// const signupPassword = document.getElementById("signupPassword");
// const confirmPassword = document.getElementById("confirmPassword");
// const signupSubmitBtn = document.getElementById("signupSubmitBtn");

// const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const namePattern = /^[A-Za-z\s]{2,}$/;
// const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// function showError(input, message) {
//   const small = input?.nextElementSibling;
//   if (small) small.innerText = message;
//   if (input) input.style.border = "2px solid red";
// }

// function showSuccess(input) {
//   const small = input?.nextElementSibling;
//   if (small) small.innerText = "";
//   if (input) input.style.border = "2px solid green";
// }

// if (loginSubmitBtn && loginEmail && loginPassword) {
//   loginSubmitBtn.addEventListener("click", function (e) {
//     e.preventDefault();

//     let valid = true;

//     if (!emailPattern.test(loginEmail.value.trim())) {
//       showError(loginEmail, "Enter valid email");
//       valid = false;
//     } else {
//       showSuccess(loginEmail);
//     }

//     if (loginPassword.value.trim().length < 6) {
//       showError(loginPassword, "Minimum 6 characters");
//       valid = false;
//     } else {
//       showSuccess(loginPassword);
//     }

//     if (valid) {
//       alert("Login successful (frontend only)");
//     }
//   });
// }

// if (
//   signupSubmitBtn &&
//   signupName &&
//   signupEmail &&
//   signupPassword &&
//   confirmPassword
// ) {
//   signupSubmitBtn.addEventListener("click", function (e) {
//     e.preventDefault();

//     let valid = true;

//     if (!namePattern.test(signupName.value.trim())) {
//       showError(signupName, "Enter valid name");
//       valid = false;
//     } else {
//       showSuccess(signupName);
//     }

//     if (!emailPattern.test(signupEmail.value.trim())) {
//       showError(signupEmail, "Enter valid email");
//       valid = false;
//     } else {
//       showSuccess(signupEmail);
//     }

//     if (!strongPassword.test(signupPassword.value)) {
//       showError(signupPassword, "Min 8 chars, 1 uppercase, 1 number");
//       valid = false;
//     } else {
//       showSuccess(signupPassword);
//     }

//     if (confirmPassword.value !== signupPassword.value) {
//       showError(confirmPassword, "Passwords do not match");
//       valid = false;
//     } else {
//       showSuccess(confirmPassword);
//     }

//     if (valid) {
//       alert("Signup successful (frontend only)");
//     }
//   });
// }











// ================= CATEGORY WHEEL (HOME) =================
var NAMES = {
  anime: "Anime",
  movies: "Movies",
  games: "Games",
  music: "Music",
};

window.goTo = function goTo(key) {
  if (typeof window.showToast === "function") {
    window.showToast("Opening " + NAMES[key] + " ...");
  }

  setTimeout(() => {
    window.location.href = key + ".html";
  }, 500);
};

const btn = document.getElementById("exploreBtn");
const wheel = document.getElementById("categoryWheel");

if (btn && wheel) {
  btn.addEventListener("click", () => {
    wheel.style.display = "block";
  });

  wheel.addEventListener("click", (e) => {
    if (e.target.id === "categoryWheel") {
      wheel.style.display = "none";
    }
  });
}



