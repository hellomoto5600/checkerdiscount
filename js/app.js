// ============================================================
// CheckerDiscount - Original Design + Country / Category System
// ============================================================

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

const COUNTRIES = {
    US: { code: "US", flag: "🇺🇸", name: "USA", currency: "USD", symbol: "$" },
    GB: { code: "GB", flag: "🇬🇧", name: "UK", currency: "GBP", symbol: "£" },
    SA: { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
    AE: { code: "AE", flag: "🇦🇪", name: "UAE", currency: "AED", symbol: "د.إ" },
    OM: { code: "OM", flag: "🇴🇲", name: "Oman", currency: "OMR", symbol: "﷼" },
    PK: { code: "PK", flag: "🇵🇰", name: "Pakistan", currency: "PKR", symbol: "₨" },
    IN: { code: "IN", flag: "🇮🇳", name: "India", currency: "INR", symbol: "₹" },
    CA: { code: "CA", flag: "🇨🇦", name: "Canada", currency: "CAD", symbol: "$" },
    AU: { code: "AU", flag: "🇦🇺", name: "Australia", currency: "AUD", symbol: "$" },
    DE: { code: "DE", flag: "🇩🇪", name: "Germany", currency: "EUR", symbol: "€" },
    FR: { code: "FR", flag: "🇫🇷", name: "France", currency: "EUR", symbol: "€" },
    IT: { code: "IT", flag: "🇮🇹", name: "Italy", currency: "EUR", symbol: "€" },
    ES: { code: "ES", flag: "🇪🇸", name: "Spain", currency: "EUR", symbol: "€" },
    NL: { code: "NL", flag: "🇳🇱", name: "Netherlands", currency: "EUR", symbol: "€" },
    BE: { code: "BE", flag: "🇧🇪", name: "Belgium", currency: "EUR", symbol: "€" },
    AT: { code: "AT", flag: "🇦🇹", name: "Austria", currency: "EUR", symbol: "€" },
    CH: { code: "CH", flag: "🇨🇭", name: "Switzerland", currency: "CHF", symbol: "CHF" },
    NO: { code: "NO", flag: "🇳🇴", name: "Norway", currency: "NOK", symbol: "kr" },
    SE: { code: "SE", flag: "🇸🇪", name: "Sweden", currency: "SEK", symbol: "kr" },
    DK: { code: "DK", flag: "🇩🇰", name: "Denmark", currency: "DKK", symbol: "kr" },
    NZ: { code: "NZ", flag: "🇳🇿", name: "New Zealand", currency: "NZD", symbol: "$" },
    JP: { code: "JP", flag: "🇯🇵", name: "Japan", currency: "JPY", symbol: "¥" },
    CN: { code: "CN", flag: "🇨🇳", name: "China", currency: "CNY", symbol: "¥" },
    KR: { code: "KR", flag: "🇰🇷", name: "South Korea", currency: "KRW", symbol: "₩" },
    SG: { code: "SG", flag: "🇸🇬", name: "Singapore", currency: "SGD", symbol: "$" },
    MY: { code: "MY", flag: "🇲🇾", name: "Malaysia", currency: "MYR", symbol: "RM" },
    TH: { code: "TH", flag: "🇹🇭", name: "Thailand", currency: "THB", symbol: "฿" },
    ID: { code: "ID", flag: "🇮🇩", name: "Indonesia", currency: "IDR", symbol: "Rp" },
    PH: { code: "PH", flag: "🇵🇭", name: "Philippines", currency: "PHP", symbol: "₱" },
    VN: { code: "VN", flag: "🇻🇳", name: "Vietnam", currency: "VND", symbol: "₫" },
    TR: { code: "TR", flag: "🇹🇷", name: "Turkey", currency: "TRY", symbol: "₺" },
    BR: { code: "BR", flag: "🇧🇷", name: "Brazil", currency: "BRL", symbol: "R$" },
    MX: { code: "MX", flag: "🇲🇽", name: "Mexico", currency: "MXN", symbol: "$" },
    ZA: { code: "ZA", flag: "🇿🇦", name: "South Africa", currency: "ZAR", symbol: "R" },
    QA: { code: "QA", flag: "🇶🇦", name: "Qatar", currency: "QAR", symbol: "﷼" },
    KW: { code: "KW", flag: "🇰🇼", name: "Kuwait", currency: "KWD", symbol: "د.ك" },
    BH: { code: "BH", flag: "🇧🇭", name: "Bahrain", currency: "BHD", symbol: ".د.ب" }
};

const POPULAR_COUNTRIES = [
    "US", "GB", "AE", "OM", "PK", "IN", "SA", "CA", "AU", "DE"
];

let globalDeals = [];
let currentCountry = localStorage.getItem("cd_country") || detectCountry();
let currentCategory = "all";

// ============================================================
// START
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupCountrySystem();
    fetchDealsAndInit();
    initBurgerMenu();
});

