/* =========================================================
   CHECKERDISCOUNT - APP.JS
   Version 6.0
   ========================================================= */

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadDeals();
    setupSavingsChecker();
    setupMobileMenu();
    setupSharePopup();
    injectDealButtonStyles();
});


/* =========================================================
   DEAL BUTTON STYLES
   ========================================================= */

function injectDealButtonStyles() {

    if (document.getElementById("checkerDealButtonStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "checkerDealButtonStyles";

    style.textContent = `
        .checker-main-deal-btn {
            display:inline-flex !important;
            align-items:center !important;
            justify-content:center !important;
            gap:8px !important;
            min-height:44px !important;
            padding:11px 20px !important;
            border:0 !important;
            border-radius:10px !important;
            background:linear-gradient(135deg,#2563eb,#4f46e5) !important;
            color:#ffffff !important;
            font-size:14px !important;
            font-weight:700 !important;
            line-height:1 !important;
            text-decoration:none !important;
            cursor:pointer !important;
            box-shadow:0 5px 15px rgba(37,99,235,.22) !important;
            transition:all .2s ease !important;
        }

        .checker-main-deal-btn:hover {
            transform:translateY(-2px) !important;
            box-shadow:0 8px 20px rgba(37,99,235,.30) !important;
            color:#ffffff !important;
        }

        .checker-share-btn {
            display:inline-flex !important;
            align-items:center !important;
            justify-content:center !important;
            gap:7px !important;
            min-height:44px !important;
            padding:10px 17px !important;
            border:1px solid #dbe3ef !important;
            border-radius:10px !important;
            background:#ffffff !important;
            color:#334155 !important;
            font-size:14px !important;
            font-weight:600 !important;
            cursor:pointer !important;
            transition:all .2s ease !important;
        }

        .checker-share-btn:hover {
            background:#f8fafc !important;
            border-color:#cbd5e1 !important;
            transform:translateY(-1px) !important;
        }

        .checker-share-overlay {
            position:fixed;
            inset:0;
            z-index:999999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            background:rgba(15,23,42,.55);
            backdrop-filter:blur(4px);
        }

        .checker-share-box {
            width:min(440px,100%);
            background:#ffffff;
            border-radius:18px;
            padding:24px;
            box-shadow:0 25px 70px rgba(0,0,0,.25);
            animation:checkerShareIn .18s ease-out;
        }

        @keyframes checkerShareIn {
            from {
                opacity:0;
                transform:translateY(12px) scale(.98);
            }
            to {
                opacity:1;
                transform:translateY(0) scale(1);
            }
        }

        .checker-share-title {
            margin:0;
            color:#0f172a;
            font-size:19px;
            font-weight:750;
        }

        .checker-share-subtitle {
            margin:7px 0 20px;
            color:#64748b;
            font-size:13px;
            line-height:1.5;
        }

        .checker-share-options {
            display:grid;
            grid-template-columns:repeat(2,1fr);
            gap:10px;
        }

        .checker-share-option {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            min-height:46px;
            border:1px solid #e2e8f0;
            border-radius:10px;
            background:#ffffff;
            color:#334155;
            font-size:14px;
            font-weight:650;
            cursor:pointer;
            text-decoration:none;
            transition:all .18s ease;
        }

        .checker-share-option:hover {
            background:#f8fafc;
            transform:translateY(-1px);
        }

        .checker-share-copy {
            grid-column:1 / -1;
        }

        .checker-share-close {
            width:34px;
            height:34px;
            border:0;
            border-radius:50%;
            background:#f1f5f9;
            color:#475569;
            font-size:20px;
            line-height:1;
            cursor:pointer;
        }

        .checker-share-url {
            width:100%;
            box-sizing:border-box;
            margin:0 0 15px;
            padding:10px 12px;
            border:1px solid #e2e8f0;
            border-radius:9px;
            background:#f8fafc;
            color:#64748b;
            font-size:12px;
            outline:none;
        }

        @media (max-width:480px) {
            .checker-share-box {
                padding:20px;
            }
        }
    `;

    document.head.appendChild(style);
}


/* =========================================================
   LOAD VERIFIED DEALS
   ========================================================= */

async function loadDeals() {

    const container =
        document.getElementById("discountsContainer");

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

        const response = await fetch(
            `${API_BASE}/api/deals`,
            {
                method:"GET",
                headers:{
                    "Accept":"application/json"
                },
                cache:"no-store"
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        console.log("CheckerDiscount API:", result);

        const deals =
            Array.isArray(result.deals)
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

        console.error(
            "Failed to load deals:",
            error
        );

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

                <h3 style="margin:0 0 8px;">
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
   RENDER DEAL
   ========================================================= */

function renderDeal(deal, container) {

    const card =
        document.createElement("article");

    /* IMPORTANT:
       CSS uses .discount-card */
    card.className = "discount-card";

    if (
        deal.id !== undefined &&
        deal.id !== null
    ) {
        card.dataset.dealId =
            String(deal.id);
    }


    const title =
        escapeHTML(
            deal.title ||
            "Untitled Product"
        );

    const store =
        escapeHTML(
            deal.store ||
            "Store"
        );

    const oldPrice =
        Number(deal.old_price);

    const newPrice =
        Number(deal.new_price);

    const currency =
        escapeHTML(
            deal.currency ||
            "USD"
        );


    let discount =
        Number(
            deal.discount_percent
        );

    if (
        !Number.isFinite(discount) &&
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice) &&
        oldPrice > newPrice
    ) {

        discount =
            ((oldPrice - newPrice) /
            oldPrice) * 100;
    }

    if (!Number.isFinite(discount)) {
        discount = 0;
    }

    discount =
        Math.round(discount * 100) / 100;


    const savings =
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice)
            ? Math.max(
                oldPrice - newPrice,
                0
            )
            : 0;


    const productUrl =
        safeHttpUrl(deal.url);


    const imageUrl =
        safeHttpUrl(
            deal.image_url
        );


    /* =====================================================
       IMAGE
       ===================================================== */

    const imageHTML = imageUrl

        ? `
            <div class="deal-image">

                <img
                    src="${escapeAttribute(imageUrl)}"
                    alt="${escapeAttribute(title)}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                    "
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


    /* =====================================================
       VERIFIED BADGE
       ===================================================== */

    const isVerified =
        String(
            deal.verification_status || ""
        ).toUpperCase() === "VERIFIED";


    const verifiedBadgeHTML =
        isVerified

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
                <span style="font-size:12px;">
                    ✓
                </span>
                VERIFIED
            </span>
        `

        : "";


    /* =====================================================
       DEAL CARD
       ===================================================== */

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
                    ${formatMoney(
                        newPrice,
                        currency
                    )}
                </div>


                ${
                    Number.isFinite(oldPrice)

                    ? `
                        <div class="deal-old-price">
                            ${formatMoney(
                                oldPrice,
                                currency
                            )}
                        </div>
                    `

                    : ""
                }

            </div>


            ${
                savings > 0

                ? `
                    <div class="deal-savings">
                        You save
                        ${formatMoney(
                            savings,
                            currency
                        )}
                    </div>
                `

                : ""
            }


            <div style="
                margin-top:8px;
                color:#64748b;
                font-size:13px;
            ">
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
                            class="checker-main-deal-btn"
                            href="${escapeAttribute(
                                productUrl
                            )}"
                            target="_blank"
                            rel="nofollow sponsored noopener noreferrer"
                        >
                            <span>Check This Deal</span>
                            <span style="font-size:16px;">
                                ↗
                            </span>
                        </a>
                    `

                    : `
                        <button
                            type="button"
                            disabled
                            class="checker-main-deal-btn"
                            style="
                                opacity:.5 !important;
                                cursor:not-allowed !important;
                            "
                        >
                            Deal Link Unavailable
                        </button>
                    `
                }


                <button
                    type="button"
                    class="checker-share-btn share-deal-btn"
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
                    <span>↗</span>
                    <span>Share</span>
                </button>

            </div>

        </div>
    `;


    /* =====================================================
       SHARE BUTTON
       ===================================================== */

    const shareButton =
        card.querySelector(
            ".share-deal-btn"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            () => {

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
            }
        );
    }


    /* =====================================================
       ADD CARD
       ===================================================== */

    container.appendChild(card);
}


