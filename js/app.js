// CheckerDiscount app.js
// Country + Category + Currency + Price Comparison
// Existing deal, spotlight, savings, watchlist and menu functions preserved.

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

let globalDeals = [];
let selectedCountry = localStorage.getItem("cd_country") || "";
let selectedCategory = "all";

const COUNTRY_DATA = [
    ["US", "🇺🇸", "United States", "USD", "$"],
    ["GB", "🇬🇧", "United Kingdom", "GBP", "£"],
    ["SA", "🇸🇦", "Saudi Arabia", "SAR", "ر.س"],
    ["AE", "🇦🇪", "United Arab Emirates", "AED", "د.إ"],
    ["OM", "🇴🇲", "Oman", "OMR", "ر.ع"],
    ["PK", "🇵🇰", "Pakistan", "PKR", "₨"],
    ["IN", "🇮🇳", "India", "INR", "₹"],
    ["CA", "🇨🇦", "Canada", "CAD", "$"],
    ["AU", "🇦🇺", "Australia", "AUD", "$"],
    ["DE", "🇩🇪", "Germany", "EUR", "€"],
    ["FR", "🇫🇷", "France", "EUR", "€"],
    ["IT", "🇮🇹", "Italy", "EUR", "€"],
    ["ES", "🇪🇸", "Spain", "EUR", "€"],
    ["NL", "🇳🇱", "Netherlands", "EUR", "€"],
    ["BE", "🇧🇪", "Belgium", "EUR", "€"],
    ["AT", "🇦🇹", "Austria", "EUR", "€"],
    ["CH", "🇨🇭", "Switzerland", "CHF", "Fr."],
    ["NO", "🇳🇴", "Norway", "NOK", "kr"],
    ["SE", "🇸🇪", "Sweden", "SEK", "kr"],
    ["DK", "🇩🇰", "Denmark", "DKK", "kr"],
    ["NZ", "🇳🇿", "New Zealand", "NZD", "$"],
    ["JP", "🇯🇵", "Japan", "JPY", "¥"],
    ["CN", "🇨🇳", "China", "CNY", "¥"],
    ["KR", "🇰🇷", "South Korea", "KRW", "₩"],
    ["SG", "🇸🇬", "Singapore", "SGD", "$"],
    ["MY", "🇲🇾", "Malaysia", "MYR", "RM"],
    ["TH", "🇹🇭", "Thailand", "THB", "฿"],
    ["ID", "🇮🇩", "Indonesia", "IDR", "Rp"],
    ["PH", "🇵🇭", "Philippines", "PHP", "₱"],
    ["VN", "🇻🇳", "Vietnam", "VND", "₫"],
    ["TR", "🇹🇷", "Turkey", "TRY", "₺"],
    ["BR", "🇧🇷", "Brazil", "BRL", "R$"],
    ["MX", "🇲🇽", "Mexico", "MXN", "$"],
    ["ZA", "🇿🇦", "South Africa", "ZAR", "R"],
    ["QA", "🇶🇦", "Qatar", "QAR", "ر.ق"],
    ["KW", "🇰🇼", "Kuwait", "KWD", "د.ك"],
    ["BH", "🇧🇭", "Bahrain", "BHD", "د.ب"]
];

document.addEventListener("DOMContentLoaded", () => {
    initializeCountrySystem();
    fetchDealsAndInit();
    initBurgerMenu();
    initExistingTools();
});


/* =========================================================
   COUNTRY SYSTEM
========================================================= */

function initializeCountrySystem() {
    if (!selectedCountry) {
        selectedCountry = detectCountry();
    }

    if (!getCountryInfo(selectedCountry)) {
        selectedCountry = "US";
    }

    localStorage.setItem("cd_country", selectedCountry);

    createCountryUI();
}


function getCountryInfo(code) {
    return COUNTRY_DATA.find(
        item => item[0] === String(code || "").toUpperCase()
    );
}


