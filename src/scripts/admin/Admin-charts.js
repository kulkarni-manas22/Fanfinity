//dynamically fetches data from user-info and product-info tables and gives chart based on percentage of from which category products sold most

//async function loadCategoryStats() {
//
//  const chartElement = document.getElementById("categoryChart");
//  if (!chartElement) return;
//
//  try {
//
//    const response = await fetch("/api/category-stats");
//    const data = await response.json();
//
//    const labels = data.map(item => item.category);
//    const values = data.map(item => item.percent);
//
//    new Chart(chartElement, {
//      type: "pie",
//      data: {
//        labels: labels,
//        datasets: [{
//          data: values
//        }]
//      }
//    });
//
//  } catch (error) {
//
//    console.error("Error loading category stats:", error);
//
//  }
//
//}
//
//loadCategoryStats();