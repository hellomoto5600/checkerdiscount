/* =========================================================
   CHECKERDISCOUNT - APP.JS
   Version 5.0
   ========================================================= */

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadDeals();
    setupSavingsChecker();
    setupMobileMenu();
    setupSharePopup();
});


/* =========================================================
   LOAD VERIFIED DEALS
   ========================================================= */

async function loadDeals() {
    const container = document.getElementById("discountsContainer");

    if (!container) {
        console.error("discountsContainer not found.");
        return;
    }

    container.innerHTML = `
        <div style="
            text-align:center;
            padding:40px 20px;
            color:#64748b;
        ">
            Loading today's verified deals...
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/api/deals`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        console.log("CheckerDiscount API:", result);

        const deals = Array.isArray(result.deals)
            ? result.deals
            : [];

        container.innerHTML = "";

        if (deals.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:45px 20px;
                    color:#64748b;
                ">
                    <div style="
                        font-size:42px;
                        margin-bottom:12px;
                    ">🔎</div>

                    <h3 style="
                        margin:0 0 8px;
                        color:#1e293b;
                    ">
                        No verified deals available
                    </h3>

                    <p style="margin:0;">
                        Please check again soon.
                    </p>
                </div>
            `;

            return;
        }

        deals.forEach((deal) => {
            renderDeal(deal, container);
        });

    } catch (error) {
        console.error("Failed to load deals:", error);

        container.innerHTML = `
            <div style="
                text-align:center;
                padding:40px 20px;
                color:#dc2626;
            ">
                <div style="
                    font-size:40px;
                    margin-bottom:10px;
                ">⚠️</div>

                <h3 style="
                    margin:0 0 8px;
                ">
                    Unable to load deals
                </h3>

                <p style="
                    margin:0 0 18px;
                    color:#64748b;
                ">
                    Please refresh the page and try again.
                </p>

                <button
                    onclick="loadDeals()"
                    style="
                        border:0;
                        background:#2563eb;
                        color:#fff;
                        padding:10px 18px;
                        border-radius:8px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Try Again
                </button>
            </div>
        `;
    }
}


/* =========================================================
   RENDER ONE DEAL
   IMPORTANT:
   Every deal gets its OWN discount-card
   and its OWN VERIFIED badge.
   ========================================================= */

function renderDeal(deal, container) {

    const card = document.createElement("article");

    /*
     * IMPORTANT FIX:
     * Your CSS uses .discount-card.
     * Old JS was using .deal-card.
     */
    card.className = "discount-card";

    /*
     * Give every card a unique identity.
     * This prevents one product's UI elements
     * from being confused with another product.
     */
    if (deal.id !== undefined && deal.id !== null) {
        card.dataset.dealId = String(deal.id);
    }

    const title = escapeHTML(deal.title || "Untitled Product");
    const store = escapeHTML(deal.store || "Store");

    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);

    const currency = escapeHTML(
        deal.currency || "USD"
    );

    let discount = Number(deal.discount_percent);

    /*
     * Safety fallback:
     * If API doesn't provide discount_percent,
     * calculate it automatically.
     */
    if (
        !Number.isFinite(discount) &&
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice) &&
        oldPrice > newPrice
    ) {
        discount =
            ((oldPrice - newPrice) / oldPrice) * 100;
    }

    if (!Number.isFinite(discount)) {
        discount = 0;
    }

    discount = Math.round(discount * 100) / 100;

    const savings =
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice)
            ? Math.max(oldPrice - newPrice, 0)
            : 0;

    const productUrl = safeHttpUrl(deal.url);

    const imageUrl = safeHttpUrl(
        deal.image_url
    );

    /*
     * -------------------------------------------------------
     * PRODUCT IMAGE
     * -------------------------------------------------------
     */

    const imageHTML = imageUrl
        ? `
            <div class="deal-image">
                <img
                    src="${escapeAttribute(imageUrl)}"
                    alt="${escapeAttribute(title)}"
                    loading="lazy"
                    onerror="this.style.display='none';"
                >
            </div>
        `
        : `
            <div class="deal-image">
                <div style="
                    width:100%;
                    height:100%;
                    min-height:160px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#f8fafc;
                    color:#94a3b8;
                    font-size:42px;
                ">
                    🛍️
                </div>
            </div>
        `;


    /*
     * -------------------------------------------------------
     * VERIFIED BADGE
     * -------------------------------------------------------
     *
     * IMPORTANT:
     * This badge is CREATED INSIDE EACH CARD.
     * It is not one global badge.
     */

    const isVerified =
        String(deal.verification_status || "")
            .toUpperCase() === "VERIFIED";

    const verifiedBadgeHTML = isVerified
        ? `
            <span
                class="deal-verified-badge"
                style="
                    display:inline-flex;
                    align-items:center;
                    gap:5px;
                    padding:5px 9px;
                    border-radius:999px;
                    background:#ecfdf5;
                    color:#047857;
                    border:1px solid #a7f3d0;
                    font-size:11px;
                    font-weight:700;
                    line-height:1;
                    white-space:nowrap;
                "
            >
                <span style="font-size:12px;">✓</span>
                VERIFIED
            </span>
        `
        : "";


    /*
     * -------------------------------------------------------
     * DEAL CARD HTML
     * -------------------------------------------------------
     */

    card.innerHTML = `
        ${imageHTML}

        <div class="deal-card-content">

            <div
                class="deal-top-line"
                style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    flex-wrap:wrap;
                "
            >

                <div class="deal-store">
                    ${store}
                </div>

                <div class="deal-discount">
                    ${discount.toFixed(0)}% OFF
                </div>

                ${verifiedBadgeHTML}

            </div>


            <h3 class="deal-title">
                ${title}
            </h3>


            <div class="deal-price-row">

                <div class="deal-price">
                    ${formatMoney(newPrice, currency)}
                </div>

                ${
                    Number.isFinite(oldPrice)
                    ? `
                        <div class="deal-old-price">
                            ${formatMoney(oldPrice, currency)}
                        </div>
                    `
                    : ""
                }

            </div>


            ${
                savings > 0
                ? `
                    <div class="deal-savings">
                        You save ${formatMoney(savings, currency)}
                    </div>
                `
                : ""
            }


            <div
                style="
                    margin-top:8px;
                    color:#64748b;
                    font-size:13px;
                "
            >
                Verified deal checked by CheckerDiscount.
            </div>


            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-top:15px;
                "
            >

                ${
                    productUrl
                    ? `
                        <a
                            class="check-deal-btn"
                            href="${escapeAttribute(productUrl)}"
                            target="_blank"
                            rel="nofollow sponsored noopener noreferrer"
                        >
                            Check This Deal
                        </a>
                    `
                    : `
                        <button
                            type="button"
                            disabled
                            style="
                                opacity:.5;
                                cursor:not-allowed;
                            "
                        >
                            Deal Link Unavailable
                        </button>
                    `
                }


                <button
                    type="button"
                    class="share-deal-btn"
                    data-deal-id="${escapeAttribute(
                        String(deal.id ?? "")
                    )}"
                    data-deal-title="${escapeAttribute(
                        deal.title || ""
                    )}"
                    data-deal-url="${escapeAttribute(
                        productUrl || ""
                    )}"
                >
                    Share
                </button>

            </div>

        </div>
    `;


    /*
     * -------------------------------------------------------
     * SHARE BUTTON FOR THIS SPECIFIC CARD
     * -------------------------------------------------------
     */

    const shareButton =
        card.querySelector(".share-deal-btn");

    if (shareButton) {
        shareButton.addEventListener("click", () => {

            const shareTitle =
                shareButton.dataset.dealTitle ||
                "CheckerDiscount Deal";

            const shareUrl =
                shareButton.dataset.dealUrl ||
                window.location.href;

            shareDeal(
                shareTitle,
                shareUrl
            );
        });
    }


    /*
     * -------------------------------------------------------
     * ADD THIS CARD AS A SEPARATE ELEMENT
     * -------------------------------------------------------
     */

    container.appendChild(card);
}


/* =========================================================
   MONEY FORMAT
   ========================================================= */

function formatMoney(value, currency = "USD") {

    if (!Number.isFinite(Number(value))) {
        return "—";
    }

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 2
        }).format(Number(value));

    } catch (error) {

        return `${currency} ${Number(value).toFixed(2)}`;
    }
}


/* =========================================================
   SAFE HTTP URL
   ========================================================= */

function safeHttpUrl(value) {

    if (!value) {
        return "";
    }

    try {

        const url = new URL(value);

        if (
            url.protocol === "https:" ||
            url.protocol === "http:"
        ) {
            return url.href;
        }

        return "";

    } catch (error) {

        return "";
    }
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   SHARE DEAL
   ========================================================= */

async function shareDeal(title, url) {

    const shareData = {
        title: title || "CheckerDiscount Deal",
        text: `Check this deal on CheckerDiscount: ${title || ""}`,
        url: url || window.location.href
    };

    /*
     * Native mobile/browser sharing
     */

    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            await navigator.share(shareData);

            return;

        } catch (error) {

            /*
             * User cancelled share.
             * Do nothing.
             */

            if (error && error.name === "AbortError") {
                return;
            }
        }
    }


    /*
     * Desktop fallback
     */

    try {

        await navigator.clipboard.writeText(
            url || window.location.href
        );

        showTemporaryMessage(
            "Deal link copied!"
        );

    } catch (error) {

        showSharePopup(
            title,
            url
        );
    }
}


/* =========================================================
   SHARE POPUP
   ========================================================= */

function setupSharePopup() {

    document.addEventListener(
        "click",
        (event) => {

            const popupClose =
                event.target.closest(
                    "[data-share-close]"
                );

            if (popupClose) {
                closeSharePopup();
            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeSharePopup();
            }

        }
    );
}


function showSharePopup(title, url) {

    closeSharePopup();

    const popup =
        document.createElement("div");

    popup.id = "checkerSharePopup";

    popup.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(15,23,42,.45);
        padding:20px;
    `;

    popup.innerHTML = `
        <div
            style="
                width:min(420px,100%);
                background:#fff;
                border-radius:16px;
                padding:24px;
                box-shadow:0 20px 60px rgba(0,0,0,.18);
            "
        >

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:15px;
                    margin-bottom:16px;
                "
            >

                <strong
                    style="
                        color:#0f172a;
                        font-size:18px;
                    "
                >
                    Share Deal
                </strong>

                <button
                    type="button"
                    data-share-close
                    style="
                        border:0;
                        background:#f1f5f9;
                        width:34px;
                        height:34px;
                        border-radius:50%;
                        cursor:pointer;
                        font-size:18px;
                    "
                >
                    ×
                </button>

            </div>


            <div
                style="
                    font-size:14px;
                    color:#475569;
                    margin-bottom:15px;
                    line-height:1.5;
                "
            >
                ${escapeHTML(title)}
            </div>


            <div
                style="
                    display:flex;
                    gap:8px;
                "
            >

                <input
                    id="checkerShareUrl"
                    value="${escapeAttribute(url)}"
                    readonly
                    style="
                        flex:1;
                        min-width:0;
                        border:1px solid #cbd5e1;
                        border-radius:8px;
                        padding:10px;
                        font-size:13px;
                    "
                >

                <button
                    type="button"
                    id="checkerCopyShare"
                    style="
                        border:0;
                        background:#2563eb;
                        color:#fff;
                        padding:10px 14px;
                        border-radius:8px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Copy
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(popup);


    const copyButton =
        document.getElementById(
            "checkerCopyShare"
        );

    const input =
        document.getElementById(
            "checkerShareUrl"
        );

    if (copyButton && input) {

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        input.value
                    );

                    copyButton.textContent =
                        "Copied!";

                    setTimeout(() => {
                        copyButton.textContent =
                            "Copy";
                    }, 1500);

                } catch (error) {

                    input.select();
                    document.execCommand("copy");

                    copyButton.textContent =
                        "Copied!";
                }
            }
        );
    }


    popup.addEventListener(
        "click",
        (event) => {

            if (event.target === popup) {
                closeSharePopup();
            }

        }
    );
}


function closeSharePopup() {

    const popup =
        document.getElementById(
            "checkerSharePopup"
        );

    if (popup) {
        popup.remove();
    }
}


/* =========================================================
   TEMPORARY MESSAGE
   ========================================================= */

function showTemporaryMessage(message) {

    const oldMessage =
        document.getElementById(
            "checkerTemporaryMessage"
        );

    if (oldMessage) {
        oldMessage.remove();
    }

    const element =
        document.createElement("div");

    element.id =
        "checkerTemporaryMessage";

    element.textContent =
        message;

    element.style.cssText = `
        position:fixed;
        left:50%;
        bottom:25px;
        transform:translateX(-50%);
        z-index:99999;
        background:#0f172a;
        color:#fff;
        padding:11px 18px;
        border-radius:999px;
        font-size:14px;
        font-weight:600;
        box-shadow:0 10px 30px rgba(0,0,0,.18);
    `;

    document.body.appendChild(element);

    setTimeout(() => {

        element.remove();

    }, 2200);
}


/* =========================================================
   SAVINGS CHECKER
   ========================================================= */

function setupSavingsChecker() {

    const form =
        document.getElementById(
            "savingsCheckerForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const oldInput =
                form.querySelector(
                    "[name='oldPrice'], #oldPrice"
                );

            const newInput =
                form.querySelector(
                    "[name='newPrice'], #newPrice"
                );

            if (!oldInput || !newInput) {
                return;
            }

            const oldPrice =
                Number(oldInput.value);

            const newPrice =
                Number(newInput.value);

            const result =
                document.getElementById(
                    "savingsResult"
                );

            if (!result) {
                return;
            }

            if (
                !Number.isFinite(oldPrice) ||
                !Number.isFinite(newPrice) ||
                oldPrice <= 0 ||
                newPrice < 0
            ) {

                result.textContent =
                    "Please enter valid prices.";

                return;
            }

            if (newPrice >= oldPrice) {

                result.textContent =
                    "There is no saving at this price.";

                return;
            }

            const saving =
                oldPrice - newPrice;

            const percentage =
                (saving / oldPrice) * 100;

            result.innerHTML = `
                You save
                <strong>
                    ${formatMoney(saving, "USD")}
                </strong>
                (${percentage.toFixed(1)}%).
            `;
        }
    );
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.querySelector(
            ".mobile-menu-btn"
        );

    const mobileMenu =
        document.querySelector(
            ".mobile-menu"
        );

    if (!menuButton || !mobileMenu) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "active"
            );

            menuButton.classList.toggle(
                "active"
            );
        }
    );


    /*
     * Close menu after clicking a link
     */

    mobileMenu
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "active"
                    );

                    menuButton.classList.remove(
                        "active"
                    );
                }
            );

        });
}


/* =========================================================
   OPTIONAL GLOBAL REFRESH
   ========================================================= */

window.refreshCheckerDiscountDeals =
    function () {
        loadDeals();
    };