// ============================================================
// COUNTRY DETECTION
// ============================================================

function detectCountry() {
    try {
        const locale =
            navigator.language ||
            navigator.userLanguage ||
            "";

        const match = locale.match(/[-_]([A-Z]{2})$/i);

        if (match && COUNTRIES[match[1].toUpperCase()]) {
            return match[1].toUpperCase();
        }

        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "";

        const timezoneMap = {
            "Asia/Muscat": "OM",
            "Asia/Dubai": "AE",
            "Asia/Riyadh": "SA",
            "Asia/Karachi": "PK",
            "Asia/Kolkata": "IN",
            "Asia/Calcutta": "IN",
            "Europe/London": "GB",
            "Europe/Berlin": "DE",
            "Europe/Paris": "FR",
            "Europe/Rome": "IT",
            "Europe/Madrid": "ES",
            "Europe/Amsterdam": "NL",
            "Europe/Zurich": "CH",
            "Europe/Stockholm": "SE",
            "Europe/Copenhagen": "DK",
            "Europe/Oslo": "NO",
            "America/New_York": "US",
            "America/Chicago": "US",
            "America/Denver": "US",
            "America/Los_Angeles": "US",
            "America/Toronto": "CA",
            "Australia/Sydney": "AU",
            "Pacific/Auckland": "NZ",
            "Asia/Tokyo": "JP",
            "Asia/Shanghai": "CN",
            "Asia/Seoul": "KR",
            "Asia/Singapore": "SG",
            "Asia/Kuala_Lumpur": "MY",
            "Asia/Bangkok": "TH",
            "Asia/Jakarta": "ID",
            "Asia/Manila": "PH",
            "Asia/Ho_Chi_Minh": "VN"
        };

        if (timezoneMap[timezone]) {
            return timezoneMap[timezone];
        }
    } catch (e) {
        console.warn("Country detection failed:", e);
    }

    return "US";
}

// ============================================================
// COUNTRY UI
// ============================================================

function setupCountrySystem() {
    const marketSection = document.getElementById("market-deals");

    if (!marketSection) return;

    const oldFilter =
        marketSection.querySelector(".overflow-x-auto");

    if (!oldFilter) return;

    const countryWrapper = document.createElement("div");
    countryWrapper.id = "countryDealsSelector";
    countryWrapper.className = "mt-5 mb-4";

    countryWrapper.innerHTML = `
        <div class="flex items-center justify-between gap-3 mb-3">
            <div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    🌍 Deals in Your Country
                </div>
                <div id="selectedCountryHeading"
                     class="text-[18px] font-bold text-on-surface mt-1">
                    ${getCountry().flag} ${getCountry().name} Deals
                </div>
            </div>

            <span class="material-symbols-outlined text-primary text-[22px]">
                public
            </span>
        </div>

        <div id="countryFlags"
             class="flex gap-2 overflow-x-auto pb-2"
             style="scrollbar-width:none;">
        </div>

        <div class="mt-3">
            <div class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Categories
            </div>

            <div id="countryCategories"
                 class="flex gap-2 overflow-x-auto pb-1"
                 style="scrollbar-width:none;">
            </div>
        </div>
    `;

    oldFilter.parentNode.insertBefore(countryWrapper, oldFilter);

    renderCountryFlags();
    loadCountryCategories();

    /*
     * The original static category filter is no longer needed.
     * We keep the surrounding original design but use dynamic
     * country-specific categories instead.
     */
    oldFilter.style.display = "none";
}

// ============================================================
// COUNTRY FLAGS
// ============================================================

function renderCountryFlags() {
    const container = document.getElementById("countryFlags");

    if (!container) return;

    container.innerHTML = "";

    POPULAR_COUNTRIES.forEach(code => {
        const country = COUNTRIES[code];

        const button = document.createElement("button");

        button.type = "button";
        button.title = country.name;
        button.setAttribute("aria-label", country.name);

        button.className =
            "flex-shrink-0 w-11 h-10 rounded-xl border flex items-center justify-center text-[22px] transition-all " +
            (code === currentCountry
                ? "bg-primary-container border-primary-container shadow-sm scale-105"
                : "bg-surface-container-low border-surface-container hover:bg-surface-container");

        button.innerHTML = country.flag;

        button.addEventListener("click", () => {
            selectCountry(code);
        });

        container.appendChild(button);
    });

    const moreButton = document.createElement("button");

    moreButton.type = "button";
    moreButton.className =
        "flex-shrink-0 px-3 h-10 rounded-xl bg-surface-container-low border border-surface-container text-[12px] font-semibold text-on-surface-variant";

    moreButton.textContent = "More";

    moreButton.addEventListener("click", showMoreCountries);

    container.appendChild(moreButton);
}

