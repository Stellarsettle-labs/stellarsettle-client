const API_BASE = "http://localhost:8787";
const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: ${id}`);
    }
    return element;
}
function showView(target) {
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === target));
    views.forEach((view) => view.classList.toggle("active", view.id === target));
}
navItems.forEach((item) => {
    item.addEventListener("click", () => {
        if (item.dataset.view) {
            showView(item.dataset.view);
        }
    });
});
document.querySelectorAll("[data-view-link]").forEach((item) => {
    item.addEventListener("click", () => {
        if (item.dataset.viewLink) {
            showView(item.dataset.viewLink);
        }
    });
});
function formatUsd(amount) {
    const numeric = Number.parseFloat(amount || "0");
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number.isFinite(numeric) ? numeric : 0);
}
async function createInvoice() {
    const client = getElement("clientName").value.trim() || "Client";
    const amount = getElement("invoiceAmount").value.trim() || "0";
    const dueDate = getElement("dueDate").value.trim() || "2026-06-15";
    const linkBox = getElement("paymentLink");
    linkBox.textContent = "Generating Stellar USDC payment link...";
    try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 900);
        const response = await fetch(`${API_BASE}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                client,
                amount,
                dueDate,
                asset: "USDC"
            })
        });
        window.clearTimeout(timeout);
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        const invoice = (await response.json());
        linkBox.textContent = invoice.paymentUrl;
    }
    catch {
        const localId = `ss-${Math.floor(2000 + Math.random() * 8000)}`;
        linkBox.textContent = `https://pay.stellarsettle.dev/i/${localId}`;
    }
    getElement("previewAmount").textContent = formatUsd(amount);
}
getElement("createInvoice").addEventListener("click", createInvoice);
getElement("heroCreate").addEventListener("click", () => showView("invoice"));
