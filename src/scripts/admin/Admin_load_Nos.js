//loads nos dynamically based on backend

//async function loadStats() {
//
//  try {
//
//    const response = await fetch("/api/stats"); 
//    const data = await response.json();
//
//    document.getElementById("totalUsers").textContent = data.total_users;
//    document.getElementById("totalPosts").textContent = data.total_posts;
//    document.getElementById("totalApprovals").textContent = data.approvals;
//    document.getElementById("totalReturns").textContent = data.returns;
//
//  } catch (error) {
//
//    console.error("Error loading stats:", error);
//
//  }
//
//}
//
//loadStats();

async function loadStats() {
  try {
      const apiBase =
  window.location.port === "5500"
    ? "http://127.0.0.1:5000"
    : "";

const response = await fetch(`${apiBase}/api/stats`, {
  credentials: "include"
});
   

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load stats");
    }

    const totalUsersEl = document.getElementById("totalUsers");
    const totalPostsEl = document.getElementById("totalPosts");
    const totalApprovalsEl = document.getElementById("totalApprovals");
    const totalReturnsEl = document.getElementById("totalReturns");

    if (totalUsersEl) totalUsersEl.textContent = data.total_users ?? 0;
    if (totalPostsEl) totalPostsEl.textContent = data.total_posts ?? 0;
    if (totalApprovalsEl) totalApprovalsEl.textContent = data.approvals ?? 0;
    if (totalReturnsEl) totalReturnsEl.textContent = data.returns ?? 0;

  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadStats);