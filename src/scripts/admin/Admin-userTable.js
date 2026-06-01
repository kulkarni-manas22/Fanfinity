//user table on admin dashboard shows table from user-info page dynamically

//async function loadDashboardUsers() {
//
//  const table = document.getElementById("dashboardUserTable");
//  if (!table) return;
//
//  try {
//
//    const response = await fetch("/api/orders"); 
//    const users = await response.json();
//
//    table.innerHTML = "";
//
//    // show only latest 3 users
//    users.slice(0,3).forEach(user => {
//
//      const row = `
//<tr>
//<td>${user.name}</td>
//<td><span>${user.email}</span></td>
//</tr>
//`;
//
//      table.insertAdjacentHTML("beforeend", row);
//
//    });
//
//  } catch (error) {
//
//    console.error("Error loading dashboard users:", error);
//
//  }
//
//}
//users.slice(-3).reverse()
//
//loadDashboardUsers();

// document.addEventListener("DOMContentLoaded", loadAdminUsers);
document.addEventListener("DOMContentLoaded", () => {
  loadAdminUsers();      // full user-info page
  loadDashboardUsers();  // admin dashboard page
});
async function loadAdminUsers() {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;

  try {
    const apiBase =
  window.location.port === "5500"
    ? "http://127.0.0.1:5000"
    : "";

const response = await fetch(`${apiBase}/api/admin/users-summary`, {
  credentials: "include"
});

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load user information");
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="10">No users found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map(user => `
      <tr>
        <td>${escapeHtml(user.user_id ?? "-")}</td>
        <td>${escapeHtml(user.username ?? "-")}</td>
        <td>${escapeHtml(user.email ?? "-")}</td>
        <td>${escapeHtml(user.phone_no || "-")}</td>
        <td>${escapeHtml(user.city || "-")}</td>
        <td>${formatDate(user.joined_on)}</td>
        <td>${escapeHtml(user.total_orders ?? 0)}</td>
        <td>${escapeHtml(user.last_order_id ?? "-")}</td>
        <td>${formatDate(user.last_order_date)}</td>
        <td>${escapeHtml(user.last_order_status ?? "No Orders")}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Error loading admin users:", error);
    tbody.innerHTML = `
      <tr class="error-row">
        <td colspan="10">Failed to load user information.</td>
      </tr>
    `;
  }
}


async function loadDashboardUsers() {
  const tbody = document.getElementById("dashboardUserTable");
  if (!tbody) return;

  try {
    const apiBase =
      window.location.port === "5500"
        ? "http://127.0.0.1:5000"
        : "";

    const response = await fetch(`${apiBase}/api/admin/dashboard-users`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load dashboard users");
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3">No recent user orders found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${escapeHtml(item.email ?? "-")}</td>
        <td><span>${escapeHtml(item.order_id ?? "-")}</span></td>
        <td><span>${escapeHtml(item.order_status ?? "-")}</span></td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Error loading dashboard users:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="3">Failed to load dashboard users.</td>
      </tr>
    `;
  }
}



function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}