/* =========================================================
   SHARE DEAL
   ========================================================= */

async function shareDeal(
    title,
    url
) {

    const shareUrl =
        url || window.location.href;


    const shareData = {
        title:
            title ||
            "CheckerDiscount Deal",

        text:
            `Check this deal on CheckerDiscount: ${
                title || ""
            }`,

        url:
            shareUrl
    };


    /*
     * MOBILE / SUPPORTED BROWSER
     *
     * Use native share menu.
     * This is why WhatsApp etc. can appear
     * on mobile.
     */

    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            await navigator.share(
                shareData
            );

            return;

        } catch (error) {

            if (
                error &&
                error.name === "AbortError"
            ) {
                return;
            }

            /*
             * If native share fails,
             * continue to desktop popup.
             */
        }
    }


    /*
     * DESKTOP
     *
     * Do NOT automatically copy.
     * Show the proper share popup.
     */

    showSharePopup(
        title,
        shareUrl
    );
}


/* =========================================================
   SHARE POPUP
   ========================================================= */

function showSharePopup(
    title,
    url
) {

    closeSharePopup();


    const encodedUrl =
        encodeURIComponent(url);


    const encodedText =
        encodeURIComponent(
            `Check this deal on CheckerDiscount: ${
                title || ""
            }`
        );


    const whatsappUrl =
        `https://wa.me/?text=${encodedText}%20${encodedUrl}`;


    const facebookUrl =
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;


    const xUrl =
        `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;


    const emailUrl =
        `mailto:?subject=${encodeURIComponent(
            title || "CheckerDiscount Deal"
        )}&body=${encodedText}%0A%0A${encodedUrl}`;


    const overlay =
        document.createElement("div");


    overlay.id =
        "checkerSharePopup";


    overlay.className =
        "checker-share-overlay";


    overlay.innerHTML = `

        <div
            class="checker-share-box"
            role="dialog"
            aria-modal="true"
            aria-label="Share deal"
        >


            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                margin-bottom:5px;
            ">

                <h3 class="checker-share-title">
                    Share this deal
                </h3>


                <button
                    type="button"
                    class="checker-share-close"
                    data-share-close
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <p class="checker-share-subtitle">
                Share this deal with your friends
                or copy the link.
            </p>


            <input
                class="checker-share-url"
                value="${escapeAttribute(url)}"
                readonly
            >


            <div class="checker-share-options">


                <a
                    class="checker-share-option"
                    href="${escapeAttribute(
                        whatsappUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>💬</span>
                    WhatsApp
                </a>


                <a
                    class="checker-share-option"
                    href="${escapeAttribute(
                        facebookUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>f</span>
                    Facebook
                </a>


                <a
                    class="checker-share-option"
                    href="${escapeAttribute(
                        xUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>𝕏</span>
                    X
                </a>


                <a
                    class="checker-share-option"
                    href="${escapeAttribute(
                        emailUrl
                    )}"
                >
                    <span>✉</span>
                    Email
                </a>


                <button
                    type="button"
                    class="checker-share-option checker-share-copy"
                    id="checkerCopyShare"
                >
                    <span>🔗</span>
                    Copy Link
                </button>


            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    /* =====================================================
       COPY LINK
       ===================================================== */

    const copyButton =
        overlay.querySelector(
            "#checkerCopyShare"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        url
                    );

                    copyButton.innerHTML =
                        "<span>✓</span> Link Copied!";

                    setTimeout(() => {

                        if (
                            document.body.contains(
                                copyButton
                            )
                        ) {

                            copyButton.innerHTML =
                                "<span>🔗</span> Copy Link";
                        }

                    }, 1800);

                } catch (error) {

                    const input =
                        overlay.querySelector(
                            ".checker-share-url"
                        );

                    if (input) {

                        input.select();

                        try {
                            document.execCommand(
                                "copy"
                            );
                        } catch (e) {}

                        copyButton.innerHTML =
                            "<span>✓</span> Link Copied!";
                    }
                }
            }
        );
    }


    /* =====================================================
       CLOSE
       ===================================================== */

    overlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === overlay ||
                event.target.closest(
                    "[data-share-close]"
                )
            ) {

                closeSharePopup();
            }
        }
    );
}