function detectCountry() {

    const language =
        navigator.language ||
        navigator.userLanguage ||
        "";

    const regionMatch =
        language.match(/[-_]([A-Z]{2})$/i);

    if (regionMatch) {
        const region =
            regionMatch[1].toUpperCase();

        if (getCountryInfo(region)) {
            return region;
        }
    }

    const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    const timezoneMap = {
        "Asia/Muscat": "OM",
        "Asia/Riyadh": "SA",
        "Asia/Dubai": "AE",
        "Asia/Karachi": "PK",
        "Asia/Kolkata": "IN",
        "Asia/Calcutta": "IN",
        "Europe/London": "GB",
        "America/Toronto": "CA",
        "Australia/Sydney": "AU",
        "Asia/Tokyo": "JP",
        "Asia/Shanghai": "CN",
        "Asia/Singapore": "SG",
        "Asia/Kuala_Lumpur": "MY",
        "Europe/Berlin": "DE",
        "Europe/Paris": "FR",
        "Europe/Rome": "IT",
        "Europe/Madrid": "ES",
        "Europe/Amsterdam": "NL",
        "Europe/Zurich": "CH",
        "Europe/Oslo": "NO",
        "Europe/Stockholm": "SE",
        "Europe/Copenhagen": "DK",
        "America/Sao_Paulo": "BR",
        "America/Mexico_City": "MX",
        "Africa/Johannesburg": "ZA",
        "Asia/Qatar": "QA",
        "Asia/Kuwait": "KW",
        "Asia/Bahrain": "BH"
    };

    return timezoneMap[timezone] || "US";
}


function createCountryUI() {

    const marketSection =
        document.getElementById("market-deals");

    if (!marketSection) return;

    let existing =
        document.getElementById("cdCountrySystem");

    if (existing) {
        existing.remove();
    }

    const wrapper =
        document.createElement("div");

    wrapper.id = "cdCountrySystem";

    wrapper.className =
        "mb-5";

    wrapper.innerHTML = `

        <div class="mb-3">

            <h2 class="text-[18px] font-bold text-on-surface">
                Deals in Your Country
            </h2>

            <p class="text-[12px] text-on-surface-variant mt-1">
                Choose your market to see local prices and deals.
            </p>

        </div>

        <div
            id="cdCountryFlags"
            class="flex items-center gap-2 overflow-x-auto pb-2"
            style="scrollbar-width:none;"
        ></div>

        <div
            id="cdCountryMore"
            class="hidden mt-2"
        ></div>

        <div
            id="cdCountryTitle"
            class="mt-3 text-[15px] font-bold text-on-surface"
        ></div>

        <div
            id="cdCategories"
            class="flex items-center gap-2 overflow-x-auto py-2"
            style="scrollbar-width:none;"
        ></div>

    `;

    const firstChild =
        marketSection.firstElementChild;

    marketSection.insertBefore(
        wrapper,
        firstChild
    );

    renderCountryFlags();
    renderCountryTitle();
    loadCountryCategories();
}


function renderCountryFlags() {

    const container =
        document.getElementById("cdCountryFlags");

    if (!container) return;

    const popularCodes = [
        "US",
        "GB",
        "SA",
        "AE",
        "OM",
        "PK",
        "IN",
        "CA",
        "AU",
        "DE"
    ];

    const popular =
        popularCodes
            .map(code => getCountryInfo(code))
            .filter(Boolean);

    const more =
        COUNTRY_DATA.filter(
            country =>
                !popularCodes.includes(country[0])
        );

    container.innerHTML =
        popular.map(country =>
            countryFlagButton(country)
        ).join("") +

        `
        <button
            type="button"
            onclick="toggleMoreCountries()"
            class="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container flex items-center justify-center text-[15px]"
            title="More Countries"
        >
            <span class="material-symbols-outlined text-[20px]">
                more_horiz
            </span>
        </button>
        `;

    const moreContainer =
        document.getElementById("cdCountryMore");

    if (moreContainer) {

        moreContainer.innerHTML = `
            <div class="flex gap-2 overflow-x-auto pb-2">
                ${
                    more.map(country =>
                        countryFlagButton(country)
                    ).join("")
                }
            </div>
        `;
    }
}


function countryFlagButton(country) {

    const selected =
        country[0] === selectedCountry;

    return `
        <button
            type="button"
            onclick="selectCountry('${country[0]}')"
            class="
                cd-country-flag
                flex-shrink-0
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                text-[22px]
                transition-all
                ${
                    selected
                        ? "bg-primary-container ring-2 ring-primary scale-105 shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-high"
                }
            "
            title="${escapeHtml(country[2])}"
            aria-label="${escapeHtml(country[2])}"
        >
            ${country[1]}
        </button>
    `;
}


function toggleMoreCountries() {

    const more =
        document.getElementById("cdCountryMore");

    if (!more) return;

    more.classList.toggle("hidden");
}


async function selectCountry(code) {

    if (!getCountryInfo(code)) return;

    selectedCountry = code;

    selectedCategory = "all";

    localStorage.setItem(
        "cd_country",
        selectedCountry
    );

    renderCountryFlags();
    renderCountryTitle();

    await loadCountryCategories();

    loadDeals(selectedCategory);
}


