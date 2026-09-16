/* =========================================================
   CHECKERDISCOUNT - APP.JS
   Version 8.0

   Deals
   Share
   Savings Calculator
   Search
   Category Filter
   ========================================================= */

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

let checkerDiscountDeals = [];


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
   DEAL BUTTON + SEARCH STYLES
   ========================================================= */

function injectDealButtonStyles() {

    if (
        document.getElementById(
            "checkerDealButtonStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "checkerDealButtonStyles";


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

            background:
                linear-gradient(
                    135deg,
                    #2563eb,
                    #4f46e5
                ) !important;

            color:#ffffff !important;

            font-size:14px !important;

            font-weight:700 !important;

            line-height:1 !important;

            text-decoration:none !important;

            cursor:pointer !important;

            box-shadow:
                0 5px 15px
                rgba(37,99,235,.22) !important;

            transition:
                all .2s ease !important;

        }


        .checker-main-deal-btn:hover {

            transform:
                translateY(-2px) !important;

            box-shadow:
                0 8px 20px
                rgba(37,99,235,.30) !important;

            color:#ffffff !important;

        }


        .checker-share-btn {

            display:inline-flex !important;

            align-items:center !important;

            justify-content:center !important;

            gap:7px !important;

            min-height:44px !important;

            padding:10px 17px !important;

            border:
                1px solid #dbe3ef !important;

            border-radius:10px !important;

            background:#ffffff !important;

            color:#334155 !important;

            font-size:14px !important;

            font-weight:600 !important;

            cursor:pointer !important;

            transition:
                all .2s ease !important;

        }


        .checker-share-btn:hover {

            background:#f8fafc !important;

            border-color:#cbd5e1 !important;

            transform:
                translateY(-1px) !important;

        }


        /* =====================================================
           SEARCH AREA
           ===================================================== */

        .checker-deal-tools {

            width:100%;

            margin:
                0 0 25px;

            padding:
                18px;

            box-sizing:border-box;

            background:#ffffff;

            border:
                1px solid #e2e8f0;

            border-radius:14px;

            box-shadow:
                0 5px 18px
                rgba(15,23,42,.05);

        }


        .checker-deal-tools-row {

            display:grid;

            grid-template-columns:
                minmax(0, 1fr)
                220px;

            gap:12px;

        }


        .checker-search-wrap {

            position:relative;

            width:100%;

        }


        .checker-search-icon {

            position:absolute;

            left:14px;

            top:50%;

            transform:
                translateY(-50%);

            font-size:17px;

            color:#94a3b8;

            pointer-events:none;

        }


        .checker-deal-search {

            width:100%;

            height:48px;

            box-sizing:border-box;

            padding:
                0 15px 0 42px;

            border:
                1px solid #dbe3ef;

            border-radius:10px;

            background:#f8fafc;

            color:#0f172a;

            font-size:14px;

            outline:none;

            transition:
                border-color .2s ease,
                box-shadow .2s ease,
                background .2s ease;

        }


        .checker-deal-search:focus {

            background:#ffffff;

            border-color:#2563eb;

            box-shadow:
                0 0 0 3px
                rgba(37,99,235,.10);

        }


        .checker-category-filter {

            width:100%;

            height:48px;

            box-sizing:border-box;

            padding:
                0 13px;

            border:
                1px solid #dbe3ef;

            border-radius:10px;

            background:#f8fafc;

            color:#334155;

            font-size:14px;

            outline:none;

            cursor:pointer;

        }


        .checker-category-filter:focus {

            background:#ffffff;

            border-color:#2563eb;

            box-shadow:
                0 0 0 3px
                rgba(37,99,235,.10);

        }


        .checker-search-status {

            margin-top:10px;

            color:#64748b;

            font-size:12px;

        }


        @media (max-width:700px) {

            .checker-deal-tools-row {

                grid-template-columns:1fr;

            }

        }


        /* =====================================================
           SHARE POPUP
           ===================================================== */

        .checker-share-overlay {

            position:fixed;

            inset:0;

            z-index:999999;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:20px;

            background:
                rgba(15,23,42,.55);

            backdrop-filter:
                blur(4px);

        }


        .checker-share-box {

            width:min(
                440px,
                100%
            );

            background:#ffffff;

            border-radius:18px;

            padding:24px;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.25);

            animation:
                checkerShareIn
                .18s
                ease-out;

        }


        @keyframes checkerShareIn {

            from {

                opacity:0;

                transform:
                    translateY(12px)
                    scale(.98);

            }

            to {

                opacity:1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        .checker-share-title {

            margin:0;

            color:#0f172a;

            font-size:19px;

            font-weight:750;

        }


        .checker-share-subtitle {

            margin:
                7px 0 20px;

            color:#64748b;

            font-size:13px;

            line-height:1.5;

        }


        .checker-share-options {

            display:grid;

            grid-template-columns:
                repeat(2,1fr);

            gap:10px;

        }


        .checker-share-option {

            display:flex;

            align-items:center;

            justify-content:center;

            gap:8px;

            min-height:46px;

            border:
                1px solid #e2e8f0;

            border-radius:10px;

            background:#ffffff;

            color:#334155;

            font-size:14px;

            font-weight:650;

            cursor:pointer;

            text-decoration:none;

            transition:
                all .18s ease;

        }


        .checker-share-option:hover {

            background:#f8fafc;

            transform:
                translateY(-1px);

        }


        .checker-share-copy {

            grid-column:
                1 / -1;

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

            margin:
                0 0 15px;

            padding:
                10px 12px;

            border:
                1px solid #e2e8f0;

            border-radius:9px;

            background:#f8fafc;

            color:#64748b;

            font-size:12px;

            outline:none;

        }


        /* =====================================================
           SAVINGS MODAL
           ===================================================== */

        .checker-savings-overlay {

            position:fixed;

            inset:0;

            z-index:1000000;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:20px;

            box-sizing:border-box;

            background:
                rgba(15,23,42,.58);

            backdrop-filter:
                blur(5px);

            animation:
                checkerSavingsFade
                .18s ease-out;

        }


        .checker-savings-box {

            position:relative;

            width:min(
                430px,
                100%
            );

            box-sizing:border-box;

            padding:30px 25px 25px;

            background:#ffffff;

            border-radius:20px;

            text-align:center;

            box-shadow:
                0 25px 80px
                rgba(0,0,0,.25);

            animation:
                checkerSavingsIn
                .22s ease-out;

        }


        @keyframes checkerSavingsFade {

            from {
                opacity:0;
            }

            to {
                opacity:1;
            }

        }


        @keyframes checkerSavingsIn {

            from {

                opacity:0;

                transform:
                    translateY(18px)
                    scale(.96);

            }

            to {

                opacity:1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        .checker-savings-close {

            position:absolute;

            top:12px;

            right:12px;

            width:34px;

            height:34px;

            border:0;

            border-radius:50%;

            background:#f1f5f9;

            color:#475569;

            font-size:21px;

            cursor:pointer;

        }


        .checker-savings-icon {

            width:62px;

            height:62px;

            margin:
                0 auto 15px;

            display:flex;

            align-items:center;

            justify-content:center;

            border-radius:50%;

            background:#ecfdf5;

            color:#059669;

            font-size:30px;

            font-weight:800;

        }


        .checker-savings-title {

            margin:0;

            color:#0f172a;

            font-size:20px;

            font-weight:750;

        }


        .checker-savings-amount {

            margin:
                12px 0 4px;

            color:#059669;

            font-size:38px;

            font-weight:850;

            line-height:1.15;

        }


        .checker-savings-percent {

            color:#166534;

            font-size:15px;

            font-weight:700;

        }


        .checker-savings-details {

            margin-top:17px;

            padding:
                12px 14px;

            border-radius:10px;

            background:#f8fafc;

            color:#64748b;

            font-size:13px;

            line-height:1.5;

        }


        .checker-savings-done {

            width:100%;

            margin-top:18px;

            min-height:46px;

            border:0;

            border-radius:10px;

            background:
                linear-gradient(
                    135deg,
                    #2563eb,
                    #4f46e5
                );

            color:#ffffff;

            font-size:14px;

            font-weight:700;

            cursor:pointer;

        }


        body.checker-modal-open {

            overflow:hidden;

        }


        @media (max-width:480px) {

            .checker-share-box {

                padding:20px;

            }


            .checker-savings-box {

                padding:
                    28px 18px 20px;

            }


            .checker-savings-amount {

                font-size:34px;

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
        document.getElementById(
            "discountsContainer"
        );


    if (!container) {

        console.error(
            "discountsContainer not found."
        );

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

        const response =
            await fetch(
                `${API_BASE}/api/deals`,
                {
                    method:"GET",

                    headers:{
                        "Accept":
                            "application/json"
                    },

                    cache:"no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `API error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "CheckerDiscount API:",
            result
        );


        const deals =
            Array.isArray(
                result.deals
            )
                ? result.deals
                : [];


        checkerDiscountDeals =
            deals.filter(
                deal =>
                    String(
                        deal.verification_status ||
                        ""
                    ).toUpperCase() ===
                    "VERIFIED"
            );


        container.innerHTML = "";


        setupDealSearch(
            container,
            checkerDiscountDeals
        );


        if (
            checkerDiscountDeals.length ===
            0
        ) {

            showNoDeals(
                container
            );

            return;

        }


        renderDeals(
            checkerDiscountDeals,
            container
        );


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
                ">
                    ⚠️
                </div>


                <h3 style="
                    margin:0 0 8px;
                ">
                    Unable to load deals
                </h3>


                <p style="
                    margin:0 0 18px;
                    color:#64748b;
                ">
                    Please refresh the page
                    and try again.
                </p>


                <button
                    type="button"
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
   RENDER ALL DEALS
   ========================================================= */

function renderDeals(
    deals,
    container
) {

    const oldCards =
        container.querySelectorAll(
            ".discount-card"
        );


    oldCards.forEach(
        card => card.remove()
    );


    deals.forEach(
        deal => {

            renderDeal(
                deal,
                container
            );

        }
    );


    updateSearchStatus(
        deals.length,
        deals.length
    );

}


/* =========================================================
   NO DEALS
   ========================================================= */

function showNoDeals(
    container
) {

    const existing =
        container.querySelector(
            ".checker-no-deals-message"
        );


    if (existing) {

        existing.remove();

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "checker-no-deals-message";


    message.innerHTML = `

        <div style="
            text-align:center;
            padding:45px 20px;
            color:#64748b;
        ">

            <div style="
                font-size:42px;
                margin-bottom:12px;
            ">
                🔎
            </div>


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


    container.appendChild(
        message
    );

}


/* =========================================================
   SEARCH + CATEGORY
   ========================================================= */

function setupDealSearch(
    container,
    deals
) {

    const oldTools =
        document.getElementById(
            "checkerDealTools"
        );


    if (oldTools) {

        oldTools.remove();

    }


    const tools =
        document.createElement(
            "div"
        );


    tools.id =
        "checkerDealTools";


    tools.className =
        "checker-deal-tools";


    tools.innerHTML = `

        <div class="
            checker-deal-tools-row
        ">


            <div class="
                checker-search-wrap
            ">

                <span class="
                    checker-search-icon
                ">
                    🔎
                </span>


                <input
                    type="search"
                    id="checkerDealSearch"
                    class="checker-deal-search"
                    placeholder="Search deals, products or stores..."
                    autocomplete="off"
                    aria-label="Search deals"
                >

            </div>


            <select
                id="checkerCategoryFilter"
                class="checker-category-filter"
                aria-label="Filter by category"
            >

                <option value="all">
                    All Categories
                </option>

            </select>


        </div>


        <div
            id="checkerSearchStatus"
            class="checker-search-status"
        >
            Showing ${deals.length} verified deal${deals.length === 1 ? "" : "s"}
        </div>

    `;


    /*
     * Put search area BEFORE
     * the deal cards.
     */

    container.parentNode.insertBefore(
        tools,
        container
    );


    const searchInput =
        tools.querySelector(
            "#checkerDealSearch"
        );


    const categoryFilter =
        tools.querySelector(
            "#checkerCategoryFilter"
        );


    const categories =
        getDealCategories(
            deals
        );


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );

        }
    );


    function applyFilters() {

        const search =
            String(
                searchInput.value || ""
            )
                .trim()
                .toLowerCase();


        const category =
            categoryFilter.value;


        const filtered =
            deals.filter(
                deal => {

                    const title =
                        String(
                            deal.title || ""
                        ).toLowerCase();


                    const store =
                        String(
                            deal.store || ""
                        ).toLowerCase();


                    const asin =
                        String(
                            deal.asin || ""
                        ).toLowerCase();


                    const dealCategory =
                        getDealCategory(
                            deal
                        ).toLowerCase();


                    const matchesSearch =
                        !search ||

                        title.includes(
                            search
                        ) ||

                        store.includes(
                            search
                        ) ||

                        asin.includes(
                            search
                        );


                    const matchesCategory =
                        category ===
                            "all" ||

                        dealCategory ===
                            category.toLowerCase();


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );


        renderFilteredDeals(
            filtered,
            container
        );


        updateSearchStatus(
            filtered.length,
            deals.length
        );

    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   FILTERED DEAL RENDER
   ========================================================= */

function renderFilteredDeals(
    deals,
    container
) {

    const oldCards =
        container.querySelectorAll(
            ".discount-card"
        );


    oldCards.forEach(
        card => card.remove()
    );


    const oldMessage =
        container.querySelector(
            ".checker-filter-empty"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    if (
        deals.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "checker-filter-empty";


        empty.innerHTML = `

            <div style="
                text-align:center;
                padding:45px 20px;
                color:#64748b;
            ">

                <div style="
                    font-size:40px;
                    margin-bottom:10px;
                ">
                    🔎
                </div>


                <h3 style="
                    margin:0 0 8px;
                    color:#1e293b;
                ">
                    No matching deals found
                </h3>


                <p style="margin:0;">
                    Try another search or category.
                </p>

            </div>

        `;


        container.appendChild(
            empty
        );


        return;

    }


    deals.forEach(
        deal => {

            renderDeal(
                deal,
                container
            );

        }
    );

}


/* =========================================================
   SEARCH STATUS
   ========================================================= */

function updateSearchStatus(
    shown,
    total
) {

    const status =
        document.getElementById(
            "checkerSearchStatus"
        );


    if (!status) {

        return;

    }


    if (
        shown === total
    ) {

        status.textContent =
            `Showing ${total} verified deal${total === 1 ? "" : "s"}`;

        return;

    }


    status.textContent =
        `Showing ${shown} of ${total} verified deals`;

}


/* =========================================================
   CATEGORY LIST
   ========================================================= */

function getDealCategories(
    deals
) {

    const categorySet =
        new Set();


    deals.forEach(
        deal => {

            const category =
                getDealCategory(
                    deal
                );


            if (category) {

                categorySet.add(
                    category
                );

            }

        }
    );


    return Array.from(
        categorySet
    ).sort(
        (a, b) =>
            a.localeCompare(b)
    );

}


/* =========================================================
   CATEGORY DETECTION
   ========================================================= */

function getDealCategory(
    deal
) {

    /*
     * If API already provides
     * category, use it.
     */

    if (
        deal &&
        deal.category
    ) {

        return String(
            deal.category
        ).trim();

    }


    const text =
        `${deal?.title || ""} ${
            deal?.store || ""
        }`
            .toLowerCase();


    /*
     * Electronics
     */

    if (
        /laptop|computer|pc|monitor|keyboard|mouse|tablet|phone|iphone|android|smartphone|headphone|earbuds|speaker|tv|television|camera|printer|router|charger|electronic|gaming/.test(
            text
        )
    ) {

        return "Electronics";

    }


    /*
     * Home & Kitchen
     */

    if (
        /mixer|blender|kitchen|cook|cooker|fryer|air fryer|vacuum|cleaner|home|furniture|chair|table|lamp|lighting|coffee maker|toaster|microwave|utensil/.test(
            text
        )
    ) {

        return "Home & Kitchen";

    }


    /*
     * Fashion
     */

    if (
        /shirt|t-shirt|jeans|dress|shoe|shoes|sneaker|jacket|coat|clothing|fashion|watch|bag|handbag|wallet/.test(
            text
        )
    ) {

        return "Fashion";

    }


    /*
     * Beauty
     */

    if (
        /beauty|makeup|cosmetic|skincare|skin care|perfume|fragrance|hair|shampoo|conditioner|cream|lotion/.test(
            text
        )
    ) {

        return "Beauty";

    }


    /*
     * Sports
     */

    if (
        /sport|fitness|gym|exercise|running|football|soccer|basketball|tennis|bicycle|bike|yoga|training/.test(
            text
        )
    ) {

        return "Sports";

    }


    /*
     * Toys
     */

    if (
        /toy|toys|lego|game|puzzle|kids|children|baby/.test(
            text
        )
    ) {

        return "Toys & Kids";

    }


    /*
     * Automotive
     */

    if (
        /car|auto|automotive|vehicle|motor|tire|tyre|dash cam|car charger/.test(
            text
        )
    ) {

        return "Automotive";

    }


    /*
     * Default
     */

    return "Other";

}


/* =========================================================
   RENDER DEAL
   ========================================================= */

function renderDeal(
    deal,
    container
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "discount-card";


    if (
        deal.id !== undefined &&
        deal.id !== null
    ) {

        card.dataset.dealId =
            String(
                deal.id
            );

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
        Number(
            deal.old_price
        );


    const newPrice =
        Number(
            deal.new_price
        );


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
        !Number.isFinite(
            discount
        ) &&
        Number.isFinite(
            oldPrice
        ) &&
        Number.isFinite(
            newPrice
        ) &&
        oldPrice > newPrice
    ) {

        discount =
            (
                (oldPrice - newPrice)
                /
                oldPrice
            ) * 100;

    }


    if (
        !Number.isFinite(
            discount
        )
    ) {

        discount = 0;

    }


    discount =
        Math.round(
            discount * 100
        ) / 100;


    const savings =
        Number.isFinite(
            oldPrice
        ) &&
        Number.isFinite(
            newPrice
        )

            ? Math.max(
                oldPrice -
                newPrice,
                0
            )

            : 0;


    const productUrl =
        safeHttpUrl(
            deal.url
        );


    const imageUrl =
        safeHttpUrl(
            deal.image_url
        );


    const imageHTML =
        imageUrl

            ? `

                <div class="deal-image">

                    <img
                        src="${escapeAttribute(
                            imageUrl
                        )}"
                        alt="${escapeAttribute(
                            title
                        )}"
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


    const isVerified =
        String(
            deal.verification_status ||
            ""
        ).toUpperCase() ===
        "VERIFIED";


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

                    <span style="
                        font-size:12px;
                    ">
                        ✓
                    </span>

                    VERIFIED

                </span>

            `

            : "";


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
                    Number.isFinite(
                        oldPrice
                    )

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

                Verified deal checked
                by CheckerDiscount.

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

                                <span>
                                    Check This Deal
                                </span>

                                <span style="
                                    font-size:16px;
                                ">
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
                    class="
                        checker-share-btn
                        share-deal-btn
                    "
                    data-deal-title="${escapeAttribute(
                        deal.title || ""
                    )}"
                    data-deal-url="${escapeAttribute(
                        productUrl || ""
                    )}"
                >

                    <span>
                        ↗
                    </span>

                    <span>
                        Share
                    </span>

                </button>


            </div>

        </div>

    `;


    const shareButton =
        card.querySelector(
            ".share-deal-btn"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            () => {

                const shareTitle =
                    shareButton.dataset
                        .dealTitle ||
                    "CheckerDiscount Deal";


                const shareUrl =
                    shareButton.dataset
                        .dealUrl ||
                    window.location.href;


                shareDeal(
                    shareTitle,
                    shareUrl
                );

            }
        );

    }


    container.appendChild(
        card
    );

}


/* =========================================================
   SHARE DEAL
   ========================================================= */

async function shareDeal(
    title,
    url
) {

    const shareUrl =
        url ||
        window.location.href;


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


    if (
        navigator.share &&
        typeof navigator.share ===
            "function"
    ) {

        try {

            await navigator.share(
                shareData
            );


            return;

        } catch (error) {

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return;

            }

        }

    }


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
        encodeURIComponent(
            url
        );


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
            title ||
            "CheckerDiscount Deal"
        )}&body=${encodedText}%0A%0A${encodedUrl}`;


    const overlay =
        document.createElement(
            "div"
        );


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

                Share this deal with your
                friends or copy the link.

            </p>


            <input
                class="checker-share-url"
                value="${escapeAttribute(
                    url
                )}"
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
                    class="
                        checker-share-option
                        checker-share-copy
                    "
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


    const copyButton =
        overlay.querySelector(
            "#checkerCopyShare"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard
                        .writeText(url);


                    copyButton.innerHTML =
                        "<span>✓</span> Link Copied!";


                    setTimeout(
                        () => {

                            if (
                                document.body
                                    .contains(
                                        copyButton
                                    )
                            ) {

                                copyButton.innerHTML =
                                    "<span>🔗</span> Copy Link";

                            }

                        },
                        1800
                    );


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


    overlay.addEventListener(
        "click",
        event => {

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
   CLOSE SHARE POPUP
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
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeSharePopup();

                closeSavingsModal();

            }

        }
    );

}


/* =========================================================
   SAVINGS CALCULATOR
   VERSION 8.0
   ========================================================= */

function setupSavingsChecker() {

    /*
     * YOUR ACTUAL HTML IDs
     */

    const form =
        document.getElementById(
            "refundForm"
        );


    const purchaseInput =
        document.getElementById(
            "purchasePrice"
        );


    const currentInput =
        document.getElementById(
            "currentPrice"
        );


    const result =
        document.getElementById(
            "refundResult"
        );


    if (
        !form ||
        !purchaseInput ||
        !currentInput ||
        !result
    ) {

        console.warn(
            "CheckerDiscount Savings Calculator: " +
            "refundForm / purchasePrice / currentPrice / refundResult not found."
        );

        return;

    }


    /*
     * MAKE SURE THIS FORM NEVER
     * NAVIGATES TO ANOTHER SECTION.
     */

    form.setAttribute(
        "action",
        "javascript:void(0);"
    );


    /*
     * PRICE CONVERTER
     */

    function getPrice(
        value
    ) {

        const cleaned =
            String(
                value ?? ""
            )
                .replace(
                    /[$,\s]/g,
                    ""
                )
                .trim();


        return Number(
            cleaned
        );

    }


    /*
     * CALCULATE
     */

    function calculateSavings(
        event
    ) {

        if (event) {

            event.preventDefault();

            event.stopPropagation();

        }


        const purchasePrice =
            getPrice(
                purchaseInput.value
            );


        const currentPrice =
            getPrice(
                currentInput.value
            );


        /*
         * VALIDATION
         */

        if (
            !Number.isFinite(
                purchasePrice
            ) ||
            !Number.isFinite(
                currentPrice
            ) ||
            purchasePrice <= 0 ||
            currentPrice < 0
        ) {

            result.style.display =
                "block";


            result.innerHTML = `

                <div style="
                    padding:14px;
                    border-radius:10px;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                    color:#c2410c;
                    font-size:14px;
                ">

                    Please enter valid prices.

                </div>

            `;


            return;

        }


        /*
         * CURRENT PRICE IS HIGHER
         */

        if (
            currentPrice >
            purchasePrice
        ) {

            const difference =
                currentPrice -
                purchasePrice;


            const percentage =
                (
                    difference /
                    purchasePrice
                ) * 100;


            result.style.display =
                "block";


            result.innerHTML = `

                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                    color:#c2410c;
                ">

                    The current price is

                    <strong>
                        ${formatMoney(
                            difference,
                            "USD"
                        )}
                    </strong>

                    higher than your
                    purchase price.

                </div>

            `;


            showSavingsModal({
                amount:0,
                percentage:percentage,
                purchasePrice:
                    purchasePrice,
                currentPrice:
                    currentPrice,
                noSaving:true,
                higherBy:
                    difference
            });


            return;

        }


        /*
         * SAME PRICE
         */

        if (
            currentPrice ===
            purchasePrice
        ) {

            result.style.display =
                "block";


            result.innerHTML = `

                <div style="
                    padding:16px;
                    border-radius:12px;
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                    color:#475569;
                ">

                    The current price is the
                    same as your purchase price.
                    There is no saving.

                </div>

            `;


            showSavingsModal({
                amount:0,
                percentage:0,
                purchasePrice:
                    purchasePrice,
                currentPrice:
                    currentPrice,
                noSaving:true,
                higherBy:0
            });


            return;

        }


        /*
         * ACTUAL SAVING
         */

        const saving =
            purchasePrice -
            currentPrice;


        const percentage =
            (
                saving /
                purchasePrice
            ) * 100;


        result.style.display =
            "block";


        result.innerHTML = `

            <div style="
                padding:18px;
                border-radius:12px;
                background:#f0fdf4;
                border:1px solid #bbf7d0;
                color:#166534;
            ">

                <div style="
                    font-size:14px;
                    margin-bottom:6px;
                ">
                    Potential Savings
                </div>


                <div style="
                    font-size:26px;
                    font-weight:800;
                    line-height:1.2;
                    margin-bottom:5px;
                ">

                    ${formatMoney(
                        saving,
                        "USD"
                    )}

                </div>


                <div style="
                    font-size:14px;
                    font-weight:700;
                ">

                    You could save
                    ${percentage.toFixed(1)}%

                </div>

            </div>

        `;


        /*
         * SHOW POPUP
         */

        showSavingsModal({
            amount:
                saving,

            percentage:
                percentage,

            purchasePrice:
                purchasePrice,

            currentPrice:
                currentPrice,

            noSaving:false,

            higherBy:0
        });

    }


    /*
     * FORM SUBMIT
     *
     * THIS IS THE IMPORTANT FIX.
     */

    form.addEventListener(
        "submit",
        calculateSavings
    );


    /*
     * EXTRA CLICK PROTECTION
     */

    const calculateButton =
        form.querySelector(
            "button[type='submit'], input[type='submit']"
        );


    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                /*
                 * Trigger calculation directly.
                 */

                if (
                    typeof form.checkValidity ===
                    "function" &&
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    return;

                }


                calculateSavings(
                    event
                );

            }
        );

    }


    /*
     * ENTER KEY
     */

    purchaseInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                calculateSavings(
                    event
                );

            }

        }
    );


    currentInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                calculateSavings(
                    event
                );

            }

        }
    );


    console.log(
        "CheckerDiscount Savings Calculator 8.0: Ready"
    );

}


/* =========================================================
   SAVINGS MODAL
   ========================================================= */

function showSavingsModal(
    data
) {

    closeSavingsModal();


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "checkerSavingsModal";


    overlay.className =
        "checker-savings-overlay";


    const amount =
        Number(
            data.amount || 0
        );


    const percentage =
        Number(
            data.percentage || 0
        );


    let title =
        "Your Potential Savings";


    let amountText =
        formatMoney(
            amount,
            "USD"
        );


    let percentText =
        `You could save ${percentage.toFixed(1)}%`;


    let details =
        `Purchase price: ${formatMoney(
            data.purchasePrice,
            "USD"
        )}<br>
        Current price: ${formatMoney(
            data.currentPrice,
            "USD"
        )}`;


    if (
        data.noSaving
    ) {

        if (
            data.higherBy > 0
        ) {

            title =
                "No Savings Detected";


            amountText =
                "$0.00";


            percentText =
                "The current price is higher";


            details =
                `The current price is ${formatMoney(
                    data.higherBy,
                    "USD"
                )} higher than your purchase price.`;

        } else {

            title =
                "No Price Saving";


            amountText =
                "$0.00";


            percentText =
                "The prices are the same";


            details =
                `Purchase price and current price are both ${formatMoney(
                    data.purchasePrice,
                    "USD"
                )}.`;

        }

    }


    overlay.innerHTML = `

        <div
            class="checker-savings-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkerSavingsTitle"
        >


            <button
                type="button"
                class="checker-savings-close"
                id="checkerSavingsClose"
                aria-label="Close"
            >
                ×
            </button>


            <div class="
                checker-savings-icon
            ">
                $
            </div>


            <h2
                id="checkerSavingsTitle"
                class="checker-savings-title"
            >
                ${escapeHTML(
                    title
                )}
            </h2>


            <div class="
                checker-savings-amount
            ">

                ${escapeHTML(
                    amountText
                )}

            </div>


            <div class="
                checker-savings-percent
            ">

                ${escapeHTML(
                    percentText
                )}

            </div>


            <div class="
                checker-savings-details
            ">

                ${details}

            </div>


            <button
                type="button"
                class="checker-savings-done"
                id="checkerSavingsDone"
            >
                Done
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    document.body.classList.add(
        "checker-modal-open"
    );


    const closeButton =
        overlay.querySelector(
            "#checkerSavingsClose"
        );


    const doneButton =
        overlay.querySelector(
            "#checkerSavingsDone"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSavingsModal
        );

    }


    if (doneButton) {

        doneButton.addEventListener(
            "click",
            closeSavingsModal
        );

    }


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeSavingsModal();

            }

        }
    );

}


/* =========================================================
   CLOSE SAVINGS MODAL
   ========================================================= */

function closeSavingsModal() {

    const modal =
        document.getElementById(
            "checkerSavingsModal"
        );


    if (modal) {

        modal.remove();

    }


    document.body.classList.remove(
        "checker-modal-open"
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
        .forEach(
            link => {

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

            }
        );

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
                style:
                    "currency",

                currency:
                    currency,

                maximumFractionDigits:
                    2
            }
        ).format(
            Number(value)
        );


    } catch (error) {

        return `
            ${currency}
            ${Number(value).toFixed(2)}
        `;

    }

}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeHttpUrl(
    value
) {

    if (!value) {

        return "";

    }


    try {

        const url =
            new URL(value);


        if (
            url.protocol ===
                "https:" ||
            url.protocol ===
                "http:"
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

function escapeHTML(
    value
) {

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

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   GLOBAL REFRESH
   ========================================================= */

window.refreshCheckerDiscountDeals =
    function () {

        loadDeals();

    };
