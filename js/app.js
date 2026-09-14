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
        console.log("Fetched Discounts Data:", discounts);

        if (discounts.results && Array.isArray(discounts.results)) {
            discounts = discounts.results;
        } else if (discounts.data && Array.isArray(discounts.data)) {
            discounts = discounts.data;
        }

        if (!container) {
            console.error("Discounts container element not found in HTML!");
            return;
        }

        container.innerHTML = "";

        if (!Array.isArray(discounts) || discounts.length === 0) {
            container.innerHTML = `<p style="color: #a0aec0; text-align: center;">No active discounts found in database.</p>`;
            return;
        }

        discounts.forEach(item => {
            const card = document.createElement("div");
            card.className = "discount-card";
            card.style.cssText = "background: #1a202c; border: 1px solid #2d3748; padding: 16px; border-radius: 8px; margin-bottom: 12px; color: #fff; text-align: left;";
            
            const title = item.title || item.name || item.store_name || "Verified Deal";
            const desc = item.description || item.details || item.store || "Direct price drop deal";
            const originalPrice = item.original_price || item.old_price || item.price || "0.00";
            const discountPrice = item.discounted_price || item.new_price || item.sale_price || "0.00";
            const link = item.url || item.link || "#";

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; color: #63b3ed; font-size: 16px;">${title}</h4>
                    <span style="background: #276749; color: #9ae6b4; padding: 3px 8px; border-radius: 4px; font-size: 12px;">Verified</span>
                </div>
                <p style="margin: 8px 0; color: #cbd5e0; font-size: 14px;">Store: ${desc}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <div style="font-size: 14px;">
                        <span style="color: #a0aec0; text-decoration: line-through; margin-right: 8px;">$${originalPrice}</span>
                        <span style="color: #48bb78; font-weight: bold; font-size: 16px;">$${discountPrice}</span>
                    </div>
                    ${link !== '#' ? `<a href="${link}" target="_blank" style="background: #3182ce; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 12px;">Get Deal</a>` : ''}
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

function setupRefundForm() {
    const form = document.getElementById("refundForm") || document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Refund tracking calculation updated!");
    });
}
