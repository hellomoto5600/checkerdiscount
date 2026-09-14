// Cloudflare D1 API URL for CheckerDiscount
const API_URL = "https://checkerdiscount-api.hamraahirn32.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});

// Fetch active discounts from Cloudflare D1 via Worker API
async function fetchDiscounts() {
    const container = document.getElementById("discounts-container");
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/api/discounts`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.discounts && data.discounts.length > 0) {
            renderDiscounts(data.discounts);
        } else {
            container.innerHTML = `<p class="no-data">No active discounts found at the moment.</p>`;
        }
    } catch (error) {
        console.error("Error fetching discounts:", error);
        container.innerHTML = `<p class="error">Unable to connect to database API. Please check backend CORS settings or API deployment.</p>`;
    }
}

// Render product discount cards dynamically
function renderDiscounts(discounts) {
    const container = document.getElementById("discounts-container");
    container.innerHTML = "";

    discounts.forEach(item => {
        const card = document.createElement("div");
        card.className = "discount-card";

        const savings = (parseFloat(item.original_price) - parseFloat(item.discounted_price)).toFixed(2);
        const discountPercent = Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100);

        card.innerHTML = `
            <div class="card-header">
                <span class="store-badge">${escapeHtml(item.store_name || 'Store')}</span>
                <span class="discount-badge">-${discountPercent}% OFF</span>
            </div>
            <h3>${escapeHtml(item.product_title || 'Product')}</h3>
            <div class="price-container">
                <span class="current-price">$${parseFloat(item.discounted_price).toFixed(2)}</span>
                <span class="original-price">$${parseFloat(item.original_price).toFixed(2)}</span>
            </div>
            <p class="savings-text">You Save: <strong>$${savings}</strong></p>
            <a href="${escapeHtml(item.deal_url || '#')}" target="_blank" rel="noopener noreferrer" class="btn-claim">Get Deal</a>
        `;
        container.appendChild(card);
    });
}

// Handle Track Price Drop Refund Form Submit
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
            resultDiv.innerHTML = `<p class="error">Please enter valid numeric prices.</p>`;
            return;
        }

        const savings = purchasePrice - currentPrice;

        if (savings > 0) {
            resultDiv.innerHTML = `<p class="success">🎉 Price Drop Found! You are eligible for a <strong>$${savings.toFixed(2)}</strong> refund claim from ${escapeHtml(storeName)}.</p>`;
            
            // Send refund record to D1 database
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
                console.error("Failed to store refund claim:", err);
            }
        } else {
            resultDiv.innerHTML = `<p class="info">No price drop detected yet. Current price is equal to or higher than your purchase price.</p>`;
        }
    });
}

// Helper utility to sanitize HTML output
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
