const API_URL = "https://deal-api.hamraahirn32.workers.dev/api/deals";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});

async function fetchDiscounts() {
    let container = document.getElementById("discountsContainer") || 
                    document.getElementById("discounts-container") || 
                    document.getElementById("dealsContainer") ||
                    document.querySelector(".latest-discounts") ||
                    document.querySelector("main");
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        
        let discounts = await response.json();

        if (discounts.results && Array.isArray(discounts.results)) {
            discounts = discounts.results;
        } else if (discounts.data && Array.isArray(discounts.data)) {
            discounts = discounts.data;
        }

        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(discounts) || discounts.length === 0) {
            container.innerHTML = `<p style="color: #a0aec0; text-align: center;">No active discounts found in database.</p>`;
            return;
        }

        discounts.forEach(item => {
            const card = document.createElement("div");
            card.className = "discount-card";
            card.style.cssText = "background: #1a202c; border: 1px solid #2d3748; padding: 16px; border-radius: 8px; margin-bottom: 12px; color: #fff; text-align: left;";
            
            const title = item.title || "Verified Deal";
            const store = item.store || "Online Store";
            const originalPrice = item.old_price || item.original_price || "0.00";
            const discountPrice = item.new_price || item.discounted_price || "0.00";
            const link = item.url || "#";

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; color: #63b3ed; font-size: 16px;">${title}</h4>
                    <span style="background: #276749; color: #9ae6b4; padding: 3px 8px; border-radius: 4px; font-size: 12px;">Verified Deal</span>
                </div>
                <p style="margin: 8px 0; color: #cbd5e0; font-size: 14px;">Store: <strong>${store}</strong></p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <div style="font-size: 14px;">
                        <span style="color: #a0aec0; text-decoration: line-through; margin-right: 8px;">$${originalPrice}</span>
                        <span style="color: #48bb78; font-weight: bold; font-size: 16px;">$${discountPrice}</span>
                    </div>
                    <a href="${link}" target="_blank" style="background: #3182ce; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 12px;">Get Deal</a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching discounts:", error);
    }
}

function setupRefundForm() {
    // Interactive Refund Calculator Logic
    const form = document.getElementById("refundForm") || document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Find input fields inside or near form
        const inputs = form.querySelectorAll("input");
        let purchasePrice = 0;
        let currentPrice = 0;

        inputs.forEach(input => {
            const val = parseFloat(input.value);
            if (!isNaN(val) && val > 0) {
                if (purchasePrice === 0) purchasePrice = val;
                else currentPrice = val;
            }
        });

        if (purchasePrice > 0 && currentPrice > 0) {
            const refundAmount = purchasePrice - currentPrice;
            if (refundAmount > 0) {
                alert(`Great news! You are eligible for a price-protection refund of $${refundAmount.toFixed(2)}. You can claim this from your retailer.`);
            } else {
                alert("Your purchase price is already lower than or equal to the current drop price.");
            }
        } else {
            alert("Please enter valid purchase and current drop prices to calculate your refund.");
        }
    });
}
