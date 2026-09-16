/* =========================================================
   CHECKERDISCOUNT - APP.JS
   Version 8.1
   Deals + Featured Deal + Search + Category
   Savings + Share + Mobile Menu
   ========================================================= */

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

/*
 * =========================================================
 * FEATURED DEAL
 * =========================================================
 *
 * TEST MODE:
 * Deal ID 47 is currently used as Featured Deal.
 *
 * Later this can be controlled from Admin Panel/database.
 */
const FEATURED_DEAL_ID = 47;


/* =========================================================
   GLOBAL DEAL DATA
   ========================================================= */

let checkerDiscountDeals = [];

let currentDealSearch = "";

let currentDealCategory = "All";


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    injectDealStyles();

    loadDeals();

    setupSavingsChecker();

    setupMobileMenu();

    setupSharePopup();

});


/* =========================================================
   INJECT DEAL / SAVINGS STYLES
   ========================================================= */

function injectDealStyles() {

    if (
        document.getElementById(
            "checkerDiscountNewStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "checkerDiscountNewStyles";


    style.textContent = `

        /* =========================================
           MAIN DEAL BUTTON
           ========================================= */

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


        /* =========================================
           SHARE BUTTON
           ========================================= */

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


        /* =========================================
           SAVINGS BADGE
           ========================================= */

        .checker-potential-savings {

            display:inline-flex;

            flex-direction:column;

            justify-content:center;

            gap:2px;

            padding:
                10px 15px;

            min-width:118px;

            box-sizing:border-box;

            border-radius:12px;

            background:
                linear-gradient(
                    135deg,
                    #10b981,
                    #16a34a
                );

            color:#ffffff;

            box-shadow:
                0 8px 20px
                rgba(16,185,129,.22);

        }


        .checker-potential-savings-label {

            font-size:11px;

            font-weight:600;

            line-height:1.2;

            opacity:.92;

        }


        .checker-potential-savings-value {

            font-size:20px;

            font-weight:800;

            line-height:1.1;

        }


        /* =========================================
           LIMITED OFFER
           ========================================= */

        .checker-limited-offer {

            display:inline-flex;

            align-items:center;

            gap:6px;

            margin-top:10px;

            padding:
                6px 10px;

            border-radius:7px;

            background:#fff7ed;

            border:
                1px solid #fed7aa;

            color:#c2410c;

            font-size:11px;

            font-weight:800;

            letter-spacing:.2px;

            line-height:1;

            white-space:nowrap;

        }


        /* =========================================
           VERIFIED
           ========================================= */

        .checker-verified-badge {

            display:inline-flex;

            align-items:center;

            gap:5px;

            padding:
                5px 9px;

            border-radius:999px;

            background:#ecfdf5;

            color:#047857;

            border:
                1px solid #a7f3d0;

            font-size:11px;

            font-weight:700;

            line-height:1;

        }


        /* =========================================
           SEARCH / CATEGORY
           ========================================= */

        .checker-deal-tools {

            display:flex;

            gap:10px;

            flex-wrap:wrap;

            margin:
                0 0 22px;

        }


        .checker-search-wrap {

            flex:
                1 1 260px;

            position:relative;

        }


        .checker-search-input {

            width:100%;

            box-sizing:border-box;

            min-height:48px;

            padding:
                0 16px 0 44px;

            border:
                1px solid #dbe3ef;

            border-radius:12px;

            background:#ffffff;

            color:#0f172a;

            font-size:14px;

            outline:none;

            transition:
                border-color .2s ease,
                box-shadow .2s ease;

        }


        .checker-search-input:focus {

            border-color:#2563eb;

            box-shadow:
                0 0 0 3px
                rgba(37,99,235,.10);

        }


        .checker-search-icon {

            position:absolute;

            left:15px;

            top:50%;

            transform:
                translateY(-50%);

            color:#64748b;

            font-size:18px;

            pointer-events:none;

        }


        .checker-category-select {

            flex:
                0 1 190px;

            min-height:48px;

            padding:
                0 14px;

            border:
                1px solid #dbe3ef;

            border-radius:12px;

            background:#ffffff;

            color:#334155;

            font-size:14px;

            outline:none;

            cursor:pointer;

        }


        .checker-results-count {

            margin:
                -10px 0 18px;

            color:#64748b;

            font-size:13px;

        }


        /* =========================================
           FEATURED DEAL
           ========================================= */

        .checker-featured-wrap {

            margin:
                0 0 30px;

        }


        .checker-featured-card {

            position:relative;

            overflow:hidden;

            border:
                1px solid #dbe3ef;

            border-radius:18px;

            background:#ffffff;

            box-shadow:
                0 12px 35px
                rgba(15,23,42,.08);

        }


        .checker-featured-inner {

            display:grid;

            grid-template-columns:
                minmax(0,1fr)
                auto;

            gap:20px;

            align-items:center;

            padding:24px;

        }


        .checker-featured-label {

            display:inline-flex;

            align-items:center;

            gap:6px;

            margin-bottom:12px;

            padding:
                6px 10px;

            border-radius:999px;

            background:#eff6ff;

            color:#2563eb;

            font-size:11px;

            font-weight:800;

            letter-spacing:.3px;

        }


        .checker-featured-title {

            margin:0 0 10px;

            color:#0f172a;

            font-size:24px;

            line-height:1.25;

            font-weight:800;

        }


        .checker-featured-store {

            margin-bottom:10px;

            color:#64748b;

            font-size:14px;

        }


        .checker-featured-price {

            display:flex;

            align-items:baseline;

            gap:10px;

            flex-wrap:wrap;

            margin-top:10px;

        }


        .checker-featured-new-price {

            color:#0f172a;

            font-size:30px;

            font-weight:800;

        }


        .checker-featured-old-price {

            color:#94a3b8;

            font-size:16px;

            text-decoration:line-through;

        }


        .checker-featured-actions {

            display:flex;

            align-items:center;

            gap:10px;

            flex-wrap:wrap;

            margin-top:16px;

        }


        .checker-featured-saving-box {

            min-width:145px;

        }


        @media (max-width:700px) {

            .checker-featured-inner {

                grid-template-columns:1fr;

                padding:20px;

            }


            .checker-featured-title {

                font-size:21px;

            }


            .checker-featured-new-price {

                font-size:26px;

            }


            .checker-featured-saving-box {

                width:100%;

            }

        }


        /* =========================================
           SHARE POPUP
           ========================================= */

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


        /* =========================================
           SAVINGS MODAL
           ========================================= */

        .checker-savings-overlay {

            position:fixed;

            inset:0;

            z-index:1000000;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:20px;

            background:
                rgba(15,23,42,.55);

            backdrop-filter:
                blur(4px);

        }


        .checker-savings-modal {

            position:relative;

            width:min(
                390px,
                100%
            );

            padding:28px;

            box-sizing:border-box;

            border-radius:20px;

            background:#ffffff;

            text-align:center;

            box-shadow:
                0 25px 80px
                rgba(0,0,0,.25);

            animation:
                checkerSavingsIn
                .2s
                ease-out;

        }


        @keyframes checkerSavingsIn {

            from {

                opacity:0;

                transform:
                    translateY(15px)
                    scale(.97);

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

            font-size:20px;

            cursor:pointer;

        }


        .checker-savings-icon {

            width:58px;

            height:58px;

            margin:
                0 auto 12px;

            display:flex;

            align-items:center;

            justify-content:center;

            border-radius:50%;

            background:#dcfce7;

            color:#16a34a;

            font-size:28px;

        }


        .checker-savings-heading {

            margin:0;

            color:#0f172a;

            font-size:20px;

            font-weight:800;

        }


        .checker-savings-amount {

            margin:
                10px 0 4px;

            color:#16a34a;

            font-size:36px;

            font-weight:900;

        }


        .checker-savings-percent {

            color:#047857;

            font-size:14px;

            font-weight:800;

        }


        .checker-savings-details {

            margin-top:18px;

            padding:13px;

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

            background:#2563eb;

            color:#ffffff;

            font-size:14px;

            font-weight:700;

            cursor:pointer;

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
            deals;


        renderFeaturedDeal(
            deals
        );


        setupDealSearch(
            container
        );


        renderFilteredDeals();


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
   FEATURED DEAL
   ========================================================= */

function renderFeaturedDeal(
    deals
) {

    /*
     * Find selected deal.
     */

    let featured =
        deals.find(
            deal =>
                Number(deal.id) ===
                Number(FEATURED_DEAL_ID)
        );


    /*
     * If selected deal does not exist,
     * use first verified deal.
     */

    if (!featured && deals.length > 0) {

        featured =
            deals[0];

    }


    /*
     * Existing HTML hero section
     */

    const heroSection =
        findDealPreviewSection();


    /*
     * No verified deals.
     */

    if (!featured) {

        if (heroSection) {

            heroSection.innerHTML = `

                <div style="
                    padding:30px;
                    text-align:center;
                    color:#64748b;
                ">

                    No Featured Deal Available

                </div>

            `;

        }

        return;

    }


    /*
     * Create featured HTML.
     */

    const featuredHTML =
        buildFeaturedHTML(
            featured
        );


    /*
     * If existing Deal Preview section
     * is found, replace its inside content.
     */

    if (heroSection) {

        heroSection.innerHTML =
            featuredHTML;

        heroSection.classList.add(
            "checker-featured-wrap"
        );

    } else {

        /*
         * Fallback:
         * Insert a new Featured Deal
         * before regular deals.
         */

        const container =
            document.getElementById(
                "discountsContainer"
            );


        if (
            container &&
            container.parentNode
        ) {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "checker-featured-wrap";


            wrapper.innerHTML =
                featuredHTML;


            container.parentNode.insertBefore(
                wrapper,
                container
            );

        }

    }

}


/* =========================================================
   FIND EXISTING DEAL PREVIEW
   ========================================================= */

function findDealPreviewSection() {

    const elements =
        document.querySelectorAll(
            "section, article, div"
        );


    for (
        const element of elements
    ) {

        const text =
            String(
                element.textContent || ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim()
                .toUpperCase();


        if (
            text.startsWith(
                "DEAL PREVIEW"
            ) &&
            text.length < 2500
        ) {

            /*
             * Prefer this element itself.
             */

            return element;

        }

    }


    return null;

}


/* =========================================================
   BUILD FEATURED HTML
   ========================================================= */

function buildFeaturedHTML(
    deal
) {

    const title =
        escapeHTML(
            deal.title ||
            "Featured Deal"
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


    const productUrl =
        safeHttpUrl(
            deal.url
        );


    const savings =
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice)

            ? Math.max(
                oldPrice -
                newPrice,
                0
            )

            : 0;


    let discount =
        Number(
            deal.discount_percent
        );


    if (
        !Number.isFinite(discount) ||
        discount <= 0
    ) {

        if (
            oldPrice > 0 &&
            newPrice < oldPrice
        ) {

            discount =
                (
                    (
                        oldPrice -
                        newPrice
                    ) /
                    oldPrice
                ) * 100;

        }

    }


    if (
        !Number.isFinite(discount)
    ) {

        discount = 0;

    }


    return `

        <div class="
            checker-featured-card
        ">

            <div class="
                checker-featured-inner
            ">


                <div>


                    <div class="
                        checker-featured-label
                    ">

                        ⭐ FEATURED DEAL

                        <span
                            class="
                                checker-verified-badge
                            "
                            style="
                                margin-left:4px;
                            "
                        >
                            ✓ VERIFIED
                        </span>

                    </div>


                    <div class="
                        checker-featured-store
                    ">

                        Available at

                        <strong>
                            ${store}
                        </strong>

                    </div>


                    <h2 class="
                        checker-featured-title
                    ">

                        ${title}

                    </h2>


                    <div class="
                        checker-featured-price
                    ">

                        <span class="
                            checker-featured-new-price
                        ">

                            ${formatMoney(
                                newPrice,
                                currency
                            )}

                        </span>


                        <span class="
                            checker-featured-old-price
                        ">

                            ${formatMoney(
                                oldPrice,
                                currency
                            )}

                        </span>


                    </div>


                    <div style="
                        margin-top:10px;
                    ">

                        <strong style="
                            color:#c2410c;
                            font-size:14px;
                        ">

                            SAVE

                            ${formatMoney(
                                savings,
                                currency
                            )}

                            ·

                            ${discount.toFixed(2)}% OFF

                        </strong>

                    </div>


                    <div class="
                        checker-limited-offer
                    ">

                        🔥 LIMITED TIME OFFER

                    </div>


                    <div class="
                        checker-featured-actions
                    ">


                        ${
                            productUrl

                                ? `

                                    <a
                                        class="
                                            checker-main-deal-btn
                                        "
                                        href="${escapeAttribute(
                                            productUrl
                                        )}"
                                        target="_blank"
                                        rel="
                                            nofollow
                                            sponsored
                                            noopener
                                            noreferrer
                                        "
                                    >

                                        Check This Deal →

                                    </a>

                                `

                                : ""

                        }


                    </div>


                </div>


                <div class="
                    checker-potential-savings
                    checker-featured-saving-box
                ">

                    <span class="
                        checker-potential-savings-label
                    ">

                        Potential Savings

                    </span>


                    <span class="
                        checker-potential-savings-value
                    ">

                        ${formatMoney(
                            savings,
                            currency
                        )}

                    </span>

                </div>


            </div>

        </div>

    `;

}


/* =========================================================
   SETUP SEARCH + CATEGORY
   ========================================================= */

function setupDealSearch(
    container
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
                class="
                    checker-search-input
                "
                placeholder="
                    Search deals, products or stores...
                "
                autocomplete="off"
            >

        </div>


        <select
            id="checkerDealCategory"
            class="
                checker-category-select
            "
        >

            <option value="All">
                All Categories
            </option>

            <option value="Electronics">
                Electronics
            </option>

            <option value="Home & Kitchen">
                Home & Kitchen
            </option>

            <option value="Fashion">
                Fashion
            </option>

            <option value="Beauty">
                Beauty
            </option>

            <option value="Sports">
                Sports
            </option>

            <option value="Toys & Kids">
                Toys & Kids
            </option>

            <option value="Automotive">
                Automotive
            </option>

            <option value="Other">
                Other
            </option>

        </select>

    `;


    if (
        container.parentNode
    ) {

        container.parentNode.insertBefore(
            tools,
            container
        );

    }


    const search =
        document.getElementById(
            "checkerDealSearch"
        );


    const category =
        document.getElementById(
            "checkerDealCategory"
        );


    if (search) {

        search.value =
            currentDealSearch;


        search.addEventListener(
            "input",
            () => {

                currentDealSearch =
                    search.value
                        .trim()
                        .toLowerCase();


                renderFilteredDeals();

            }
        );

    }


    if (category) {

        category.value =
            currentDealCategory;


        category.addEventListener(
            "change",
            () => {

                currentDealCategory =
                    category.value;


                renderFilteredDeals();

            }
        );

    }

}


/* =========================================================
   FILTER + RENDER REGULAR DEALS
   ========================================================= */

function renderFilteredDeals() {

    const container =
        document.getElementById(
            "discountsContainer"
        );


    if (!container) {

        return;

    }


    /*
     * Remove Featured Deal from regular deals.
     */

    let regularDeals =
        checkerDiscountDeals.filter(
            deal =>
                Number(deal.id) !==
                Number(FEATURED_DEAL_ID)
        );


    /*
     * Search
     */

    if (
        currentDealSearch
    ) {

        regularDeals =
            regularDeals.filter(
                deal => {

                    const title =
                        String(
                            deal.title ||
                            ""
                        ).toLowerCase();


                    const store =
                        String(
                            deal.store ||
                            ""
                        ).toLowerCase();


                    const asin =
                        String(
                            deal.asin ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(
                            currentDealSearch
                        ) ||

                        store.includes(
                            currentDealSearch
                        ) ||

                        asin.includes(
                            currentDealSearch
                        )
                    );

                }
            );

    }


    /*
     * Category
     */

    if (
        currentDealCategory !==
        "All"
    ) {

        regularDeals =
            regularDeals.filter(
                deal =>
                    getDealCategory(
                        deal
                    ) ===
                    currentDealCategory
            );

    }


    /*
     * Empty
     */

    if (
        regularDeals.length === 0
    ) {

        container.innerHTML = `

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

                    No deals found

                </h3>


                <p style="
                    margin:0;
                ">

                    Try another search
                    or category.

                </p>

            </div>

        `;


        return;

    }


    /*
     * Render
     */

    container.innerHTML = "";


    regularDeals.forEach(
        deal => {

            renderDeal(
                deal,
                container
            );

        }
    );


    /*
     * Result count
     */

    updateResultsCount(
        regularDeals.length
    );

}


/* =========================================================
   RESULTS COUNT
   ========================================================= */

function updateResultsCount(
    count
) {

    let countElement =
        document.getElementById(
            "checkerResultsCount"
        );


    if (!countElement) {

        const container =
            document.getElementById(
                "discountsContainer"
            );


        if (
            !container ||
            !container.parentNode
        ) {

            return;

        }


        countElement =
            document.createElement(
                "div"
            );


        countElement.id =
            "checkerResultsCount";


        countElement.className =
            "checker-results-count";


        container.parentNode.insertBefore(
            countElement,
            container
        );

    }


    countElement.textContent =
        `${count} verified deal${
            count === 1 ? "" : "s"
        } found`;

}


/* =========================================================
   GET CATEGORY
   ========================================================= */

function getDealCategory(
    deal
) {

    /*
     * If category is added later
     * in D1, use it automatically.
     */

    if (
        deal.category &&
        String(
            deal.category
        ).trim()
    ) {

        return String(
            deal.category
        ).trim();

    }


    const text =
        `${deal.title || ""} ${
            deal.store || ""
        }`
            .toLowerCase();


    if (
        /iphone|ipad|phone|mobile|laptop|computer|tablet|tv|television|headphone|earbuds|speaker|camera|monitor|keyboard|mouse|charger|usb|electronic|gaming|console/.test(
            text
        )
    ) {

        return "Electronics";

    }


    if (
        /mixer|blender|kitchen|cook|coffee|vacuum|home|furniture|chair|desk|pan|pot|oven|air fryer|appliance|bed|lamp/.test(
            text
        )
    ) {

        return "Home & Kitchen";

    }


    if (
        /shirt|shoe|shoes|dress|jeans|jacket|clothing|fashion|bag|handbag|watch|sneaker/.test(
            text
        )
    ) {

        return "Fashion";

    }


    if (
        /beauty|makeup|skin|skincare|hair|shampoo|perfume|cosmetic|lotion|cream/.test(
            text
        )
    ) {

        return "Beauty";

    }


    if (
        /sport|fitness|gym|football|soccer|basketball|tennis|running|bike|bicycle|exercise|yoga/.test(
            text
        )
    ) {

        return "Sports";

    }


    if (
        /toy|toys|kids|baby|children|lego|doll|game/.test(
            text
        )
    ) {

        return "Toys & Kids";

    }


    if (
        /car|auto|automotive|vehicle|truck|motorcycle|tire|tyre|dash cam/.test(
            text
        )
    ) {

        return "Automotive";

    }


    return "Other";

}


/* =========================================================
   RENDER REGULAR DEAL
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
        !Number.isFinite(discount)
    ) {

        discount = 0;

    }


    if (
        discount <= 0 &&
        oldPrice > 0 &&
        newPrice < oldPrice
    ) {

        discount =
            (
                (
                    oldPrice -
                    newPrice
                ) /
                oldPrice
            ) * 100;

    }


    const savings =
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice)

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


    const isVerified =
        String(
            deal.verification_status ||
            ""
        ).toUpperCase() ===
        "VERIFIED";


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


    card.innerHTML = `

        ${imageHTML}


        <div class="
            deal-card-content
        ">


            <div
                class="deal-top-line"
                style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                    flex-wrap:wrap;
                "
            >

                <div class="
                    deal-store
                ">

                    ${store}

                </div>


                <div class="
                    deal-discount
                ">

                    ${discount.toFixed(0)}% OFF

                </div>


                ${
                    isVerified

                        ? `

                            <span class="
                                checker-verified-badge
                            ">

                                ✓ VERIFIED

                            </span>

                        `

                        : ""

                }

            </div>


            <h3 class="
                deal-title
            ">

                ${title}

            </h3>


            <div class="
                deal-price-row
            ">

                <div class="
                    deal-price
                ">

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

                            <div class="
                                deal-old-price
                            ">

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

                        <div class="
                            deal-savings
                        ">

                            SAVE

                            ${formatMoney(
                                savings,
                                currency
                            )}

                            ·

                            ${discount.toFixed(2)}% OFF

                        </div>

                    `

                    : ""

            }


            <div class="
                checker-limited-offer
            ">

                🔥 LIMITED TIME OFFER

            </div>


            <div style="
                margin-top:14px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                flex-wrap:wrap;
            ">


                <div class="
                    checker-potential-savings
                ">

                    <span class="
                        checker-potential-savings-label
                    ">

                        Potential Savings

                    </span>


                    <span class="
                        checker-potential-savings-value
                    ">

                        ${formatMoney(
                            savings,
                            currency
                        )}

                    </span>

                </div>


            </div>


            <div style="
                margin-top:10px;
                color:#64748b;
                font-size:13px;
            ">

                Verified deal checked
                by CheckerDiscount.

            </div>


            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                flex-wrap:wrap;
                margin-top:15px;
            ">


                ${
                    productUrl

                        ? `

                            <a
                                class="
                                    checker-main-deal-btn
                                "
                                href="${escapeAttribute(
                                    productUrl
                                )}"
                                target="_blank"
                                rel="
                                    nofollow
                                    sponsored
                                    noopener
                                    noreferrer
                                "
                            >

                                <span>
                                    Check This Deal
                                </span>

                                <span>
                                    ↗
                                </span>

                            </a>

                        `

                        : `

                            <button
                                type="button"
                                disabled
                                class="
                                    checker-main-deal-btn
                                "
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
            class="
                checker-share-box
            "
            role="dialog"
            aria-modal="true"
        >

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
                margin-bottom:5px;
            ">

                <h3 class="
                    checker-share-title
                ">

                    Share this deal

                </h3>


                <button
                    type="button"
                    class="
                        checker-share-close
                    "
                    data-share-close
                    aria-label="Close"
                >

                    ×

                </button>

            </div>


            <p class="
                checker-share-subtitle
            ">

                Share this deal with your
                friends or copy the link.

            </p>


            <input
                class="
                    checker-share-url
                "
                value="${escapeAttribute(
                    url
                )}"
                readonly
            >


            <div class="
                checker-share-options
            ">


                <a
                    class="
                        checker-share-option
                    "
                    href="${escapeAttribute(
                        whatsappUrl
                    )}"
                    target="_blank"
                    rel="
                        noopener
                        noreferrer
                    "
                >

                    💬 WhatsApp

                </a>


                <a
                    class="
                        checker-share-option
                    "
                    href="${escapeAttribute(
                        facebookUrl
                    )}"
                    target="_blank"
                    rel="
                        noopener
                        noreferrer
                    "
                >

                    f Facebook

                </a>


                <a
                    class="
                        checker-share-option
                    "
                    href="${escapeAttribute(
                        xUrl
                    )}"
                    target="_blank"
                    rel="
                        noopener
                        noreferrer
                    "
                >

                    𝕏 X

                </a>


                <a
                    class="
                        checker-share-option
                    "
                    href="${escapeAttribute(
                        emailUrl
                    )}"
                >

                    ✉ Email

                </a>


                <button
                    type="button"
                    class="
                        checker-share-option
                        checker-share-copy
                    "
                    id="checkerCopyShare"
                >

                    🔗 Copy Link

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
   CLOSE SHARE
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
   SHARE ESCAPE KEY
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
   SAVINGS CHECKER
   ========================================================= */

function setupSavingsChecker() {

    const form =
        document.getElementById(
            "refundForm"
        );


    if (!form) {

        console.warn(
            "CheckerDiscount: refundForm not found."
        );

        return;

    }


    const oldInput =
        document.getElementById(
            "purchasePrice"
        );


    const newInput =
        document.getElementById(
            "currentPrice"
        );


    const retailerInput =
        document.getElementById(
            "retailer"
        );


    const result =
        document.getElementById(
            "refundResult"
        );


    if (
        !oldInput ||
        !newInput
    ) {

        console.warn(
            "CheckerDiscount: calculator price inputs not found."
        );

        return;

    }


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


    function calculateSavings(
        event
    ) {

        if (event) {

            event.preventDefault();

            event.stopPropagation();

        }


        const oldPrice =
            getPrice(
                oldInput.value
            );


        const newPrice =
            getPrice(
                newInput.value
            );


        const retailer =
            retailerInput &&
            retailerInput.value.trim()

                ? retailerInput.value.trim()

                : "the retailer";


        if (
            !Number.isFinite(
                oldPrice
            ) ||
            !Number.isFinite(
                newPrice
            ) ||
            oldPrice <= 0 ||
            newPrice < 0
        ) {

            showCalculatorInlineError(
                result,
                "Please enter valid prices."
            );


            return false;

        }


        if (
            newPrice >= oldPrice
        ) {

            showCalculatorInlineError(
                result,
                "There is no saving at this price."
            );


            return false;

        }


        const saving =
            oldPrice -
            newPrice;


        const percentage =
            (
                saving /
                oldPrice
            ) * 100;


        showSavingsModal(
            retailer,
            oldPrice,
            newPrice,
            saving,
            percentage
        );


        return false;

    }


    form.addEventListener(
        "submit",
        calculateSavings
    );


    /*
     * Protect against browser/form navigation.
     */

    form.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (
                button &&
                (
                    button.type ===
                        "submit" ||

                    button.classList.contains(
                        "calculate-button"
                    )
                )
            ) {

                event.preventDefault();

            }

        },
        true
    );


    console.log(
        "CheckerDiscount Savings Calculator: Ready"
    );

}


