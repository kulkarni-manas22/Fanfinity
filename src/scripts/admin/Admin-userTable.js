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