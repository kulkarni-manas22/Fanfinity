// Home page only behavior (safe if elements missing).

// ================= AUTH MODAL OPEN/CLOSE =================
const openAuthBtn = document.getElementById("loginBtn");
const authContainer = document.getElementById("authContainer");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");

if (openAuthBtn && authContainer) {
  openAuthBtn.onclick = () => {
    authContainer.style.display = "flex";
  };
}

if (showSignup && loginForm && signupForm) {
  showSignup.onclick = () => {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
  };
}

if (showLogin && loginForm && signupForm) {
  showLogin.onclick = () => {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");
  };
}

if (authContainer) {
  window.addEventListener("click", function (e) {
    if (e.target === authContainer) {
      authContainer.style.display = "none";
    }
  });
}

// ================= VALIDATION SECTION =================
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

if (loginSubmitBtn && loginEmail && loginPassword) {
  loginSubmitBtn.addEventListener("click", function (e) {
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

    if (valid) {
      alert("Login successful (frontend only)");
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
  signupSubmitBtn.addEventListener("click", function (e) {
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

    if (valid) {
      alert("Signup successful (frontend only)");
    }
  });
}

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



