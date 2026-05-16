const API_BASE = "http://localhost:8787";

interface InvoiceResponse {
  id: string;
  client: string;
  amount: string;
  asset: string;
  paymentUrl: string;
}

const views = document.querySelectorAll<HTMLElement>(".view");
const navItems = document.querySelectorAll<HTMLButtonElement>(".nav-item");

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element as T;
}

function showView(target: string): void {
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

document.querySelectorAll<HTMLButtonElement>("[data-view-link]").forEach((item) => {
  item.addEventListener("click", () => {
    if (item.dataset.viewLink) {
      showView(item.dataset.viewLink);
    }
  });
});

function formatUsd(amount: string): string {
  const numeric = Number.parseFloat(amount || "0");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

async function createInvoice(): Promise<void> {
  const client = getElement<HTMLInputElement>("clientName").value.trim() || "Client";
  const amount = getElement<HTMLInputElement>("invoiceAmount").value.trim() || "0";
  const dueDate = getElement<HTMLInputElement>("dueDate").value.trim() || "2026-06-15";
  const linkBox = getElement<HTMLDivElement>("paymentLink");

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

    const invoice = (await response.json()) as InvoiceResponse;
    linkBox.textContent = invoice.paymentUrl;
  } catch {
    const localId = `ss-${Math.floor(2000 + Math.random() * 8000)}`;
    linkBox.textContent = `https://pay.stellarsettle.dev/i/${localId}`;
  }

  getElement<HTMLElement>("previewAmount").textContent = formatUsd(amount);
}

getElement<HTMLButtonElement>("createInvoice").addEventListener("click", createInvoice);
getElement<HTMLButtonElement>("heroCreate").addEventListener("click", () => showView("invoice"));
