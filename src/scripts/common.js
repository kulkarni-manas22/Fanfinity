// Shared UI helpers used across pages.
// Everything is defensive so pages can include this safely.

(function () {
  function $(id) {
    return document.getElementById(id);
  }
  
//========================= menu panel ================================
  // Expose as globals because some pages use onclick="openMenu()"
  window.openMenu = function openMenu() {
    const sideMenu = $("sideMenu");
    const overlay = $("menuOverlay");
    if (sideMenu) sideMenu.classList.add("active");
    if (overlay) overlay.classList.add("active");
  };

  window.closeMenu = function closeMenu() {
    const sideMenu = $("sideMenu");
    const overlay = $("menuOverlay");
    if (sideMenu) sideMenu.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  };

//======================== toast wheel ============================
  let toastTimer;
  window.showToast = function showToast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  };

//======================= back-to-top =============================
  function attachBackToTop() {
    // Your project uses ids like B1, B1-category4, B1-category7, etc.
    const backToTopButtons = document.querySelectorAll('[id^="B1"]');
    backToTopButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

//=================== navigation accross pages ===========================
  function attachSelectNavigation() {
    // Supports your existing selects:
    // - id="subcategory" (Movies/Series pages)
    // - id="categorySelect" (Music → Kpop/Pop)
    const selects = [];
    const sub = $("subcategory");
    const cat = $("categorySelect");
    if (sub) selects.push(sub);
    if (cat) selects.push(cat);

    selects.forEach((sel) => {
      // Avoid double-binding if script included twice.
      if (sel.dataset.bound === "true") return;
      sel.dataset.bound = "true";

      sel.addEventListener("change", function () {
        const selectedPage = this.value;
        if (!selectedPage) return;

        document.body.classList.add("fade");

        const delayAttr = Number(this.dataset.delayMs);
        const delayMs = Number.isFinite(delayAttr) ? delayAttr : 300;

        setTimeout(() => {
          window.location.href = selectedPage;
        }, delayMs);
      });
    });
  }

//========================== fade in and fade out ===================================
  function attachPageFade() {
    // Some pages already have CSS for fade-in/fade-out; harmless elsewhere.
    document.body.classList.add("fade-in");

    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function (e) {
        const target = this.getAttribute("href");
        if (!target || target.startsWith("#")) return;

        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = target;
        }, 400);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    attachBackToTop();
    attachPageFade();
    attachSelectNavigation();
  });
})();

//==================== profile form open =======================
//profile edit form
        // function openProfileModal() {
        //     document.getElementById("profileModal").style.display = "block";
        // }
//         function openProfileModal(mode = "profile") {
//     const modal = document.getElementById("profileModal");
//     modal.style.display = "block";

//     const usernameSection = document.getElementById("usernameSection");
//     const contactSection = document.getElementById("contactSection");
//     const contactHeading = document.getElementById("contactHeading");

//     if (mode === "address") {
//         usernameSection.style.display = "none";
//         contactSection.style.display = "none";
//         contactHeading.style.display = "none";
//     } else {
//         usernameSection.style.display = "block";
//         contactSection.style.display = "block";
//         contactHeading.style.display = "block";
//     }

//     // store mode globally
//     window.profileEditMode = mode;
// }

//         function openProfileModal(mode = "profile") {
//     const modal = document.getElementById("profileModal");
//     const accountSection = document.getElementById("accountSection");
//     const addressSection = document.getElementById("addressSection");

//     modal.style.display = "block";
//     window.profileEditMode = mode;

//     if (mode === "profile") {
//         accountSection.style.display = "block";
//         addressSection.style.display = "none";
//     } else {
//         accountSection.style.display = "none";
//         addressSection.style.display = "block";
//     }
// }

      function openProfileModal(mode = "profile") {
    const modal = document.getElementById("profileModal");
    const accountSection = document.getElementById("accountSection");
    const addressSection = document.getElementById("addressSection");
    const modalTitle = document.getElementById("profileModalTitle");

    modal.style.display = "block";
    window.profileEditMode = mode;

    if (mode === "profile") {
        accountSection.style.display = "block";
        addressSection.style.display = "none";
        if (modalTitle) modalTitle.textContent = "Edit Profile";
    } else {
        accountSection.style.display = "none";
        addressSection.style.display = "block";
        if (modalTitle) modalTitle.textContent = "Edit Address";
    }
}

        // function closeProfileModal() {
        //     document.getElementById("profileModal").style.display = "none";
        // }

        function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    modal.style.display = "none";

    if (typeof window.resetSecurityFields === "function") {
        window.resetSecurityFields();
    }
}

        // Close when clicking outside
        window.addEventListener("click", function(event) {
    const modal = document.getElementById("profileModal");
    if (event.target === modal) {
        closeProfileModal();
    }
});

// ==================== AUTH GUARD HELPERS ====================
(function () {
  // Works for both:
  // - Live Server on 5500
  // - Flask on 5000
  window.API_BASE =
    window.location.port === "5500"
      ? `${window.location.protocol}//${window.location.hostname}:5000`
      : "";

  window.currentLoggedInUser = null;
  window.fetchLoggedInUser = async function fetchLoggedInUser() {
    try {
      const response = await fetch(`${window.API_BASE}/api/me`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        window.currentLoggedInUser = null;
        return null;
      }

      const user = await response.json();

      // If admin → do NOT treat as normal user
      if (user.role === "admin") {
        window.location.href = window.location.origin + "/Admin/Admin.html";
        return null;
      }

      // Normal user
      window.currentLoggedInUser = user;
      return user;

    } catch (error) {
      console.error("Failed to fetch logged-in user:", error);
      window.currentLoggedInUser = null;
      return null;
    }
  };
//   window.fetchLoggedInUser = async function fetchLoggedInUser() {
//     try {
//       const response = await fetch(`${window.API_BASE}/api/me`, {
//         method: "GET",
//         credentials: "include"
//       });

//       if (!response.ok) {
//         window.currentLoggedInUser = null;
//         return null;
//       }

//       // 🔴 If admin → do NOT store as normal user
//     if (user.logged_in && user.user.role === "admin") {
//       window.location.href = window.location.origin + "/Admin/Admin.html";
//     return null;
//     }

// // 🟢 Normal user
// window.currentLoggedInUser = user;
// return user;
//     } catch (error) {
//       console.error("Failed to fetch logged-in user:", error);
//       window.currentLoggedInUser = null;
//       return null;
//     }
//   };

  window.isUserLoggedIn = function isUserLoggedIn() {
    return !!window.currentLoggedInUser;
  };

  window.requireLogin = async function requireLogin(message = "Login/Signup first to continue") {
    if (window.currentLoggedInUser) {
      return true;
    }

    const user = await window.fetchLoggedInUser();
    if (user) {
      return true;
    }

    alert(message);

    const authContainer = document.getElementById("authContainer");
    if (authContainer) {
      authContainer.style.display = "flex";
    }

    return false;
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.fetchLoggedInUser();
  });
})();