function renderCountryTitle() {

    const title =
        document.getElementById("cdCountryTitle");

    if (!title) return;

    const country =
        getCountryInfo(selectedCountry);

    if (!country) return;

    title.innerHTML = `
        ${country[1]} ${escapeHtml(country[2])} Deals
    `;
}


/* =========================================================
   COUNTRY CATEGORIES
========================================================= */

async function loadCountryCategories() {

    const container =
        document.getElementById("cdCategories");

    if (!container) return;

    container.innerHTML = `
        <span class="text-xs text-on-surface-variant">
            Loading categories...
        </span>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/categories?country=${encodeURIComponent(selectedCountry)}`
            );

        const data =
            await response.json();

        if (
            !data.success ||
            !Array.isArray(data.categories)
        ) {
            throw new Error("Category loading failed");
        }

        const categories =
            data.categories;

        container.innerHTML = `
            <button
                type="button"
                onclick="selectCategory('all')"
                class="
                    cd-category-btn
                    flex-shrink-0
                    px-3.5
                    py-1.5
                    rounded-xl
                    text-[13px]
                    font-semibold
                    ${
                        selectedCategory === "all"
                            ? "bg-primary-container text-on-primary"
                            : "bg-surface-container text-on-surface-variant"
                    }
                "
            >
                All
            </button>
        `;

        categories.forEach(item => {

            if (!item.category) return;

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold " +
                (
                    selectedCategory.toLowerCase() ===
                    String(item.category).toLowerCase()
                        ? "bg-primary-container text-on-primary"
                        : "bg-surface-container text-on-surface-variant"
                );

            button.textContent =
                `${item.category} (${item.deal_count})`;

            button.onclick =
                () => selectCategory(item.category);

            container.appendChild(button);
        });

    } catch (error) {

        console.error(
            "Failed to load country categories:",
            error
        );

        container.innerHTML = `
            <span class="text-xs text-on-surface-variant">
                No categories available for this country yet.
            </span>
        `;
    }
}


function selectCategory(category) {

    selectedCategory =
        category || "all";

    document
        .querySelectorAll(".cd-category-btn")
        .forEach(button => {

            button.classList.remove(
                "bg-primary-container",
                "text-on-primary"
            );

            button.classList.add(
                "bg-surface-container",
                "text-on-surface-variant"
            );
        });

    const clicked =
        Array.from(
            document.querySelectorAll(".cd-category-btn")
        ).find(
            button =>
                button.textContent
                    .replace(/\s*\(\d+\)\s*$/, "")
                    .trim()
                    .toLowerCase() ===
                String(category)
                    .trim()
                    .toLowerCase()
        );

    if (clicked) {

        clicked.classList.remove(
            "bg-surface-container",
            "text-on-surface-variant"
        );

        clicked.classList.add(
            "bg-primary-container",
            "text-on-primary"
        );
    }

    loadDeals(selectedCategory);
}


/* =========================================================
   FETCH DEALS
========================================================= */