/* =========================================================
   INLINE CALCULATOR ERROR
   ========================================================= */

function showCalculatorInlineError(
    result,
    message
) {

    if (!result) {

        alert(message);

        return;

    }


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

            ${escapeHTML(
                message
            )}

        </div>

    `;

}


/* =========================================================
   SAVINGS MODAL
   ========================================================= */

function showSavingsModal(
    retailer,
    oldPrice,
    newPrice,
    saving,
    percentage
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


    overlay.innerHTML = `

        <div
            class="
                checker-savings-modal
            "
            role="dialog"
            aria-modal="true"
        >

            <button
                type="button"
                class="
                    checker-savings-close
                "
                data-savings-close
                aria-label="Close"
            >

                ×

            </button>


            <div class="
                checker-savings-icon
            ">

                ✓

            </div>


            <h3 class="
                checker-savings-heading
            ">

                Potential Savings

            </h3>


            <div class="
                checker-savings-amount
            ">

                ${formatMoney(
                    saving,
                    "USD"
                )}

            </div>


            <div class="
                checker-savings-percent
            ">

                ${percentage.toFixed(1)}% OFF

            </div>


            <div class="
                checker-savings-details
            ">

                If the price dropped from

                <strong>
                    ${formatMoney(
                        oldPrice,
                        "USD"
                    )}
                </strong>

                to

                <strong>
                    ${formatMoney(
                        newPrice,
                        "USD"
                    )}
                </strong>

                at

                <strong>
                    ${escapeHTML(
                        retailer
                    )}
                </strong>,

                the potential saving is

                <strong>
                    ${formatMoney(
                        saving,
                        "USD"
                    )}
                </strong>.

            </div>


            <button
                type="button"
                class="
                    checker-savings-done
                "
                data-savings-close
            >

                Done

            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay ||
                event.target.closest(
                    "[data-savings-close]"
                )
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


    /*
     * Prevent duplicate listener.
     */

    if (
        menuButton.dataset
            .checkerMenuReady ===
        "1"
    ) {

        return;

    }


    menuButton.dataset
        .checkerMenuReady =
        "1";


    menuButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            mobileMenu.classList.toggle(
                "active"
          
