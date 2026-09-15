const API_URL = "https://deal-api.hamraahirn32.workers.dev/api/deals";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});

async function fetchDiscounts() {
    const container =
        document.getElementById("discountsContainer") ||
        document.getElementById("discounts-container") ||
        document.getElementById("dealsContainer") ||
        document.querySelector(".latest-discounts");

    if (!container) {
        console.error("Deals container not found.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const result = await response.json();

        console.log("CheckerDiscount API Response:", result);

        /*
         * Our Worker API returns:
         *
         * {
         *   success: true,
         *   count: 1,
         *   deals: [...]
         * }
         */

        const deals = Array.isArray(result.deals)
            ? result.deals
            : [];

        if (deals.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px;">
                    <p>No active deals found right now.</p>
                </div>
            `;
            return;
        }

        /*
         * IMPORTANT:
         * We only replace the deal content.
         * The existing website structure/design remains unchanged.
         */

        container.innerHTML = "";

        deals.forEach(deal => {
            const card = document.createElement("div");

            card.className = "discount-card";

            const title = deal.title || "Verified Deal";
            const store = deal.store || "Online Store";

            const oldPrice = Number(deal.old_price || 0);
            const newPrice = Number(deal.new_price || 0);
            const discount = Number(deal.discount_percent || 0);

            const currency = deal.currency || "USD";
            const link = deal.url || "#";
            const imageUrl = deal.image_url || "";

            const currencySymbol =
                currency === "USD" ? "$" :
                currency === "GBP" ? "£" :
                currency === "EUR" ? "€" :
                currency === "CAD" ? "C$" :
                currency === "AUD" ? "A$" :
                currency;

            card.innerHTML = `
                <div class="deal-card-content">

                    ${
                        imageUrl
                        ? `
                        <div class="deal-image">
                            <img
                                src="${escapeHtml(imageUrl)}"
                                alt="${escapeHtml(title)}"
                                loading="lazy"
                                onerror="this.parentElement.style.display='none';"
                            >
                        </div>
                        `
                        : ""
                    }

                    <div class="deal-info">

                        <div class="deal-store">
                            ${escapeHtml(store)}
                        </div>

                        <h3 class="deal-title">
                            ${escapeHtml(title)}
                        </h3>

                        <div class="deal-pricing">

                            ${
                                oldPrice > 0
                                ? `
                                <span class="deal-old-price">
                                    ${currencySymbol}${oldPrice.toFixed(2)}
                                </span>
                                `
                                : ""
                            }

                            <span class="deal-new-price">
                                ${currencySymbol}${newPrice.toFixed(2)}
                            </span>

                            ${
                                discount > 0
                                ? `
                                <span class="deal-discount">
                                    ${discount.toFixed(0)}% OFF
                                </span>
                                `
                                : ""
                            }

                        </div>

                        <a
                            href="${escapeHtml(link)}"
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            class="deal-button"
                        >
                            Check Deal
                        </a>

                    </div>

                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching CheckerDiscount deals:", error);

        container.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <p>Unable to load deals right now.</p>
            </div>
        `;
    }
}


/*
 * Basic HTML escaping.
 * This protects the page if product titles or store names
 * contain special HTML characters.
 */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
 * Refund Calculator
 * Existing functionality preserved.
 */
function setupRefundForm() {

    const form =
        document.getElementById("refundForm") ||
        document.querySelector("form");

    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const inputs = form.querySelectorAll("input");

        let purchasePrice = 0;
        let currentPrice = 0;

        inputs.forEach(input => {

            const val = parseFloat(input.value);

            if (!isNaN(val) && val > 0) {

                if (purchasePrice === 0) {
                    purchasePrice = val;
                } else {
                    currentPrice = val;
                }
            }
        });

        if (purchasePrice > 0 && currentPrice > 0) {

            const refundAmount = purchasePrice - currentPrice;

            if (refundAmount > 0) {

                alert(
                    `Great news! You are eligible for a price-protection refund of $${refundAmount.toFixed(2)}. You can claim this from your retailer.`
                );

            } else {

                alert(
                    "Your purchase price is already lower than or equal to the current drop price."
                );
            }

        } else {

            alert(
                "Please enter valid purchase and current drop prices to calculate your refund."
            );
        }
    });
}