async function fetchDealsAndInit() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/deals?country=${encodeURIComponent(selectedCountry)}`
            );

        const data =
            await response.json();

        if (
            data.success &&
            Array.isArray(data.deals)
        ) {
            globalDeals = data.deals;
        } else {
            globalDeals = [];
        }

    } catch (error) {

        console.error(
            "Failed to fetch deals:",
            error
        );

        globalDeals = [];
    }

    loadSpotlight();
    loadDeals(selectedCategory);
}


/* =========================================================
   SPOTLIGHT
========================================================= */

function loadSpotlight() {

    const deals =
        globalDeals;

    if (deals.length === 0) return;

    let featuredDeal =
        deals.find(
            d =>
                Number(d.is_featured) === 1 ||
                d.isFeatured === true
        );

    if (!featuredDeal) {
        featuredDeal = deals[0];
    }

    const spotlightContainer =
        document.querySelector(
            ".relative.w-full.bg-gradient-to-b"
        );

    if (
        !spotlightContainer ||
        !featuredDeal
    ) return;

    const imgSrc =
        featuredDeal.image_url ||
        featuredDeal.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

    const discountText =
        featuredDeal.discount_percent
            ? `${Math.round(featuredDeal.discount_percent)}% OFF`
            : "Special Offer";

    const oldPrice =
        Number(featuredDeal.old_price || 0);

    const newPrice =
        Number(
            featuredDeal.new_price ||
            featuredDeal.price ||
            0
        );

    const savings =
        oldPrice > newPrice
            ? oldPrice - newPrice
            : 0;

    const showcaseBox =
        spotlightContainer.querySelector(
            ".w-full.mt-2.bg-surface-container-lowest"
        );

    if (!showcaseBox) return;

    showcaseBox.innerHTML = `
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-surface-container-low">

            <div class="flex items-center gap-1 text-primary font-badge-caps text-[11px] font-bold uppercase tracking-wider">

                <span class="material-symbols-outlined text-[15px]">
                    bolt
                </span>

                Deal Spotlight

            </div>

            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold">

                <span class="material-symbols-outlined text-[12px]">
                    verified
                </span>

                ${discountText}

            </span>

        </div>


        <div class="flex gap-3 pt-3">

            <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">

                <img
                    class="w-full h-full object-cover"
                    src="${escapeAttribute(imgSrc)}"
                    alt="Spotlight Deal"
                    onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'"
                >

                <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.5 rounded font-mono">
                    ${escapeHtml(featuredDeal.store || "Store")}
                </div>

            </div>


            <div class="flex flex-col min-w-0 justify-center flex-1">

                <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">

                    <span>
                        ${escapeHtml(featuredDeal.store || "Store")}
                    </span>

                    <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined fill-1">
                        star
                    </span>

                    <span class="font-bold text-on-surface">
                        4.8
                    </span>

                </div>


                <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">
                    ${escapeHtml(featuredDeal.title || "Deal")}
                </h3>


                <div class="flex items-baseline gap-2 mt-1.5">

                    <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">
                        ${formatMoney(
                            newPrice,
                            featuredDeal.currency
                        )}
                    </span>

                    ${
                        oldPrice
                            ? `
                                <span class="font-price-strikethrough text-[13px] text-outline line-through">
                                    ${formatMoney(
                                        oldPrice,
                                        featuredDeal.currency
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </div>


        <div class="mt-3 pt-2.5 border-t border-surface-container flex items-center justify-between">

            <div class="px-2.5 py-1 rounded-lg bg-savings-green-subtle text-savings-green font-bold text-[12px] flex items-center gap-1">

                <span class="material-symbols-outlined text-[14px]">
                    savings
                </span>

                Save ${formatMoney(
                    savings,
                    featuredDeal.currency
                )}

            </div>


            <div class="flex items-center gap-2">

                <button
                    onclick="shareDeal('${encodeURIComponent(featuredDeal.title || "")}', '${escapeAttribute(featuredDeal.url || window.location.href)}')"
                    class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm"
                    title="Share Deal"
                >
                    <span class="material-symbols-outlined text-[18px]">
                        share
                    </span>
                </button>

                <a
                    href="${escapeAttribute(featuredDeal.url || "#")}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                    <span>Check Deal</span>

                    <span class="material-symbols-outlined text-[16px]">
                        arrow_forward
                    </span>

                </a>

            </div>

        </div>
    `;
}


/* =========================================================
   LOAD DEALS
========================================================= */

