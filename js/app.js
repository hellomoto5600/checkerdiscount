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
                getCurrencySymbol(currency);


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


                        <!-- CTA BUTTONS -->

                        <div class="deal-actions">

                            <a
                                href="${escapeHtml(link)}"
                                target="_blank"
                                rel="nofollow sponsored noopener"
                                class="deal-button"
                            >
                                Check This Deal
                            </a>


                            <button
                                type="button"
                                class="share-deal-button"
                                aria-label="Share this deal"
                            >
                                ↗ Share
                            </button>

                        </div>


                    </div>

                </div>
            `;


            /* -------------------------------------------------
               SHARE BUTTON
            ------------------------------------------------- */

            const shareButton =
                card.querySelector(
                    ".share-deal-button"
                );


            if (shareButton) {

                shareButton.addEventListener(
                    "click",
                    () => {
                        shareDeal(deal);
                    }
                );

            }


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
   SHARE DEAL
========================================================= */

function shareDeal(deal) {

    const title =
        deal.title ||
        "Great Deal on CheckerDiscount";


    const currency =
        deal.currency ||
        "USD";


    const newPrice =
        Number(deal.new_price || 0);


    const discount =
        Number(deal.discount_percent || 0);


    const priceText =
        newPrice > 0
            ? `${getCurrencySymbol(currency)}${newPrice.toFixed(2)}`
            : "";


    const discountText =
        discount > 0
            ? `${discount.toFixed(0)}% OFF`
            : "";


    /*
       IMPORTANT:
       We share the CheckerDiscount page URL,
       not the raw Amazon/store URL.

       This gives us a proper shareable website link.
    */

    const dealUrl =
        window.location.href;


    const shareText =
        `${title}\n` +
        `${priceText}` +
        `${discountText ? " • " + discountText : ""}` +
        `\n\nFound on CheckerDiscount`;


    /* ---------------------------------------------------------
       NATIVE MOBILE SHARE
    --------------------------------------------------------- */

    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            const sharePromise =
                navigator.share({
                    title: title,
                    text: shareText,
                    url: dealUrl
                });


            /*
               navigator.share() normally returns a Promise.
               We safely handle rejection when user cancels.
            */

            if (
                sharePromise &&
                typeof sharePromise.catch === "function"
            ) {

                sharePromise.catch(() => {
                    /* User cancelled sharing */
                });

            }

            return;

        } catch (error) {

            console.log(
                "Native share unavailable:",
                error
            );

        }
    }


    /* ---------------------------------------------------------
       DESKTOP / FALLBACK SHARE
    --------------------------------------------------------- */

    showSharePopup(
        title,
        shareText,
        dealUrl
    );
}


/* =========================================================
   SHARE POPUP
========================================================= */

function showSharePopup(
    title,
    text,
    url
) {

    const oldPopup =
        document.getElementById(
            "cdSharePopup"
        );


    if (oldPopup) {
        oldPopup.remove();
    }


    const encodedText =
        encodeURIComponent(text);


    const encodedUrl =
        encodeURIComponent(url);


    const popup =
        document.createElement("div");


    popup.id =
        "cdSharePopup";


    popup.innerHTML = `

        <div
            class="cd-share-overlay"
            data-share-close="true">
        </div>


        <div class="cd-share-box">


            <button
                type="button"
                class="cd-share-close"
                data-share-close="true"
                aria-label="Close">
                ×
            </button>


            <div class="cd-share-icon">
                ↗
            </div>


            <h3>
                Share This Deal
            </h3>


            <p>
                ${escapeHtml(title)}
            </p>


            <div class="cd-share-buttons">


                <a
                    href="https://wa.me/?text=${encodedText}%20${encodedUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="cd-share-option">
                    WhatsApp
                </a>


                <a
                    href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="cd-share-option">
                    Facebook
                </a>


                <a
                    href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="cd-share-option">
                    Telegram
                </a>


                <a
                    href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="cd-share-option">
                    X
                </a>


            </div>


            <button
                type="button"
                class="cd-copy-link">
                Copy Deal Link
            </button>


            <div
                id="cdCopyMessage">
            </div>


        </div>
    `;


    document.body.appendChild(popup);


    /* ---------------------------------------------------------
       CLOSE BUTTONS
    --------------------------------------------------------- */

    popup
        .querySelectorAll("[data-share-close]")
        .forEach(element => {

            element.addEventListener(
                "click",
                closeSharePopup
            );

        });


    /* ---------------------------------------------------------
       COPY BUTTON
    --------------------------------------------------------- */

    const copyButton =
        popup.querySelector(
            ".cd-copy-link"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            () => {
                copyDealLink(url);
            }
        );

    }
}


/* =========================================================
   CLOSE SHARE POPUP
========================================================= */

function closeSharePopup() {

    const popup =
        document.getElementById(
            "cdSharePopup"
        );


    if (popup) {
        popup.remove();
    }
}


/* =========================================================
   COPY DEAL LINK
========================================================= */

async function copyDealLink(url) {

    try {

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {

            await navigator.clipboard.writeText(
                url
            );

        } else {

            throw new Error(
                "Clipboard API unavailable"
            );

        }


        showCopyMessage();


    } catch (error) {

        /* -----------------------------------------------------
           OLD BROWSER FALLBACK
        ----------------------------------------------------- */

        try {

            const tempInput =
                document.createElement("input");


            tempInput.type =
                "text";


            tempInput.value =
                url;


            tempInput.style.position =
                "fixed";


            tempInput.style.left =
                "-9999px";


            document.body.appendChild(
                tempInput
            );


            tempInput.focus();


            tempInput.select();


            document.execCommand(
                "copy"
            );


            tempInput.remove();


            showCopyMessage();


        } catch (fallbackError) {

            console.error(
                "Copy failed:",
                fallbackError
            );


            alert(
                "Unable to copy the link automatically. Please copy it manually."
            );

        }

    }
}


/* =========================================================
   COPY MESSAGE
========================================================= */

function showCopyMessage() {

    const message =
        document.getElementById(
            "cdCopyMessage"
        );


    if (message) {

        message.textContent =
            "✓ Deal link copied";


        message.style.marginTop =
            "12px";


        message.style.color =
            "#087443";


        message.style.fontSize =
            "13px";


        message.style.fontWeight =
            "600";

    }
}


/* =========================================================
   CURRENCY SYMBOL
========================================================= */

function getCurrencySymbol(currency) {

    return currency === "USD" ? "$" :
           currency === "GBP" ? "£" :
           currency === "EUR" ? "€" :
           currency === "CAD" ? "C$" :
           currency === "AUD" ? "A$" :
           currency;
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
