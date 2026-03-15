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
        function openProfileModal() {
            document.getElementById("profileModal").style.display = "block";
        }

        function closeProfileModal() {
            document.getElementById("profileModal").style.display = "none";
        }

        // Close when clicking outside
        window.onclick = function(event) {
            let modal = document.getElementById("profileModal");
            if (event.target == modal) {
                modal.style.display = "none";
            }   
        }