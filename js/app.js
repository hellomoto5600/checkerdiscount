// Cloudflare D1 Worker API Link for CheckerDiscount
const API_URL = "https://checkerdiscount-api.hamraahirn32.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});

// Fetch products directly from Cloudflare D1 Database via Worker API
async function fetchDiscounts() {
    const container = document.getElementById("discounts-container");
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/api/discounts`);
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        
        const data = await response.json();
        const productsList = data.discounts || data.products || (Array.isArray(data) ? data : []);
        
        if (productsList && productsList.length > 0) {
            renderDiscounts(productsList);
        } else {
            container.innerHTML = `<p class="no-data">No products found in the database currently.</p>`;
        }
    } catch (error) {
        console.error("Error loading products:", error);
        container.innerHTML = `<p class="error">Unable to fetch products. Please ensure API Worker has D1 Database bindings configured.</p>`;
    }
}

// Render dynamic product card components on UI
function renderDiscounts(products) {
    const container = document.getElementById("discounts-container");
    container.innerHTML = "";

    products.forEach(item => {
        const card = document.createElement("div");
        card.className = "discount-card";

        const title = item.title || item.product_title || "Verified Product";
        const store = item.store_name || "Online Store";
        const price = item.current_price ? parseFloat(item.current_price).toFixed(2) : "0.00";
        const origPrice = item.original_price ? parseFloat(item.original_price).toFixed(2) : null;
        const currency = item.currency || "USD";

        card.innerHTML = `
            <div class="card-header">
                <span class="store-badge">${escapeHtml(store)}</span>
                ${origPrice ? `<span class="discount-badge">DEAL</span>` : ''}
            </div>
            <h3>${escapeHtml(title)}</h3>
            <div class="price-container">
                <span class="current-price">$${price} ${escapeHtml(currency)}</span>
                ${origPrice ? `<span class="original-price">$${origPrice}</span>` : ''}
            </div>
            <a href="${escapeHtml(item.deal_url || '#')}" target="_blank" rel="noopener noreferrer" class="btn-claim">View Details</a>
        `;
        container.appendChild(card);
    });
}

// Handle Track Price Drop Refund Form Submission
function setupRefundForm() {
    const form = document.getElementById("refund-form");
    const resultDiv = document.getElementById("refund-result");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const storeName = document.getElementById("store-name").value;
        const purchasePrice = parseFloat(document.getElementById("purchase-price").value);
        const currentPrice = parseFloat(document.getElementById("current-price").value);

        if (isNaN(purchasePrice) || isNaN(currentPrice)) {
            resultDiv.innerHTML = `<p class="error">Please enter valid numeric values for prices.</p>`;
            return;
        }

        const savings = purchasePrice - currentPrice;

        if (savings > 0) {
            resultDiv.innerHTML = `<p class="success">🎉 Refund Eligible! Potential Price Drop Refund: <strong>$${savings.toFixed(2)}</strong> from ${escapeHtml(storeName)}.</p>`;
            
            try {
                await fetch(`${API_URL}/api/refunds`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        store_name: storeName,
                        purchase_price: purchasePrice,
                        current_price: currentPrice,
                        savings_amount: savings
                    })
                });
            } catch (err) {
                console.error("Refund submission error:", err);
            }
        } else {
            resultDiv.innerHTML = `<p class="info">No price drop detected. Current price is equal to or higher than your purchase price.</p>`;
        }
    });
}

// Utility function to prevent XSS vulnerability
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
