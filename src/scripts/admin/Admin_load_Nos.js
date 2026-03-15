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