function loadDeals(filter = "all") {

    const container =
        document.getElementById(
            "discountsContainer"
        );

    if (!container) return;

    let deals =
        Array.isArray(globalDeals)
            ? globalDeals
            : [];

    if (filter !== "all") {

        deals =
            deals.filter(
                deal =>
                    String(
                        deal.category || ""
                    ).toLowerCase() ===
                    String(filter).toLowerCase()
            );
    }

    container.innerHTML = "";

    if (deals.length === 0) {

        const country =
            getCountryInfo(selectedCountry);

        container.innerHTML = `

            <div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">

                <div class="text-3xl mb-2">
                    ${country ? country[1] : "🌍"}
                </div>

                <div class="font-semibold text-on-surface">
                    No deals available yet
                </div>

                <div class="text-xs mt-1">
                    We don't have verified deals in this category for this country yet.
                </div>

            </div>

        `;

        return;
    }


    deals.forEach(deal => {

        const imgSrc =
            deal.image_url ||
            deal.image ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

        const discountText =
            deal.discount_percent
                ? `${Math.round(deal.discount_percent)}% OFF`
                : "Special Deal";

        const priceVal =
            Number(
                deal.new_price ||
                deal.price ||
                0
            );

        const oldPriceVal =
            deal.old_price
                ? Number(deal.old_price)
                : null;

        const country =
            getCountryInfo(
                deal.country_code ||
                selectedCountry
            );

        const card =
            document.createElement("div");

        card.className =
            "bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3";


        card.innerHTML = `

            <div class="flex items-center justify-between gap-2">

                <span class="font-badge-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    ${escapeHtml(
                        deal.store || "Store"
                    )}
                </span>

                <span class="px-2.5 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold flex items-center gap-1">

                    <span class="material-symbols-outlined text-[12px]">
                        verified
                    </span>

                    ${discountText}

                </span>

            </div>


            <div class="flex gap-3">

                <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">

                    <img
                        src="${escapeAttribute(imgSrc)}"
                        class="w-full h-full object-cover"
                        alt="Deal"
                        onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'"
                    >

                </div>


                <div class="flex flex-col min-w-0 justify-center flex-1">

                    <div class="flex items-center gap-1 text-[11px] text-on-surface-variant mb-1">

                        ${
                            country
                                ? `<span>${country[1]}</span>`
                                : `<span>🌍</span>`
                        }

                        <span>·</span>

                        <span>
                            ${escapeHtml(
                                deal.category || "Other"
                            )}
                        </span>

                    </div>


                    <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">
                        ${escapeHtml(
                            deal.title || "Deal"
                        )}
                    </h3>


                    <div class="flex items-baseline gap-2 mt-1.5">

                        <span class="font-headline-sm text-[18px] font-extrabold text-primary-container">
                            ${formatMoney(
                                priceVal,
                                deal.currency
                            )}
                        </span>

                        ${
                            oldPriceVal
                                ? `
                                    <span class="font-price-strikethrough text-[13px] text-outline line-through">
                                        ${formatMoney(
                                            oldPriceVal,
                                            deal.currency
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </div>


            <div class="flex items-center justify-between pt-2 border-t border-surface-container-low text-[11px] text-on-surface-variant">

                <div class="flex items-center gap-1">

                    <span class="material-symbols-outlined text-savings-green text-[14px]">
                        check_circle
                    </span>

                    <span>
                        ${
                            deal.last_verified_at ||
                            deal.created_at ||
                            "Verified"
                        }
                    </span>

                </div>


                <div class="flex items-center gap-2">

                    ${
                        deal.comparison_id ||
                        deal.asin
                            ? `
                                <button
                                    onclick="showPriceComparison(${Number(deal.id)})"
                                    class="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[12px] flex items-center gap-1"
                                >
                                    <span class="material-symbols-outlined text-[16px]">
                                        compare_arrows
                                    </span>
                                    Compare
                                </button>
                              `
                            : ""
                    }


                    <button
                        onclick="shareDeal('${encodeURIComponent(deal.title || "")}', '${escapeAttribute(deal.url || window.location.href)}')"
                        class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm"
                        title="Share Deal"
                    >
                        <span class="material-symbols-outlined text-[18px]">
                            share
                        </span>
                    </button>


                    <a
                        href="${escapeAttribute(deal.url || "#")}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="py-2 px-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                        <span>Get Deal</span>

                        <span class="material-symbols-outlined text-[16px]">
                            arrow_forward
                        </span>

                    </a>

                </div>

            </div>

        `;

        container.appendChild(card);

    });
}


/* =========================================================
   PRICE COMPARISON
========================================================= */

async function showPriceComparison(dealId) {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/deals/${dealId}/compare`
            );

        const data =
            await response.json();

        if (
            !data.success ||
            !Array.isArray(data.offers)
        ) {
            throw new Error(
                data.error || "Comparison unavailable"
            );
        }

        renderComparisonModal(data);

    } catch (error) {

        console.error(
            "Price comparison error:",
            error
        );

        alert(
            "Price comparison is not available for this product yet."
        );
    }
}


function renderComparisonModal(data) {

    let modal =
        document.getElementById(
            "cdComparisonModal"
        );

    if (modal) {
        modal.remove();
    }

    const offers =
        data.offers || [];

    modal =
        document.createElement("div");

    modal.id =
        "cdComparisonModal";

    modal.className =
        "fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4";

    const rows =
        offers.map(
            (offer, index) => {

                const country =
                    getCountryInfo(
                        offer.country_code
                    );

                return `

                    <div class="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-xl
                        ${
                            index === 0
                                ? "bg-savings-green-subtle border border-green-200"
                                : "bg-surface-container-low"
                        }
                    ">

                        <div class="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-surface-container">

                            ${
                                offer.image_url
                                    ? `
                                        <img
                                            src="${escapeAttribute(offer.image_url)}"
                                            class="w-full h-full object-cover"
                                            onerror="this.style.display='none'"
                                        >
                                      `
                                    : ""
                            }

                        </div>


                        <div class="flex-1 min-w-0">

                            <div class="flex items-center gap-1 text-[11px] text-on-surface-variant">

                                <span>
                                    ${
                                        country
                                            ? country[1]
                                            : "🌍"
                                    }
                                </span>

                                <span>
                                    ${escapeHtml(
                                        country
                                            ? country[2]
                                            : "Market"
                                    )}
                                </span>

                            </div>


                            <div class="font-semibold text-[13px] text-on-surface truncate">
                                ${escapeHtml(
                                    offer.store || "Store"
                                )}
                            </div>


                            <div class="text-[11px] text-on-surface-variant truncate">
                                ${escapeHtml(
                                    offer.title || ""
                                )}
                            </div>

                        </div>


                        <div class="text-right flex-shrink-0">

                            <div class="font-extrabold text-primary-container text-[16px]">
                                ${formatMoney(
                                    offer.new_price,
                                    offer.currency
                                )}
                            </div>

                            ${
                                offer.old_price
                                    ? `
                                        <div class="text-[11px] text-outline line-through">
                                            ${formatMoney(
                                                offer.old_price,
                                                offer.currency
                                            )}
                                        </div>
                                      `
                                    : ""
                            }

                            ${
                                offer.discount_percent
                                    ? `
                                        <div class="text-[10px] text-savings-green font-bold">
                                            ${Math.round(
                                                Number(
                                                    offer.discount_percent
                                                )
                                            )}% OFF
                                        </div>
                                      `
                                    : ""
                            }

                        </div>


                        <a
                            href="${escapeAttribute(offer.url || "#")}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0"
                            title="View Deal"
                        >
                            <span class="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </a>

                    </div>

                `;
            }
        ).join("");


    modal.innerHTML = `

        <div class="
            w-full
            max-w-xl
            max-h-[90vh]
            overflow-y-auto
            bg-surface-container-lowest
            rounded-2xl
            shadow-2xl
            p-5
        ">

            <div class="flex items-center justify-between gap-3 mb-4">

                <div>

                    <h2 class="text-[18px] font-bold text-on-surface">
                        Price Comparison
                    </h2>

                    <p class="text-[11px] text-on-surface-variant mt-1">
                        Same product across available stores and markets
                    </p>

                </div>


                <button
                    onclick="closeComparisonModal()"
                    class="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center"
                >
                    <span class="material-symbols-outlined">
                        close
                    </span>
                </button>

            </div>


            <div class="mb-4 p-3 rounded-xl bg-surface-container-low">

                <div class="text-[11px] text-on-surface-variant">
                    Product
                </div>

                <div class="font-semibold text-[14px] text-on-surface mt-1">
                    ${escapeHtml(
                        offers[0]?.title ||
                        "Product comparison"
                    )}
                </div>

            </div>


            <div class="flex flex-col gap-2">

                ${
                    rows ||
                    `
                        <div class="p-5 text-center text-sm text-on-surface-variant">
                            No other offers found yet.
                        </div>
                    `
                }

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeComparisonModal();
            }

        }
    );
}


function closeComparisonModal() {

    const modal =
        document.getElementById(
            "cdComparisonModal"
        );

    if (modal) {
        modal.remove();
    }
}


/* =========================================================
   CURRENCY
========================================================= */

function formatMoney(
    value,
    currency = "USD"
) {

    const amount =
        Number(value);

    if (!Number.isFinite(amount)) {
        return "-";
    }

    const code =
        String(currency || "USD")
            .toUpperCase();

    try {

        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: code,
                maximumFractionDigits:
                    ["JPY", "KRW", "IDR", "VND"].includes(code)
                        ? 0
                        : 2
            }
        ).format(amount);

    } catch {

        return `${code} ${amount.toFixed(2)}`;
    }
}


/* =========================================================
   EXISTING FILTERS
========================================================= */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            "#market-deals .overflow-x-auto button"
        );

    filterButtons.forEach(btn => {

        if (
            btn.closest("#cdCountrySystem")
        ) {
            return;
        }

        btn.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    b => {

                        b.className =
                            "flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]";
                    }
                );

                btn.className =
                    "flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";

                const text =
                    btn.textContent.toLowerCase();

                let category =
                    "all";

                if (text.includes("home")) {
                    category = "home";
                } else if (
                    text.includes("kitchen")
                ) {
                    category = "kitchen";
                } else if (
                    text.includes("trending")
                ) {
                    category = "trending";
                }

                selectedCategory =
                    category;

                loadDeals(category);
            }
        );

    });
}


/* =========================================================
   BURGER MENU
========================================================= */

function initBurgerMenu() {

    const btn =
        document.getElementById(
            "burgerMenuBtn"
        );

    if (!btn) return;

    const menuOverlay =
        document.createElement("div");

    menuOverlay.id =
        "customBurgerMenu";

    menuOverlay.className =
        "fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm hidden transition-opacity duration-300";

    menuOverlay.innerHTML = `

        <div class="absolute right-0 top-0 h-full w-[280px] bg-surface-container-lowest shadow-2xl p-5 flex flex-col justify-between transform translate-x-full transition-transform duration-300">

            <div>

                <div class="flex items-center justify-between pb-4 border-b border-surface-container">

                    <div class="flex items-center gap-2">

                        <div class="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-[14px]">
                            CD
                        </div>

                        <span class="font-headline-sm text-[16px] font-bold text-on-surface">
                            Navigation Menu
                        </span>

                    </div>

                    <button
                        id="closeBurgerMenu"
                        class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container"
                    >
                        <span class="material-symbols-outlined text-[18px]">
                            close
                        </span>
                    </button>

                </div>


                <div class="flex flex-col gap-2 pt-4">

                    <a
                        href="index.html"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]"
                    >
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            home
                        </span>
                        Home
                    </a>


                    <a
                        href="#market-deals"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]"
                    >
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            local_offer
                        </span>
                        Top Deals
                    </a>


                    <a
                        href="#savings-tool"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]"
                    >
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            calculate
                        </span>
                        Savings Checker
                    </a>


                    <a
                        href="#tool-comparison"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]"
                    >
                        <span class="material-symbols-outlined text-[20px] text-on-surface">
                            compare_arrows
                        </span>
                        Price Comparison
                    </a>


                    <a
                        href="#tool-history"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]"
                    >
                        <span class="material-symbols-outlined text-[20px] text-on-surface">
                            trending_down
                        </span>
                        Price History
                    </a>


                    <a
                        href="#tool-watchlist"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] font-semibold"
                    >
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            bookmark
                        </span>
                        Watchlist
                    </a>

                </div>

            </div>


            <div class="pt-4 border-t border-surface-container text-center text-[12px] text-on-surface-variant">
                CheckerDiscount v11.0
            </div>

        </div>

    `;

    document.body.appendChild(
        menuOverlay
    );

    const drawer =
        menuOverlay.querySelector(
            "div > div"
        );

    btn.addEventListener(
        "click",
        () => {

            menuOverlay.classList.remove(
                "hidden"
            );

            setTimeout(
                () => {
                    drawer.classList.remove(
                        "translate-x-full"
                    );
                },
                10
            );
        }
    );


    const closeBtn =
        document.getElementById(
            "closeBurgerMenu"
        );

    closeBtn.addEventListener(
        "click",
        closeMenu
    );


    menuOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target === menuOverlay
            ) {
                closeMenu();
            }

        }
    );
}


function closeMenu() {

    const menuOverlay =
        document.getElementById(
            "customBurgerMenu"
        );

    if (!menuOverlay) return;

    const drawer =
        menuOverlay.querySelector(
            "div > div"
        );

    drawer.classList.add(
        "translate-x-full"
    );

    setTimeout(
        () => {
            menuOverlay.classList.add(
                "hidden"
            );
        },
        300
    );
}


/* =========================================================
   SHARE
========================================================= */

function shareDeal(
    title,
    url
) {

    const decodedTitle =
        decodeURIComponent(title);

    if (navigator.share) {

        navigator.share({
            title: decodedTitle,
            url: url
        }).catch(() => {});

    } else {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            navigator.clipboard.writeText(url)
                .then(
                    () => alert(
                        "Deal link copied to clipboard!"
                    )
                )
                .catch(
                    () => alert(url)
                );

        } else {

            alert(url);
        }
    }
}


/* =========================================================
   SAVINGS CHECKER
========================================================= */

function calculateSavings() {

    const paid =
        parseFloat(
            document.getElementById(
                "checkerPaid"
            )?.value
        ) || 0;

    const current =
        parseFloat(
            document.getElementById(
                "checkerCurrent"
            )?.value
        ) || 0;

    const store =
        document.getElementById(
            "checkerStore"
        )?.value ||
        "Store";

    const delta =
        paid - current;

    const pct =
        paid > 0
            ? ((delta / paid) * 100).toFixed(1)
            : 0;

    const deltaEl =
        document.getElementById(
            "savingsDelta"
        );

    const adviceEl =
        document.getElementById(
            "savingsAdvice"
        );

    if (deltaEl) {

        deltaEl.textContent =
            `$${Math.max(
                0,
                delta
            ).toFixed(2)}`;
    }

    if (adviceEl) {

        adviceEl.textContent =
            `${store}: $${paid.toFixed(2)} vs $${current.toFixed(2)} yields ${pct}% price drop.`;
    }
}


/* =========================================================
   FINAL PRICE CALCULATOR
========================================================= */

function runFinalPriceCalc() {

    const price =
        parseFloat(
            document.getElementById(
                "calcPrice"
            )?.value
        ) || 0;

    const coupon =
        parseFloat(
            document.getElementById(
                "calcCoupon"
            )?.value
        ) || 0;

    const shipping =
        parseFloat(
            document.getElementById(
                "calcShipping"
            )?.value
        ) || 0;

    const tax =
        parseFloat(
            document.getElementById(
                "calcTax"
            )?.value
        ) || 0;

    const total =
        Math.max(
            0,
            price -
            coupon +
            shipping +
            tax
        );

    const display =
        document.querySelector(
            "#finalPriceDisplay strong"
        ) ||
        document.getElementById(
            "finalPriceDisplay"
        );

    if (display) {

        display.innerHTML = `
            <span class="text-on-surface-variant">
                Total Out-of-Pocket:
            </span>

            <span class="font-bold text-on-surface text-[16px]">
                $${total.toFixed(2)}
            </span>
        `;
    }
}


/* =========================================================
   WATCHLIST
========================================================= */

function addToWatchlist() {

    const name =
        document.getElementById(
            "watchProductName"
        )?.value;

    const price =
        document.getElementById(
            "watchAlertPrice"
        )?.value;

    const status =
        document.getElementById(
            "watchStatusText"
        );

    if (name && status) {

        status.textContent =
            `Tracking "${name}" for drops below $${price || "0.00"}`;

        alert(
            "Added to price drop watchlist successfully!"
        );
    }
}


/* =========================================================
   EXISTING TOOL HOOKS
========================================================= */

function initExistingTools() {

    /*
      These functions are intentionally kept as safe
      placeholders until their complete existing UI/API
      implementation is connected.

      The new country/comparison system does not remove
      the existing HTML tool sections.
    */

}


/* =========================================================
   OPTIONAL EXISTING TOOL FUNCTIONS
========================================================= */

async function runPriceComparison() {

    const input =
        document.getElementById(
            "compareProductInput"
        );

    if (!input) return;

    const query =
        input.value.trim();

    if (!query) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    const matches =
        globalDeals.filter(
            deal =>
                String(
                    deal.title || ""
                )
                .toLowerCase()
                .includes(
                    query.toLowerCase()
                )
        );

    if (!matches.length) {

        alert(
            "No matching deals found in this market yet."
        );

        return;
    }

    const first =
        matches[0];

    if (first.id) {
        await showPriceComparison(
            first.id
        );
    }
}


async function runPriceHistoryCheck() {

    const input =
        document.getElementById(
            "historyProductInput"
        );

    if (!input) return;

    const query =
        input.value.trim();

    if (!query) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    const match =
        globalDeals.find(
            deal =>
                String(
                    deal.title || ""
                )
                .toLowerCase()
                .includes(
                    query.toLowerCase()
                )
        );

    if (!match) {

        alert(
            "Product not found in current deals."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/api/deals/${match.id}/history`
            );

        const data =
            await response.json();

        if (
            !data.success ||
            !data.history?.length
        ) {

            alert(
                "No price history available yet."
            );

            return;
        }

        alert(
            `Price history available: ${data.history.length} recorded price checks.`
        );

    } catch {

        alert(
            "Unable to load price history."
        );
    }
}


async function runCouponChecker() {

    const store =
        document.getElementById(
            "couponStoreInput"
        )?.value.trim() || "";

    const keyword =
        document.getElementById(
            "couponKeywordInput"
        )?.value.trim() || "";

    try {

        const params =
            new URLSearchParams();

        if (store) {
            params.set(
                "store",
                store
            );
        }

        if (keyword) {
            params.set(
                "q",
                keyword
            );
        }

        const response =
            await fetch(
                `${API_BASE}/api/coupons?${params.toString()}`
            );

        const data =
            await response.json();

        if (
            !data.success ||
            !data.coupons?.length
        ) {

            alert(
                "No verified coupons found."
            );

            return;
        }

        const coupon =
            data.coupons[0];

        alert(
            `Coupon available: ${coupon.code || "No code"}`
        );

    } catch {

        alert(
            "Unable to check coupons."
        );
    }
}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}