// ============================================================
// MORE COUNTRIES
// ============================================================

function showMoreCountries() {
    const container = document.getElementById("countryFlags");

    if (!container) return;

    const existing = document.getElementById("moreCountriesRow");

    if (existing) {
        existing.remove();
        return;
    }

    const row = document.createElement("div");

    row.id = "moreCountriesRow";
    row.className = "flex gap-2 overflow-x-auto mt-2 pb-1";

    Object.keys(COUNTRIES)
        .filter(code => !POPULAR_COUNTRIES.includes(code))
        .forEach(code => {
            const country = COUNTRIES[code];

            const button = document.createElement("button");

            button.type = "button";
            button.title = country.name;
            button.className =
                "flex-shrink-0 w-11 h-10 rounded-xl border border-surface-container bg-surface-container-low flex items-center justify-center text-[22px]";

            button.textContent = country.flag;

            button.addEventListener("click", () => {
                selectCountry(code);
            });

            row.appendChild(button);
        });

    container.parentNode.appendChild(row);
}

// ============================================================
// SELECT COUNTRY
// ============================================================

async function selectCountry(code) {
    if (!COUNTRIES[code]) return;

    currentCountry = code;
    currentCategory = "all";

    localStorage.setItem("cd_country", code);

    const heading = document.getElementById("selectedCountryHeading");

    if (heading) {
        heading.textContent =
            `${COUNTRIES[code].flag} ${COUNTRIES[code].name} Deals`;
    }

    renderCountryFlags();

    await loadCountryCategories();

    await fetchCountryDeals();
}

// ============================================================
// COUNTRY INFORMATION
// ============================================================

function getCountry() {
    return COUNTRIES[currentCountry] || COUNTRIES.US;
}

// ============================================================
// CATEGORY LOADING
// ============================================================

async function loadCountryCategories() {
    const container = document.getElementById("countryCategories");

    if (!container) return;

    container.innerHTML = `
        <span class="px-3.5 py-1.5 rounded-xl bg-surface-container text-[13px] text-on-surface-variant">
            Loading categories...
        </span>
    `;

    let categories = [];

    try {
        const response = await fetch(
            `${API_BASE}/api/categories?country=${encodeURIComponent(currentCountry)}`
        );

        if (response.ok) {
            const data = await response.json();

            if (Array.isArray(data.categories)) {
                categories = data.categories;
            }
        }
    } catch (error) {
        console.warn("Category API unavailable:", error);
    }

    /*
     * If Worker category endpoint is unavailable, build the list
     * directly from the deals already available.
     */
    if (!categories.length) {
        categories = getCategoriesFromDeals(
            globalDeals.filter(dealBelongsToCountry)
        );
    }

    renderCategories(categories);
}

// ============================================================
// CATEGORY LIST FROM DEALS
// ============================================================

function getCategoriesFromDeals(deals) {
    const map = {};

    deals.forEach(deal => {
        const category = normalizeCategory(deal.category);

        if (category) {
            map[category.toLowerCase()] = category;
        }
    });

    return Object.values(map);
}

// ============================================================
// RENDER CATEGORIES
// ============================================================

function renderCategories(categories) {
    const container = document.getElementById("countryCategories");

    if (!container) return;

    container.innerHTML = "";

    const allButton = createCategoryButton("All", "all");

    container.appendChild(allButton);

    categories.forEach(category => {
        if (!category) return;

        const button = createCategoryButton(
            formatCategory(category),
            category
        );

        container.appendChild(button);
    });
}

// ============================================================
// CATEGORY BUTTON
// ============================================================

