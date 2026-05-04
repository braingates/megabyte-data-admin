

const API = "https://data-bundle-backend.onrender.com/api/admin";
const API_KEY = "mbst_live_af6cb47f94e726ac3e381275";

let currentPage = 1;

// ==========================
// STATUS BADGE
// ==========================
function getStatusClass(status) {
  if (status === "success") return "green";
  if (status === "failed") return "red";
  if (status === "pending") return "yellow";
  if (status === "processing") return "orange";
    if (status === "completed") return "green";
  return "gray";
}

// ==========================
// LOAD ORDERS
// ==========================
async function loadOrders() {
  try {
    const search = document.getElementById("searchInput")?.value || "";
    const network = document.getElementById("networkFilter")?.value || "all";
    const status = document.getElementById("statusFilter")?.value || "all";

    const url = new URL(`${API}/orders`);
    url.searchParams.append("page", currentPage);

    if (search) url.searchParams.append("search", search);
    if (network !== "all") url.searchParams.append("network", network);
    if (status !== "all") url.searchParams.append("status", status);

    const res = await fetch(url, {
      headers: {
        "x-api-key": API_KEY
      }
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    const orders = data.orders || [];

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!orders.length) {
      tbody.innerHTML = "<tr><td colspan='8'>No orders found</td></tr>";
      return;
    }

    orders.forEach(order => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${order.reference}</td>
        <td>${order.network}</td>
        <td>${order.bundle}</td>
        <td>${order.phone}</td>
        <td>GHS ${order.amount}</td>
        <td>${order.paymentStatus}</td>
        <td class="${getStatusClass(order.vendorStatus)}">
          ${order.vendorStatus}
        </td>
        <td class = "${getStatusClass(order.orderStatus)}">${order.orderStatus}</td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Orders error:", err.message);
  }
}

// ==========================
// LOAD STATS
// ==========================
async function loadStats() {
  try {
    const res = await fetch(`${API}/stats`, {
      headers: {
        "x-api-key": API_KEY
      }
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    document.getElementById("total").innerText = data.total || 0;
    document.getElementById("success").innerText = data.success || 0;
    document.getElementById("revenue").innerText = data.revenue || 0;

  } catch (err) {
    console.error("Stats error:", err.message);
  }
}

// ==========================
// DEBOUNCE
// ==========================
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ==========================
// EVENTS
// ==========================
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  loadOrders();
  loadStats();
});

document.getElementById("searchInput")?.addEventListener(
  "input",
  debounce(loadOrders, 500)
);

document.getElementById("networkFilter")?.addEventListener("change", loadOrders);
document.getElementById("statusFilter")?.addEventListener("change", loadOrders);

// ==========================
// AUTO REFRESH
// ==========================
setInterval(() => {
  loadOrders();
  loadStats();
}, 15000);

// ==========================
// INIT
// ==========================
loadOrders();
loadStats();