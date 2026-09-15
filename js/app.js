const API_URL = "https://deal-api.hamraahirn32.workers.dev/api/deals";

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscounts();
    setupRefundForm();
});


/* =========================================================
   LOAD VERIFIED DEALS
========================================================= */

async function fetchDiscounts() {

    const container =
        document.getElementById("discountsContainer") ||
        document.getElementById("discounts-container") ||
        document.getElementById("dealsContainer");

    if (!container) {
        console.error("CheckerDiscount: deals container not found.");
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
            throw new Error(
                `HTTP Error Status: ${response.status}`
            );
        }


        const result = await response.json();


        console.log(
            "CheckerDiscount API Response:",
            result
        );


        const deals =
            Array.isArray(result.deals)
                ? result.deals
                : [];


        if (deals.length === 0) {

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:30px 20px;
                    color:#64748b;
                ">
                    <div style="
                        font-size:28px;
                        margin-bottom:8px;
                    ">
                        🔎
                    </div>

                    <strong>
                        No verified deals available right now.
                    </strong>

                    <div style="
                        margin-top:6px;
                        font-size:12px;
                    ">
                        Check back soon for new savings.
                    </div>
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        deals.forEach(deal => {

            const card =
                document.createElement("div");


            card.className =
                "discount-card";


            const title =
                deal.title ||
                "Verified Deal";


            const store =
                deal.store ||
                "Online Store";


            const oldPrice =
                Number(deal.old_price || 0);


            const newPrice =
                Number(deal.new_price || 0);


            const discount =
                Number(deal.discount_percent || 0);


            const currency =
                deal.currency ||
                "USD";


            const link =
                deal.url ||
                "#";


            const imageUrl =
                deal.image_url ||
                "";


            /* -------------------------------------------------
               CURRENCY
            ------------------------------------------------- */

            const currencySymbol =
                currency === "USD" ? "$" :
                currency === "GBP" ? "£" :
                currency === "EUR" ? "€" :
                currency === "CAD" ? "C$" :
                currency === "AUD" ? "A$" :
                currency;


            /* -------------------------------------------------
               SAVINGS
            ------------------------------------------------- */

            const savings =
                oldPrice > newPrice
                    ? oldPrice - newPrice
                    : 0;


            const savingsText =
                savings > 0
                    ? `SAVE ${currencySymbol}${savings.toFixed(2)}`
                    : "";


            /* -------------------------------------------------
               IMAGE
            ------------------------------------------------- */

            const imageHTML =
                imageUrl
                    ? `
                        <div class="deal-image">

                            <img
                                src="${escapeHtml(imageUrl)}"
                                alt="${escapeHtml(title)}"
                                loading="lazy"
                                onerror="
                                    this.parentElement.style.display='none';
                                "
                            >

                        </div>
                    `
                    : "";


            /* -------------------------------------------------
               CARD
            ------------------------------------------------- */

            card.innerHTML = `

                <div class="deal-card-content">


                    ${imageHTML}


                    <div class="deal-info">


                        <!-- STORE -->

                        <div class="deal-store">
                            ${escapeHtml(store)}
                        </div>


                        <!-- DISCOUNT -->

                        ${
                            discount > 0
                                ? `
                                    <span class="deal-discount">
                                        ${discount.toFixed(0)}% OFF
                                    </span>
                                `
                                : ""
                        }


                        <!-- TITLE -->

                        <h3 class="deal-title">
                            ${escapeHtml(title)}
                        </h3>


                        <!-- PRICES -->

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


                            ${
                                newPrice > 0
                                    ? `
                                        <span class="deal-new-price">
                                            ${currencySymbol}${newPrice.toFixed(2)}
                                        </span>
                                    `
                                    : ""
                            }


                            ${
                                savings > 0
                                    ? `
                                        <span class="deal-saving">
                                            ${savingsText}
                                        </span>
                                    `
                                    : ""
                            }


                        </div>


                        <!-- DEAL MESSAGE -->

                        <div class="deal-message">
                            Worth checking before you buy.
                        </div>


                        <!-- CTA -->

                        <a
                            href="${escapeHtml(link)}"
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            class="deal-button"
                        >
                            Check This Deal
                        </a>


                    </div>

                </div>
            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "CheckerDiscount deal loading error:",
            error
        );


        container.innerHTML = `

            <div style="
                text-align:center;
                padding:30px 20px;
                color:#64748b;
            ">

                <div style="
                    font-size:28px;
                    margin-bottom:8px;
                ">
                    ⚠️
                </div>

                <strong>
                    Deals are temporarily unavailable.
                </strong>

                <div style="
                    margin-top:6px;
                    font-size:12px;
                ">
                    Please try again shortly.
                </div>

            </div>

        `;
    }
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   REFUND / SAVINGS ESTIMATOR
========================================================= */

function setupRefundForm() {

    const form =
        document.getElementById("refundForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            const inputs =
                form.querySelectorAll("input");


            let purchasePrice = 0;
            let currentPrice = 0;


            inputs.forEach(input => {

                const value =
                    parseFloat(input.value);


                if (
                    !isNaN(value) &&
                    value > 0
                ) {

                    if (
                        purchasePrice === 0
                    ) {

                        purchasePrice =
                            value;

                    } else {

                        currentPrice =
                            value;
                    }
                }
            });


            if (
                purchasePrice <= 0 ||
                currentPrice <= 0
            ) {

                alert(
                    "Please enter valid purchase and current prices."
                );

                return;
            }


            const difference =
                purchasePrice -
                currentPrice;


            if (difference > 0) {

                alert(
                    `Potential savings: $${difference.toFixed(2)}. Check your retailer's price-protection or refund policy to see whether you qualify.`
                );

            } else {

                alert(
                    "The current price is not lower than your purchase price."
                );
            }

        }
    );
}
