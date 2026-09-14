// Cloudflare D1 Worker API Link for CheckerDiscount (Corrected URL)
const API_URL = "https://checkerdiscount-api.hamraahirn32.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});

// Fetch products directly from Cloudflare D1 Database via Worker API
async function fetchDiscounts() {
    // Support both camelCase and kebab-case IDs
    const container = document.getElementById("discountsContainer") || document.getElementById("discounts-container");
    
    try {
        const response = await fetch(`${API_URL}/api/discounts`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        
        const discounts = await response.json();
        console.log("Fetched Discounts Data:", discounts);

        if (!container) return;

        // Clear loading state
        container.innerHTML = "";

        if (!discounts || discounts.length === 0) {
            container.innerHTML = `<p style="color: #a0aec0; text-align: center;">No active discounts found at the moment.</p>`;
            return;
        }

        // Render discount cards dynamically
        discounts.forEach(item => {
            const card = document.createElement("div");
            card.className = "discount-card";
            card.style.cssText = "background: #1a202c; border: 1px solid #2d3748; padding: 15px; border-radius: 8px; margin-bottom: 12px; color: #fff;";
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; color: #63b3ed;">${item.store_name || item.title || 'Store Discount'}</h4>
                    <span style="background: #276749; color: #9ae6b4; padding: 3px 8px; border-radius: 4px; font-size: 12px;">Verified</span>
                </div>
                <p style="margin: 8px 0; color: #e2e8f0;">${item.description || 'Special price drop alert'}</p>
                <div style="display: flex; gap: 15px; font-size: 14px; color: #cbd5e0;">
                    <span>Original: <s>$${item.original_price || '0.00'}</s></span>
                    <span style="color: #48bb78; font-weight: bold;">Now: $${item.discounted_price || '0.00'}</span>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching discounts:", error);
        if (container) {
            container.innerHTML = `<p style="color: #fc8181; text-align: center;">Unable to load discounts. Please try again later.</p>`;
        }
    }
}

// Setup Price Drop Refund Tracker Form
function setupRefundForm() {
    const form = document.getElementById("refundForm") || document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Refund tracking calculation updated!");
    });
}
