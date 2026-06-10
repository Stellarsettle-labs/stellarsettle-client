"use strict";
const API_BASE = "http://localhost:8787";
// Initial Mock State to match screenshot UI
let invoices = [
    {
        id: "ss-2048",
        client: "Agency 1 Agency",
        amount: "1240.00",
        asset: "USDC",
        dueDate: "2026-06-15",
        memo: "SETTLE-SS-2048",
        status: "paid",
        paymentUrl: "https://pay.stellarsettle.dev/i/ss-2048"
    },
    {
        id: "ss-2047",
        client: "Blue Finch Media",
        amount: "680.00",
        asset: "USDC",
        dueDate: "2026-06-12",
        memo: "SETTLE-SS-2047",
        status: "pending",
        paymentUrl: "https://pay.stellarsettle.dev/i/ss-2047"
    },
    {
        id: "ss-2046",
        client: "Atlas Studio",
        amount: "310.00",
        asset: "USDC",
        dueDate: "2026-06-10",
        memo: "SETTLE-SS-2046",
        status: "review",
        paymentUrl: "https://pay.stellarsettle.dev/i/ss-2046"
    }
];
// Baseline stats from screenshot mockup
let mockupDraftSum = 23432123;
let mockupDraftCount = 123;
let mockupDueSum = 432123;
let mockupDueCount = 12;
// Elements
const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
const topbarBreadcrumb = document.getElementById("topbarBreadcrumb");
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: ${id}`);
    }
    return element;
}
// Format Helper
function formatUsd(amount) {
    const numeric = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number.isFinite(numeric) ? numeric : 0);
}
// Navigation & Breadcrumbs
const breadcrumbIcons = {
    dashboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>',
    invoice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>',
    settlement: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>',
    addresses: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="12" y1="10" x2="12" y2="10.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="16" y1="12" x2="20" y2="12" /></svg>',
    api: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>'
};
const breadcrumbTitles = {
    dashboard: "Overview",
    invoice: "Invoices",
    settlement: "Settlements",
    addresses: "Addresses",
    api: "Developers"
};
function showView(target) {
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === target));
    views.forEach((view) => view.classList.toggle("active", view.id === target));
    // Update Topbar Breadcrumb
    const title = breadcrumbTitles[target] || "Overview";
    const icon = breadcrumbIcons[target] || breadcrumbIcons.dashboard;
    topbarBreadcrumb.innerHTML = `${icon} <span>${title}</span>`;
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
// Render Invoices lists dynamically
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case "paid": return "status-badge paid";
        case "pending": return "status-badge pending";
        case "draft": return "status-badge draft";
        default: return "status-badge review";
    }
}
function renderInvoicesTable(filteredInvoices) {
    const overviewBody = getElement("overviewInvoiceTableBody");
    const invoiceViewBody = getElement("invoicesTableBody");
    // Clear existing
    overviewBody.innerHTML = "";
    invoiceViewBody.innerHTML = "";
    filteredInvoices.forEach((inv, index) => {
        const numStr = (index + 1).toString().padStart(2, "0");
        const avatarChar = inv.client.charAt(0).toUpperCase();
        // 1. Overview Page Table Row
        const trOverview = document.createElement("tr");
        trOverview.innerHTML = `
      <td>${numStr}</td>
      <td class="row-title">${inv.client}</td>
      <td><code>${inv.memo}</code></td>
      <td><span class="${getStatusBadgeClass(inv.status)}">${inv.status}</span></td>
      <td>${inv.amount} USDC</td>
      <td class="row-title">${formatUsd(inv.amount)}</td>
    `;
        overviewBody.appendChild(trOverview);
        // 2. Invoices View Table Row (Mockup Style)
        const trInvoice = document.createElement("tr");
        trInvoice.innerHTML = `
      <td class="row-title">${inv.client}</td>
      <td><code>${inv.id.toUpperCase()}</code></td>
      <td>
        <div class="customer-cell">
          <div class="avatar">${avatarChar}</div>
          <span>${inv.client}</span>
        </div>
      </td>
      <td><span class="${getStatusBadgeClass(inv.status)}">${inv.status}</span></td>
      <td class="row-title">${formatUsd(inv.amount)}</td>
    `;
        invoiceViewBody.appendChild(trInvoice);
    });
    // Update Sidebar & UI counts
    const pendingCount = invoices.filter(i => i.status === "pending").length;
    const paidCount = invoices.filter(i => i.status === "paid").length;
    getElement("sidebarInvoiceCount").textContent = invoices.length.toString();
    getElement("sidebarSettlementCount").textContent = paidCount.toString();
}
function updateMetrics() {
    // Compute totals
    const totalSettled = invoices
        .filter(i => i.status === "paid")
        .reduce((sum, current) => sum + Number.parseFloat(current.amount), 38940.2);
    const totalPending = invoices
        .filter(i => i.status === "pending" || i.status === "review")
        .reduce((sum, current) => sum + Number.parseFloat(current.amount), 2208.78);
    // Set values on Overview Page
    getElement("cumulativeSettledVal").textContent = formatUsd(totalSettled);
    getElement("pendingInvoicesVal").textContent = formatUsd(totalPending);
    // Set mockup-identical cards values in Invoices view
    const addedDueAmount = invoices
        .filter(i => i.status === "pending")
        .reduce((sum, current) => sum + Number.parseFloat(current.amount), 0);
    const addedDueCount = invoices.filter(i => i.status === "pending").length;
    getElement("invoicesDraftSum").textContent = formatUsd(mockupDraftSum);
    getElement("invoicesDraftCount").textContent = `${mockupDraftCount} invoices`;
    getElement("invoicesDueSum").textContent = formatUsd(mockupDueSum + addedDueAmount);
    getElement("invoicesDueCount").textContent = `${mockupDueCount + addedDueCount} invoices`;
}
// Sync state on load from API
async function loadInvoicesFromApi() {
    try {
        const res = await fetch(`${API_BASE}/invoices`);
        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.invoices) && data.invoices.length > 0) {
                // Merge with existing mocks to present a complete workspace
                const apiInvoices = data.invoices.map(i => ({
                    id: i.id,
                    client: i.client,
                    amount: i.amount,
                    asset: i.asset || "USDC",
                    dueDate: i.dueDate || "2026-06-15",
                    memo: i.memo || `SETTLE-${i.id.toUpperCase()}`,
                    status: i.status || "pending",
                    paymentUrl: i.paymentUrl
                }));
                // Filter out duplicates
                const apiIds = new Set(apiInvoices.map(i => i.id));
                const cleanMocks = invoices.filter(i => !apiIds.has(i.id));
                invoices = [...apiInvoices, ...cleanMocks];
            }
        }
    }
    catch {
        console.log("StellarSettle API offline. Using local storage seed state.");
    }
    renderInvoicesTable(invoices);
    updateMetrics();
}
// Modal handling
const invoiceModal = getElement("invoiceModal");
function openModal() {
    invoiceModal.classList.add("active");
    updateCheckoutPreview();
}
function closeModal() {
    invoiceModal.classList.remove("active");
}
// Form inputs live preview update
const clientInput = getElement("clientName");
const amountInput = getElement("invoiceAmount");
const dueDateInput = getElement("dueDate");
function updateCheckoutPreview() {
    const clientName = clientInput.value.trim() || "Kora Design Studio";
    const amount = amountInput.value.trim() || "0.00";
    const dateVal = dueDateInput.value.trim() || "2026-06-15";
    getElement("previewClient").textContent = clientName;
    getElement("previewAmount").textContent = formatUsd(amount);
    getElement("previewDueDate").textContent = dateVal;
}
clientInput.addEventListener("input", updateCheckoutPreview);
amountInput.addEventListener("input", updateCheckoutPreview);
dueDateInput.addEventListener("input", updateCheckoutPreview);
// Modal triggers
getElement("globalNewInvoiceBtn").addEventListener("click", openModal);
getElement("invoicesViewCreateBtn").addEventListener("click", openModal);
getElement("heroCreate").addEventListener("click", openModal);
getElement("invoiceModalClose").addEventListener("click", closeModal);
invoiceModal.addEventListener("click", (e) => {
    if (e.target === invoiceModal) {
        closeModal();
    }
});
// Create Invoice Submit
async function createInvoiceSubmit() {
    const client = clientInput.value.trim() || "Client";
    const amount = amountInput.value.trim() || "0";
    const dueDate = dueDateInput.value.trim() || "2026-06-15";
    const linkBox = getElement("paymentLink");
    linkBox.textContent = "Generating Stellar USDC payment rail...";
    let newInv;
    try {
        const response = await fetch(`${API_BASE}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client, amount, dueDate, asset: "USDC" })
        });
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        const data = (await response.json());
        newInv = {
            id: data.id,
            client: data.client,
            amount: data.amount,
            asset: data.asset,
            dueDate: data.dueDate || dueDate,
            memo: data.memo || `SETTLE-${data.id.toUpperCase()}`,
            status: "pending",
            paymentUrl: data.paymentUrl
        };
    }
    catch {
        // Client-side fallback if server is offline
        const localId = `ss-${Math.floor(2000 + Math.random() * 8000)}`;
        newInv = {
            id: localId,
            client,
            amount,
            asset: "USDC",
            dueDate,
            memo: `SETTLE-${localId.toUpperCase()}`,
            status: "pending",
            paymentUrl: `https://pay.stellarsettle.dev/i/${localId}`
        };
    }
    // Prepend to start of local invoices state
    invoices = [newInv, ...invoices];
    linkBox.textContent = newInv.paymentUrl;
    // Refresh UI
    renderInvoicesTable(invoices);
    updateMetrics();
    updateCheckoutPreview();
}
getElement("createInvoice").addEventListener("click", createInvoiceSubmit);
// Copy actions
function handleCopyText(text, buttonElement, successText = "Copied!") {
    const originalText = buttonElement.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
        buttonElement.textContent = successText;
        buttonElement.classList.add("copied");
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove("copied");
        }, 1200);
    }).catch(err => {
        console.error("Clipboard copy failed: ", err);
    });
}
// Copy Code Snippet
const apiCopySnippetBtn = getElement("apiCopySnippetBtn");
apiCopySnippetBtn.addEventListener("click", () => {
    const snippet = getElement("apiCodeSnippet").textContent || "";
    handleCopyText(snippet, apiCopySnippetBtn);
});
// Copy Wallet Addresses
document.querySelectorAll("[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.copyTarget;
        if (targetId) {
            const addressText = getElement(targetId).textContent || "";
            handleCopyText(addressText, btn, "Done!");
        }
    });
});
// Search functionality
const globalSearch = getElement("globalSearch");
const invoiceSearchInput = getElement("invoiceSearchInput");
function handleSearch(query) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
        renderInvoicesTable(invoices);
        return;
    }
    const filtered = invoices.filter((inv) => inv.client.toLowerCase().includes(trimmed) ||
        inv.memo.toLowerCase().includes(trimmed) ||
        inv.id.toLowerCase().includes(trimmed));
    renderInvoicesTable(filtered);
}
globalSearch.addEventListener("input", (e) => {
    const val = e.target.value;
    // Redirect to Invoices view to show results in details
    showView("invoice");
    invoiceSearchInput.value = val;
    handleSearch(val);
});
invoiceSearchInput.addEventListener("input", (e) => {
    const val = e.target.value;
    handleSearch(val);
});
// Keyboard Shortcut ⌘K / Ctrl+K focus search
window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        globalSearch.focus();
    }
});
// Init
loadInvoicesFromApi();
showView("dashboard");
updateCheckoutPreview();
