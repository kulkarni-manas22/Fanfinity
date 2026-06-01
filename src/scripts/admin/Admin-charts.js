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


// document.addEventListener("DOMContentLoaded", loadCategoryStats);

// function getApiBase() {
//   return window.location.port === "5500"
//     ? "http://127.0.0.1:5000"
//     : "";
// }

// let dashboardCategoryChart = null;

// async function loadCategoryStats() {
//   const chartElement = document.getElementById("categoryChart");
//   if (!chartElement) return;

//   try {
//     const apiBase = getApiBase();
//     const response = await fetch(`${apiBase}/api/category-stats`, {
//       credentials: "include"
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || "Failed to load category stats");
//     }

//     const labels = data.map(item => item.category);
//     const values = data.map(item => item.percent);

//     if (dashboardCategoryChart) {
//       dashboardCategoryChart.destroy();
//     }

//     const ctx = chartElement.getContext("2d");
//     ctx.clearRect(0, 0, chartElement.width, chartElement.height);


//     dashboardCategoryChart = new Chart(chartElement, {
//       type: "pie",
//       data: {
//         labels,
//         datasets: [{
//           data: values,
//           backgroundColor: [
//             "#ff7a1a",
//             "#ff944d",
//             "#ffb84d",
//             "#ffe066",
//             "#ff8f66",
//             "#ffc999"
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: {
//             position: "bottom"
//           }
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Error loading category stats:", error);
//   }
// }


document.addEventListener("DOMContentLoaded", loadCategoryStats);

function getApiBase() {
  return window.location.port === "5500"
    ? "http://127.0.0.1:5000"
    : "";
}

async function loadCategoryStats() {
  const oldCanvas = document.getElementById("categoryChart");
  if (!oldCanvas) return;

  try {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/category-stats`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load category stats");
    }

    const labels = data.map(item => item.category);
    const values = data.map(item => item.percent);

    // destroy old chart if any
    const existingChart = Chart.getChart(oldCanvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // replace canvas completely to remove ghost drawing
    const newCanvas = oldCanvas.cloneNode(false);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    const ctx = newCanvas.getContext("2d");

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            "#ff7a1a",
            "#ff944d",
            "#ffb84d",
            "#ffe066",
            "#ff8f66",
            "#ffc999"
          ],
          borderColor: "#fff7e6",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

  } catch (error) {
    console.error("Error loading category stats:", error);
  }
}