function createCategoryButton(label, value) {
    const button = document.createElement("button");

    button.type = "button";

    button.dataset.category = value;

    button.className =
        "flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[13px] transition-colors " +
        (currentCategory === value
            ? "bg-primary-container text-on-primary font-semibold shadow-sm"
            : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant");

    button.textContent = label;

    button.addEventListener("click", () => {
        currentCategory = value;

        document
            .querySelectorAll("#countryCategories button")
            .forEach(btn => {
                const active =
                    btn.dataset.category === currentCategory;

                btn.className =
                    "flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[13px] transition-colors " +
                    (active
                        ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant");
            });

        loadDeals(currentCategory);
    });

    return button;
}

// ============================================================
// FETCH ALL DEALS
// ============================================================

async function fetchDealsAndInit() {
    try {
        const response = await fetch(`${API_BASE}/api/deals`);
        const data = await response.json();

        if (data.success && Array.isArray(data.deals)) {
            globalDeals = data.deals;
        } else if (Array.isArray(data.deals)) {
            globalDeals = data.deals;
        } else {
            globalDeals = [];
        }
    } catch (error) {
        console.error(
            "Failed to fetch deals from Worker API:",
            error
        );

        globalDeals = [];
    }

    await fetchCountryDeals();

    loadSpotlight();
}

// ============================================================
// FETCH COUNTRY DEALS
// ============================================================

async function fetchCountryDeals() {
    try {
        const response = await fetch(
            `${API_BASE}/api/deals?country=${encodeURIComponent(currentCountry)}`
        );

        if (!response.ok) {
            loadDeals(currentCategory);
            return;
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.deals)) {
            /*
             * If the country API returns deals, use them.
             */
            if (data.deals.length > 0) {
                globalDeals = data.deals;
            } else {
                /*
                 * Important:
                 * Do NOT destroy old deals when the new country
                 * has no country-tagged rows yet.
                 */
                const oldDeals = globalDeals;

                const countryTagged = oldDeals.filter(
                    dealBelongsToCountry
                );

                if (countryTagged.length > 0) {
                    globalDeals = countryTagged;
                }
            }
        }
    } catch (error) {
        console.warn(
            "Country deals API unavailable. Using existing deals.",
            error
        );
    }

    await loadCountryCategories();

    loadSpotlight();
    loadDeals(currentCategory);
}

// ============================================================
// COUNTRY MATCHING
// ============================================================

function dealBelongsToCountry(deal) {
    if (!deal) return false;

    const dealCountry = String(
        deal.country ||
        deal.country_code ||
        deal.market ||
        ""
    )
        .trim()
        .toUpperCase();

    if (!dealCountry) {
        return false;
    }

    return dealCountry === currentCountry;
}

// ============================================================
// LOAD SPOTLIGHT
// ============================================================

function loadSpotlight() {
    const deals = globalDeals;

    if (deals.length === 0) return;

    let featuredDeal = deals.find(
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

    if (!spotlightContainer || !featuredDeal) return;

    const imgSrc =
        featuredDeal.image_url ||
        featuredDeal.image ||
        FALLBACK_IMAGE;

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

    const savingsAmount =
        oldPrice > newPrice
            ? (oldPrice - newPrice).toFixed(2)
            : "0.00";

    const country =
        COUNTRIES[
            String(
                featuredDeal.country ||
                featuredDeal.country_code ||
                currentCountry
            ).toUpperCase()
        ] || getCountry();

    const showcaseBox =
        spotlightContainer.querySelector(
            ".w-full.mt-2.bg-surface-container-lowest"
        );

    if (!showcaseBox) return;

    showcaseBox.innerHTML = `
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-surface-container-low">
            <div class="flex items-center gap-1 text-primary font-badge-caps text-[11px] font-bold uppercase tracking-wider">
                <span class="material-symbols-outlined text-[15px]">bolt</span>
                Deal Spotlight
            </div>

            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold">
                <span class="material-symbols-outlined text-[12px]">verified</span>
                ${escapeHtml(discountText)}
            </span>
        </div>

        <div class="flex gap-3 pt-3">
            <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
                <img
                    class="w-full h-full object-cover"
                    src="${escapeAttribute(imgSrc)}"
                    alt="Spotlight Deal"
                    onerror="this.src='${FALLBACK_IMAGE}'"
                >

                <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.2 rounded font-mono">
                    ${escapeHtml(featuredDeal.store || "Amazon")}
                </div>
            </div>

            <div class="flex flex-col min-w-0 justify-center flex-1">

                <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">
                    <span>${country.flag} ${escapeHtml(country.name)}</span>

                    <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined fill-1">
                        star
                    </span>

                    <span class="font-bold text-on-surface">
                        4.8
                    </span>
                </div>

                <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">
                    ${escapeHtml(featuredDeal.title || "Special Deal")}
                </h3>

                <div class="flex items-baseline gap-2 mt-1.5">

                    <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">
                        ${formatMoney(newPrice, featuredDeal.currency || country.currency)}
                    </span>

                    ${
                        oldPrice
                            ? `
                        <span class="font-price-strikethrough text-[13px] text-outline line-through">
                            ${formatMoney(oldPrice, featuredDeal.currency || country.currency)}
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
                Save ${formatMoney(savingsAmount, featuredDeal.currency || country.currency)}
            </div>

            <div class="flex items-center gap-2">

                <button
                    onclick="shareDeal('${encodeURIComponent(featuredDeal.title || "Deal")}', '${escapeAttribute(featuredDeal.url || window.location.href)}')"
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
                    rel="noopener noreferrer sponsored"
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

// ============================================================
// LOAD DEALS
// ============================================================

function loadDeals(filter = "all") {
    const container =
        document.getElementById("discountsContainer");

    if (!container) return;

    let deals = [...globalDeals];

    /*
     * Country filtering:
     *
     * If the current API response is already country-specific,
     * don't filter again unnecessarily.
     *
     * If deals contain country fields, filter them.
     *
     * Old deals without country remain visible so existing
     * inventory is not suddenly lost.
     */
    const hasCountryData =
        deals.some(
            deal =>
                deal.country ||
                deal.country_code ||
                deal.market
        );

    if (hasCountryData) {
        const matching = deals.filter(dealBelongsToCountry);

        if (matching.length > 0) {
            deals = matching;
        }
    }

    if (filter !== "all") {
        deals = deals.filter(deal => {
            const category =
                normalizeCategory(deal.category);

            return (
                category &&
                category.toLowerCase() ===
                    String(filter).toLowerCase()
            );
        });
    }

    container.innerHTML = "";

    if (deals.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">
                No deals found for this category yet.
            </div>
        `;

        return;
    }

    deals.forEach(deal => {
        renderDealCard(container, deal);
    });
}

// ============================================================
// DEAL CARD
// ============================================================

function renderDealCard(container, deal) {
    const imgSrc =
        deal.image_url ||
        deal.image ||
        FALLBACK_IMAGE;

    const price =
        Number(
            deal.new_price ||
            deal.price ||
            0
        );

    const oldPrice =
        Number(deal.old_price || 0);

    let discount =
        Number(deal.discount_percent || 0);

    if (!discount && oldPrice > price) {
        discount =
            ((oldPrice - price) / oldPrice) * 100;
    }

    const discountText =
        discount > 0
            ? `${Math.round(discount)}% OFF`
            : "Special Deal";

    const countryCode =
        String(
            deal.country ||
            deal.country_code ||
            currentCountry
        ).toUpperCase();

    const country =
        COUNTRIES[countryCode] || getCountry();

    const currency =
        deal.currency ||
        country.currency ||
        "USD";

    const category =
        normalizeCategory(deal.category);

    const verifiedText =
        deal.last_verified_at ||
        deal.created_at ||
        "Verified";

    const card =
        document.createElement("div");

    card.className =
        "bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3";

    card.innerHTML = `
        <div class="flex items-center justify-between gap-2">

            <span class="font-badge-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                ${escapeHtml(deal.store || "Amazon")}
            </span>

            <span class="px-2.5 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px]">
                    verified
                </span>
                ${escapeHtml(discountText)}
            </span>

        </div>

        <div class="flex gap-3">

            <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">

                <img
                    src="${escapeAttribute(imgSrc)}"
                    class="w-full h-full object-cover"
                    alt="Deal"
                    onerror="this.src='${FALLBACK_IMAGE}'"
                >

            </div>

            <div class="flex flex-col min-w-0 justify-center flex-1">

                <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">
                    ${escapeHtml(deal.title || "Special Deal")}
                </h3>

                <div class="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">

                    <span>
                        ${country.flag} ${escapeHtml(country.name)}
                    </span>

                    ${
                        category
                            ? `
                        <span>·</span>
                        <span>🏷️ ${escapeHtml(formatCategory(category))}</span>
                    `
                            : ""
                    }

                </div>

                <div class="flex items-baseline gap-2 mt-1.5">

                    <span class="font-headline-sm text-[18px] font-extrabold text-primary-container">
                        ${formatMoney(price, currency)}
                    </span>

                    ${
                        oldPrice
                            ? `
                        <span class="font-price-strikethrough text-[13px] text-outline line-through">
                            ${formatMoney(oldPrice, currency)}
                        </span>
                    `
                            : ""
                    }

                </div>

            </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-surface-container-low text-[11px] text-on-surface-variant">

            <div class="flex items-center gap-1 min-w-0">

                <span class="material-symbols-outlined text-savings-green text-[14px]">
                    check_circle
                </span>

                <span class="truncate">
                    ${escapeHtml(String(verifiedText))}
                </span>

            </div>

            <div class="flex items-center gap-2 flex-shrink-0">

                <button
                    onclick="shareDeal('${encodeURIComponent(deal.title || "Deal")}', '${escapeAttribute(deal.url || window.location.href)}')"
                    class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm"
                    title="Share Deal"
                >
                    <span class="material-symbols-outlined text-[18px]">
                        share
                    </span>
                </button>

                ${
                    deal.comparison_id || deal.asin
                        ? `
                    <button
                        onclick="compareDeal('${escapeAttribute(String(deal.id || ""))}')"
                        class="py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-[12px] font-semibold flex items-center gap-1"
                    >
                        <span class="material-symbols-outlined text-[15px]">
                            compare_arrows
                        </span>
                        Compare
                    </button>
                `
                        : ""
                }

                <a
                    href="${escapeAttribute(deal.url || "#")}"
                    target="_blank"
                    rel="noopener noreferrer sponsored"
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
}

// ============================================================
// ORIGINAL FILTER COMPATIBILITY
// ============================================================

function setupFilters() {
    /*
     * Country/category system replaces the old fixed filters.
     * This function is intentionally kept so old HTML or other
     * scripts calling setupFilters() will not break.
     */
}

// ============================================================
// BURGER MENU
// ============================================================

function initBurgerMenu() {
    const btn =
        document.getElementById("burgerMenuBtn");

    if (!btn) return;

    const menuOverlay =
        document.createElement("div");

    menuOverlay.id = "customBurgerMenu";

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

                    <a href="index.html"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            home
                        </span>
                        Home
                    </a>

                    <a href="#market-deals"
                       onclick="closeMenu()"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            local_offer
                        </span>
                        Top Deals
                    </a>

                    <a href="#savings-tool"
                       onclick="closeMenu()"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            calculate
                        </span>
                        Savings Checker
                    </a>

                    <a href="#tool-comparison"
                       onclick="closeMenu()"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            compare_arrows
                        </span>
                        Price Comparison
                    </a>

                    <a href="#tool-history"
                       onclick="closeMenu()"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">
                            trending_down
                        </span>
                        Price History
                    </a>

                    <a href="#tool-watchlist"
                       onclick="closeMenu()"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
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

    document.body.appendChild(menuOverlay);

    const drawer =
        menuOverlay.querySelector("div > div");

    btn.addEventListener("click", () => {
        menuOverlay.classList.remove("hidden");

        setTimeout(() => {
            drawer.classList.remove("translate-x-full");
        }, 10);
    });

    const closeBtn =
        document.getElementById("closeBurgerMenu");

    if (closeBtn) {
        closeBtn.addEventListener(
            "click",
            closeMenu
        );
    }

    menuOverlay.addEventListener("click", e => {
        if (e.target === menuOverlay) {
            closeMenu();
        }
    });
}

function closeMenu() {
    const menuOverlay =
        document.getElementById("customBurgerMenu");

    if (!menuOverlay) return;

    const drawer =
        menuOverlay.querySelector("div > div");

    drawer.classList.add("translate-x-full");

    setTimeout(() => {
        menuOverlay.classList.add("hidden");
    }, 300);
}

// ============================================================
// SHARE
// ============================================================

function shareDeal(title, url) {
    const decodedTitle =
        decodeURIComponent(title);

    if (navigator.share) {
        navigator
            .share({
                title: decodedTitle,
                url: url
            })
            .catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                alert("Deal link copied to clipboard!");
            })
            .catch(() => {
                alert(url);
            });
    } else {
        alert(url);
    }
}

// ============================================================
// PRICE COMPARISON
// ============================================================

async function compareDeal(dealId) {
    if (!dealId) return;

    showComparisonModal(
        `<div class="text-center py-8">
            <span class="material-symbols-outlined text-primary text-[30px] animate-pulse">
                sync
            </span>
            <div class="mt-2 font-semibold">
                Checking prices...
            </div>
        </div>`
    );

    try {
        const response =
            await fetch(
                `${API_BASE}/api/deals/${encodeURIComponent(dealId)}/compare`
            );

        if (!response.ok) {
            throw new Error("Comparison unavailable");
        }

        const data =
            await response.json();

        const comparisonDeals =
            Array.isArray(data.deals)
                ? data.deals
                : Array.isArray(data.comparison)
                    ? data.comparison
                    : [];

        if (!comparisonDeals.length) {
            showComparisonModal(`
                <div class="text-center py-8 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[32px]">
                        search_off
                    </span>
                    <p class="mt-2">
                        No other store prices are available yet.
                    </p>
                </div>
            `);

            return;
        }

        renderComparisonResults(
            comparisonDeals
        );
    } catch (error) {
        console.error(
            "Comparison failed:",
            error
        );

        showComparisonModal(`
            <div class="text-center py-8 text-on-surface-variant">
                <span class="material-symbols-outlined text-[32px]">
                    compare_arrows
                </span>
                <p class="mt-2">
                    Price comparison is not available for this deal yet.
                </p>
            </div>
        `);
    }
}

// ============================================================
// COMPARISON MODAL
// ============================================================

function showComparisonModal(content) {
    let modal =
        document.getElementById(
            "cdComparisonModal"
        );

    if (!modal) {
        modal =
            document.createElement("div");

        modal.id =
            "cdComparisonModal";

        modal.className =
            "fixed inset-0 z-[70] bg-navy-deep/60 backdrop-blur-sm flex items-center justify-center p-4";

        modal.innerHTML = `
            <div class="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl">

                <div class="flex items-center justify-between p-4 border-b border-surface-container">

                    <div class="font-bold text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">
                            compare_arrows
                        </span>
                        Price Comparison
                    </div>

                    <button
                        id="closeComparisonModal"
                        class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center"
                    >
                        <span class="material-symbols-outlined">
                            close
                        </span>
                    </button>

                </div>

                <div id="comparisonModalBody" class="p-4"></div>

            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("closeComparisonModal")
            .addEventListener(
                "click",
                () => modal.remove()
            );

        modal.addEventListener("click", e => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    document.getElementById(
        "comparisonModalBody"
    ).innerHTML = content;
}

// ============================================================
// RENDER COMPARISON
// ============================================================

function renderComparisonResults(deals) {
    const sorted =
        [...deals].sort(
            (a, b) =>
                Number(
                    a.new_price ||
                    a.price ||
                    0
                ) -
                Number(
                    b.new_price ||
                    b.price ||
                    0
                )
        );

    const html = sorted
        .map((deal, index) => {
            const code =
                String(
                    deal.country ||
                    deal.country_code ||
                    currentCountry
                ).toUpperCase();

            const country =
                COUNTRIES[code] ||
                getCountry();

            const currency =
                deal.currency ||
                country.currency ||
                "USD";

            const price =
                Number(
                    deal.new_price ||
                    deal.price ||
                    0
                );

            const oldPrice =
                Number(
                    deal.old_price || 0
                );

            return `
                <div class="rounded-2xl border border-surface-container p-3 mb-3 bg-surface-container-lowest">

                    <div class="flex items-center justify-between gap-3">

                        <div class="min-w-0">

                            <div class="font-bold text-on-surface">
                                ${escapeHtml(deal.store || "Store")}
                            </div>

                            <div class="text-[11px] text-on-surface-variant mt-1">
                                ${country.flag}
                                ${escapeHtml(country.name)}
                            </div>

                        </div>

                        ${
                            index === 0
                                ? `
                            <span class="px-2 py-1 rounded-full bg-savings-green-subtle text-savings-green text-[10px] font-bold">
                                LOWEST PRICE
                            </span>
                        `
                                : ""
                        }

                    </div>

                    <div class="flex items-center justify-between gap-3 mt-3">

                        <div>
                            <div class="text-[20px] font-extrabold text-primary-container">
                                ${formatMoney(price, currency)}
                            </div>

                            ${
                                oldPrice
                                    ? `
                                <div class="text-[12px] line-through text-outline">
                                    ${formatMoney(oldPrice, currency)}
                                </div>
                            `
                                    : ""
                            }
                        </div>

                        ${
                            deal.url
                                ? `
                            <a
                                href="${escapeAttribute(deal.url)}"
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                class="px-3 py-2 rounded-xl bg-primary-container text-on-primary text-[12px] font-semibold"
                            >
                                Check Store
                            </a>
                        `
                                : ""
                        }

                    </div>

                </div>
            `;
        })
        .join("");

    showComparisonModal(
        `<div>${html}</div>`
    );
}

// ============================================================
// SAVINGS CHECKER
// ============================================================

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
            `$${Math.max(0, delta).toFixed(2)}`;
    }

    if (adviceEl) {
        adviceEl.textContent =
            `${store}: $${paid.toFixed(2)} vs $${current.toFixed(2)} yields ${pct}% price drop. Eligible for store price adjustments.`;
    }
}

// ============================================================
// FINAL PRICE CALCULATOR
// ============================================================

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

// ============================================================
// WATCHLIST
// ============================================================

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

// ============================================================
// PRICE COMPARISON TOOL
// ============================================================

async function runPriceComparison() {
    const input =
        document.getElementById(
            "compareProductInput"
        );

    if (!input) return;

    const keyword =
        input.value.trim();

    if (!keyword) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    const matches =
        globalDeals.filter(deal =>
            String(
                deal.title || ""
            )
                .toLowerCase()
                .includes(
                    keyword.toLowerCase()
                )
        );

    if (!matches.length) {
        alert(
            "No matching deals found yet."
        );
        return;
    }

    const deals =
        matches.slice(0, 10);

    const html = deals
        .map(deal => {
            const country =
                COUNTRIES[
                    String(
                        deal.country ||
                        deal.country_code ||
                        currentCountry
                    ).toUpperCase()
                ] || getCountry();

            const currency =
                deal.currency ||
                country.currency;

            const price =
                Number(
                    deal.new_price ||
                    deal.price ||
                    0
                );

            return `
                <div class="p-3 rounded-xl border border-surface-container mb-2">

                    <div class="font-semibold text-[13px]">
                        ${escapeHtml(deal.store || "Store")}
                    </div>

                    <div class="text-[11px] text-on-surface-variant">
                        ${country.flag} ${country.name}
                    </div>

                    <div class="flex items-center justify-between mt-2">

                        <span class="font-extrabold text-primary-container">
                            ${formatMoney(price, currency)}
                        </span>

                        ${
                            deal.url
                                ? `
                            <a
                                href="${escapeAttribute(deal.url)}"
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-[11px] font-semibold"
                            >
                                Check
                            </a>
                        `
                                : ""
                        }

                    </div>

                </div>
            `;
        })
        .join("");

    showComparisonModal(
        `
        <div class="mb-3">
            <div class="font-bold text-on-surface">
                ${escapeHtml(keyword)}
            </div>
            <div class="text-[11px] text-on-surface-variant">
                Available deals and store prices
            </div>
        </div>

        ${html}
        `
    );
}

// ============================================================
// PRICE HISTORY
// ============================================================

function runPriceHistoryCheck() {
    const input =
        document.getElementById(
            "historyProductInput"
        );

    const floor =
        document.getElementById(
            "priceFloorDisplay"
        );

    const trend =
        document.getElementById(
            "priceTrendDisplay"
        );

    if (!input) return;

    const keyword =
        input.value.trim();

    if (!keyword) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    const matches =
        globalDeals.filter(deal =>
            String(
                deal.title || ""
            )
                .toLowerCase()
                .includes(
                    keyword.toLowerCase()
                )
        );

    if (!matches.length) {
        if (floor) {
            floor.textContent =
                "No data";
        }

        if (trend) {
            trend.textContent =
                "No price history available";
        }

        return;
    }

    const prices =
        matches
            .map(deal =>
                Number(
                    deal.new_price ||
                    deal.price ||
                    0
                )
            )
            .filter(p => p > 0);

    if (!prices.length) return;

    const lowest =
        Math.min(...prices);

    if (floor) {
        floor.textContent =
            formatMoney(
                lowest,
                matches[0].currency ||
                    getCountry().currency
            );
    }

    if (trend) {
        trend.textContent =
            "Current tracked price";
    }
}

// ============================================================
// COUPON CHECKER
// ============================================================

function runCouponChecker() {
    const store =
        document.getElementById(
            "couponStoreInput"
        )?.value.trim();

    const keyword =
        document.getElementById(
            "couponKeywordInput"
        )?.value.trim();

    if (!store && !keyword) {
        alert(
            "Enter a store or product keyword."
        );
        return;
    }

    alert(
        `Coupon search requested for ${store || "stores"}${keyword ? ` - ${keyword}` : ""}.`
    );
}

// ============================================================
// HELPERS
// ============================================================

function normalizeCategory(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}

function formatCategory(value) {
    const text =
        normalizeCategory(value);

    if (!text) return "";

    return text
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");
}

function formatMoney(value, currency = "USD") {
    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: currency,
                maximumFractionDigits:
                    currency === "JPY" ||
                    currency === "KRW"
                        ? 0
                        : 2
            }
        ).format(number);
    } catch (e) {
        const country =
            Object.values(COUNTRIES).find(
                c =>
                    c.currency ===
                    currency
            );

        return `${country?.symbol || ""}${number.toFixed(2)}`;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
