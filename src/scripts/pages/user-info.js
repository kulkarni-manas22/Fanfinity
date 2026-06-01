// Admin user-info page: populate table.

//remove this when user info should dynamically loads
let users = [
  {
    name: "Rahul Sharma",
    date: "12/03/2024",
    email: "rahul@gmail.com",
    phone: "9876543210",
    address: "Mumbai",
    product: "Gaming Mouse",
  },
  {
    name: "Priya Verma",
    date: "18/04/2024",
    email: "priya@gmail.com",
    phone: "9876541111",
    address: "Delhi",
    product: "Keyboard",
  },
];
// till this 

function loadUsers() {
  let table = document.getElementById("userTableBody");
  if (!table) return;

  users.forEach((user) => {
    let row = `
<tr>
<td>${user.name}</td>
<td>${user.date}</td>
<td>${user.email}</td>
<td>${user.phone}</td>
<td>${user.address}</td>
<td>${user.product}</td>
</tr>
`;

    table.innerHTML += row;
  });
}

loadUsers();

// ================================== dynamic user info loads =====================================

//async function loadUsers() {
//
//  let table = document.getElementById("userTableBody");
//  if (!table) return;
//
//  try {
//
//    const response = await fetch("/api/orders");   // backend endpoint
//    const users = await response.json();
//
//    table.innerHTML = "";
//
//    users.forEach((user) => {
//
//      let row = `
//<tr>
//<td>${user.user_id}</td>
//<td>${user.name}</td>
//<td>${user.email}</td>
//<td>${user.phone}</td>
//<td>${user.order_id}</td>
//<td>${user.product_name}</td>
//<td>${user.quantity}</td>
//<td>₹${user.price}</td>
//<td>${user.status}</td>
//</tr>
//`;
//
//      table.innerHTML += row;
//
//    });
//
//  } catch (error) {
//
//    console.error("Error loading admin data:", error);
//
//  }
//
//}
//
//loadUsers();