/* =========================================================
   SHARE POPUP CLOSE
   ========================================================= */

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
   SHARE POPUP SETUP
   ========================================================= */

function setupSharePopup() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeSharePopup();
            }
        }
    );
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


            if (
                !oldInput ||
                !newInput
            ) {
                return;
            }


            const oldPrice =
                Number(
                    oldInput.value
                );


            const newPrice =
                Number(
                    newInput.value
                );


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


            if (
                newPrice >= oldPrice
            ) {

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
                    ${formatMoney(
                        saving,
                        "USD"
                    )}
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


    if (
        !menuButton ||
        !mobileMenu
    ) {
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
   MONEY FORMAT
   ========================================================= */

function formatMoney(
    value,
    currency = "USD"
) {

    if (
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "—";
    }


    try {

        return new Intl.NumberFormat(
            "en-US",
            {
                style:"currency",
                currency:currency,
                maximumFractionDigits:2
            }
        ).format(
            Number(value)
        );

    } catch (error) {

        return `${
            currency
        } ${
            Number(value).toFixed(2)
        }`;
    }
}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeHttpUrl(value) {

    if (!value) {
        return "";
    }


    try {

        const url =
            new URL(value);


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

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   GLOBAL REFRESH
   ========================================================= */

window.refreshCheckerDiscountDeals =
    function () {

        loadDeals();
    };
