// CheckerDiscount - Country Aware Deal System
// Keeps original CheckerDiscount functions and design
// Country filtering is based on EACH DEAL'S actual country.
// Do not replace index.html for this version.

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

const COUNTRIES = {
    US: { code: "US", flag: "🇺🇸", name: "United States", currency: "USD", symbol: "$" },
    GB: { code: "GB", flag: "🇬🇧", name: "United Kingdom", currency: "GBP", symbol: "£" },
    SA: { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
    AE: { code: "AE", flag: "🇦🇪", name: "United Arab Emirates", currency: "AED", symbol: "د.إ" },
    OM: { code: "OM", flag: "🇴🇲", name: "Oman", currency: "OMR", symbol: "ر.ع." },
    PK: { code: "PK", flag: "🇵🇰", name: "Pakistan", currency: "PKR", symbol: "₨" },
    IN: { code: "IN", flag: "🇮🇳", name: "India", currency: "INR", symbol: "₹" },
    CA: { code: "CA", flag: "🇨🇦", name: "Canada", currency: "CAD", symbol: "C$" },
    AU: { code: "AU", flag: "🇦🇺", name: "Australia", currency: "AUD", symbol: "A$" },
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
    NZ: { code: "NZ", flag: "🇳🇿", name: "New Zealand", currency: "NZD", symbol: "NZ$" },
    JP: { code: "JP", flag: "🇯🇵", name: "Japan", currency: "JPY", symbol: "¥" },
    CN: { code: "CN", flag: "🇨🇳", name: "China", currency: "CNY", symbol: "¥" },
    KR: { code: "KR", flag: "🇰🇷", name: "South Korea", currency: "KRW", symbol: "₩" },
    SG: { code: "SG", flag: "🇸🇬", name: "Singapore", currency: "SGD", symbol: "S$" },
    MY: { code: "MY", flag: "🇲🇾", name: "Malaysia", currency: "MYR", symbol: "RM" },
    TH: { code: "TH", flag: "🇹🇭", name: "Thailand", currency: "THB", symbol: "฿" },
    ID: { code: "ID", flag: "🇮🇩", name: "Indonesia", currency: "IDR", symbol: "Rp" },
    PH: { code: "PH", flag: "🇵🇭", name: "Philippines", currency: "PHP", symbol: "₱" },
    VN: { code: "VN", flag: "🇻🇳", name: "Vietnam", currency: "VND", symbol: "₫" },
    TR: { code: "TR", flag: "🇹🇷", name: "Turkey", currency: "TRY", symbol: "₺" },
    BR: { code: "BR", flag: "🇧🇷", name: "Brazil", currency: "BRL", symbol: "R$" },
    MX: { code: "MX", flag: "🇲🇽", name: "Mexico", currency: "MXN", symbol: "MX$" },
    ZA: { code: "ZA", flag: "🇿🇦", name: "South Africa", currency: "ZAR", symbol: "R" },
    QA: { code: "QA", flag: "🇶🇦", name: "Qatar", currency: "QAR", symbol: "﷼" },
    KW: { code: "KW", flag: "🇰🇼", name: "Kuwait", currency: "KWD", symbol: "د.ك" },
    BH: { code: "BH", flag: "🇧🇭", name: "Bahrain", currency: "BHD", symbol: "د.ب" }
};

const POPULAR_COUNTRIES = [
    "US", "GB", "SA", "AE", "OM", "PK", "IN", "CA", "AU", "DE"
];

let globalDeals = [];
let currentCountry = "US";
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    currentCountry = detectCountry();
    setupCountrySystem();
    fetchDealsAndInit();
    initBurgerMenu();
});


/* =========================================================
   COUNTRY DETECTION
========================================================= */

function detectCountry() {
    const saved = localStorage.getItem("cd_country");

    if (saved && COUNTRIES[saved]) {
        return saved;
    }

    try {
        const locale = navigator.language || "";
        const match = locale.match(/[-_](\w{2})$/);

        if (match) {
            const code = match[1].toUpperCase();

            if (COUNTRIES[code]) {
                localStorage.setItem("cd_country", code);
                return code;
            }
        }
    } catch (e) {}

    try {
        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "";

        if (timezone.includes("Muscat")) return "OM";
        if (timezone.includes("Dubai")) return "AE";
        if (timezone.includes("Riyadh")) return "SA";
        if (timezone.includes("Karachi")) return "PK";
        if (timezone.includes("Kolkata")) return "IN";
        if (timezone.includes("London")) return "GB";
        if (timezone.includes("Toronto")) return "CA";
        if (timezone.includes("Sydney")) return "AU";
    } catch (e) {}

    return "US";
}


/* =========================================================
   COUNTRY UI
========================================================= */

function setupCountrySystem() {
    const marketSection =
        document.getElementById("market-deals");

    if (!marketSection) return;

    if (document.getElementById("cdCountrySelector")) {
        return;
    }

    const filterRow =
        marketSection.querySelector(".overflow-x-auto");

    if (!filterRow) {
        console.warn(
            "CheckerDiscount: original category filter row not found."
        );
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id = "cdCountrySelector";
    wrapper.className = "mb-4";

    wrapper.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl border border-surface-container p-4 shadow-sm">

            <div class="flex items-center justify-between gap-3 mb-3">
                <div>
                    <div class="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Deals in Your Country
                    </div>

                    <div id="cdSelectedCountryName"
                         class="text-[15px] font-bold text-on-surface mt-0.5">
                    </div>
                </div>

                <span class="material-symbols-outlined text-primary">
                    public
                </span>
            </div>

            <div id="cdPopularCountries"
                 class="flex gap-2 overflow-x-auto pb-1">
            </div>

            <div id="cdMoreCountries"
                 class="hidden mt-3 pt-3 border-t border-surface-container">

                <div class="text-[11px] font-semibold text-on-surface-variant mb-2">
                    More Countries
                </div>

                <div id="cdMoreCountryList"
                     class="flex flex-wrap gap-2">
                </div>
            </div>

            <button id="cdMoreCountriesBtn"
                    type="button"
                    class="mt-3 text-[12px] font-semibold text-primary hover:underline">
                More Countries
            </button>

        </div>

        <div id="cdCategorySelector" class="mt-3"></div>
    `;

    filterRow.parentNode.insertBefore(wrapper, filterRow);

    filterRow.style.display = "none";

    renderCountryButtons();
    renderCountryName();
    renderCountryCategories();

    const moreBtn =
        document.getElementById("cdMoreCountriesBtn");

    if (moreBtn) {
        moreBtn.addEventListener("click", () => {
            const more =
                document.getElementById("cdMoreCountries");

            if (!more) return;

            more.classList.toggle("hidden");

            moreBtn.textContent =
                more.classList.contains("hidden")
                    ? "More Countries"
                    : "Hide Countries";
        });
    }
}


function renderCountryButtons() {
    const popular =
        document.getElementById("cdPopularCountries");

    const more =
        document.getElementById("cdMoreCountryList");

    if (!popular || !more) return;

    popular.innerHTML = "";
    more.innerHTML = "";

    POPULAR_COUNTRIES.forEach(code => {
        const country = COUNTRIES[code];

        if (!country) return;

        popular.appendChild(
            createCountryButton(country)
        );
    });

    Object.keys(COUNTRIES)
        .filter(
            code =>
                !POPULAR_COUNTRIES.includes(code)
        )
        .forEach(code => {
            const country = COUNTRIES[code];

            if (!country) return;

            more.appendChild(
                createCountryButton(country)
            );
        });
}


function createCountryButton(country) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.dataset.country = country.code;

    button.className =
        "flex-shrink-0 min-w-[48px] h-10 px-2 rounded-xl " +
        "bg-surface-container-low hover:bg-surface-container " +
        "border border-transparent flex items-center justify-center " +
        "text-[22px] transition-all";

    button.title = country.name;
    button.innerHTML = country.flag;

    if (country.code === currentCountry) {
        button.className =
            "flex-shrink-0 min-w-[48px] h-10 px-2 rounded-xl " +
            "bg-primary-container text-white border-2 border-primary " +
            "flex items-center justify-center text-[22px] shadow-sm";
    }

    button.addEventListener("click", () => {
        selectCountry(country.code);
    });

    return button;
}


function renderCountryName() {
    const el =
        document.getElementById(
            "cdSelectedCountryName"
        );

    const country =
        COUNTRIES[currentCountry];

    if (!el || !country) return;

    el.textContent =
        `${country.flag} ${country.name} Deals`;
}


function selectCountry(code) {
    if (!COUNTRIES[code]) return;

    currentCountry = code;
    currentCategory = "all";

    localStorage.setItem(
        "cd_country",
        code
    );

    renderCountryButtons();
    renderCountryName();

    fetchCountryDeals();
}


/* =========================================================
   API / DEAL LOADING
========================================================= */

async function fetchDealsAndInit() {
    try {
        const response =
            await fetch(
                `${API_BASE}/api/deals`
            );

        if (!response.ok) {
            throw new Error(
                `API returned ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            data.success &&
            Array.isArray(data.deals)
        ) {
            globalDeals = data.deals;
        } else if (
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

    await fetchCountryDeals();
}


async function fetchCountryDeals() {
    const countryCode =
        currentCountry;

    let apiReturnedSuccessfully =
        false;

    try {
        const response =
            await fetch(
                `${API_BASE}/api/deals?country=${encodeURIComponent(countryCode)}`
            );

        if (response.ok) {
            const data =
                await response.json();

            if (
                data.success &&
                Array.isArray(data.deals)
            ) {
                const apiDeals =
                    data.deals.map(deal =>
                        normalizeDeal(deal)
                    );

                const filtered =
                    apiDeals.filter(
                        deal =>
                            getDealCountry(deal) ===
                            countryCode
                    );

                /*
                 IMPORTANT:
                 Only replace globalDeals when the country API
                 actually returned valid results.
                */
                if (filtered.length > 0) {
                    globalDeals = filtered;
                } else {
                    /*
                     Keep original all-deals data so that
                     legacy/fallback filtering can still work.
                    */
                    apiReturnedSuccessfully = true;
                }
            }
        }
    } catch (error) {
        console.warn(
            "Country API failed. Using local filtering:",
            error
        );
    }

    if (!Array.isArray(globalDeals)) {
        globalDeals = [];
    }

    globalDeals =
        globalDeals
            .map(deal => normalizeDeal(deal))
            .filter(
                deal =>
                    getDealCountry(deal) ===
                    countryCode
            );

    renderCountryCategories();
    loadSpotlight();
    loadDeals(currentCategory);
}


/* =========================================================
   DEAL COUNTRY NORMALIZATION
========================================================= */

function normalizeDeal(deal) {
    if (!deal || typeof deal !== "object") {
        return {};
    }

    const copy = { ...deal };

    copy.country =
        copy.country ||
        copy.country_code ||
        copy.countryCode ||
        copy.market ||
        copy.market_code ||
        "";

    copy.category =
        copy.category ||
        copy.category_name ||
        copy.categoryName ||
        "";

    copy.currency =
        copy.currency ||
        copy.currency_code ||
        copy.currencyCode ||
        "";

    /*
     Preserve Store Name from the database/API.
     Supports common aliases without changing the original value.
    */
    copy.store =
        copy.store ||
        copy.store_name ||
        copy.storeName ||
        copy.retailer ||
        copy.retailer_name ||
        "";

    return copy;
}


function getDealCountry(deal) {
    if (!deal) return "";

    let country =
        deal.country ||
        deal.country_code ||
        deal.countryCode ||
        deal.market ||
        deal.market_code ||
        "";

    country =
        String(country)
            .trim()
            .toUpperCase();

    const nameMap = {
        "UNITED STATES": "US",
        "USA": "US",
        "AMERICA": "US",

        "UNITED KINGDOM": "GB",
        "UK": "GB",

        "OMAN": "OM",

        "UNITED ARAB EMIRATES": "AE",
        "UAE": "AE",

        "SAUDI ARABIA": "SA",

        "PAKISTAN": "PK",
        "INDIA": "IN",
        "CANADA": "CA",
        "AUSTRALIA": "AU",

        "GERMANY": "DE",
        "FRANCE": "FR",
        "ITALY": "IT",
        "SPAIN": "ES"
    };

    if (nameMap[country]) {
        return nameMap[country];
    }

    if (COUNTRIES[country]) {
        return country;
    }

    /*
     Backward compatibility for old USD deals.
    */

    if (
        !country &&
        String(deal.currency || "")
            .toUpperCase() === "USD"
    ) {
        return "US";
    }

    /*
     Backward compatibility for old Oman deals.
    */

    if (
        !country &&
        String(deal.currency || "")
            .toUpperCase() === "OMR"
    ) {
        return "OM";
    }

    return "";
}


/* =========================================================
   COUNTRY CATEGORIES
========================================================= */

function renderCountryCategories() {
    const container =
        document.getElementById(
            "cdCategorySelector"
        );

    if (!container) return;

    const categories = [
        ...new Set(
            globalDeals
                .map(deal =>
                    String(
                        deal.category || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    let html = `
        <div class="flex items-center gap-2 overflow-x-auto pb-1">

            <button
                type="button"
                data-category="all"
                class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl font-label-md text-[13px]">
                All (${globalDeals.length})
            </button>
    `;

    categories.forEach(category => {
        const count =
            globalDeals.filter(
                deal =>
                    String(
                        deal.category || ""
                    ).toLowerCase() ===
                    category.toLowerCase()
            ).length;

        html += `
            <button
                type="button"
                data-category="${escapeAttribute(category)}"
                class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]">
                ${escapeHtml(category)} (${count})
            </button>
        `;
    });

    html += `</div>`;

    if (categories.length === 0) {
        html = `
            <div class="text-[12px] text-on-surface-variant">
                No categories available for this country yet.
            </div>
        `;
    }

    container.innerHTML = html;

    const buttons =
        container.querySelectorAll(
            ".cd-category-btn"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                currentCategory =
                    button.dataset.category ||
                    "all";

                buttons.forEach(btn => {
                    btn.className =
                        "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl " +
                        "bg-surface-container hover:bg-surface-container-high " +
                        "text-on-surface-variant font-label-md text-[13px]";
                });

                button.className =
                    "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl " +
                    "bg-primary-container text-on-primary font-label-md text-[13px] " +
                    "font-semibold shadow-sm";

                loadDeals(currentCategory);
            }
        );
    });

    const allButton =
        container.querySelector(
            '[data-category="all"]'
        );

    if (allButton) {
        allButton.className =
            "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl " +
            "bg-primary-container text-on-primary font-label-md text-[13px] " +
            "font-semibold shadow-sm";
    }
}


/* =========================================================
   CURRENCY
========================================================= */

function getDealCurrency(deal) {
    const dealCountry =
        getDealCountry(deal);

    if (
        dealCountry &&
        COUNTRIES[dealCountry]
    ) {
        return COUNTRIES[dealCountry].currency;
    }

    if (deal.currency) {
        return String(
            deal.currency
        ).toUpperCase();
    }

    return "USD";
}


function formatPrice(value, currency) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    const curr =
        currency || "USD";

    try {
        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: curr,
                minimumFractionDigits:
                    curr === "JPY" ||
                    curr === "KRW"
                        ? 0
                        : 2,
                maximumFractionDigits:
                    curr === "JPY" ||
                    curr === "KRW"
                        ? 0
                        : 2
            }
        ).format(number);

    } catch (e) {
        const country =
            Object.values(COUNTRIES)
                .find(
                    c =>
                        c.currency ===
                        curr
                );

        return `${
            country
                ? country.symbol
                : curr
        } ${number.toFixed(2)}`;
    }
}


function getDealFlag(deal) {
    const code =
        getDealCountry(deal);

    return (
        COUNTRIES[code]?.flag ||
        "🌐"
    );
}


function getDealCountryName(deal) {
    const code =
        getDealCountry(deal);

    return (
        COUNTRIES[code]?.name ||
        "International"
    );
}


/* =========================================================
   SPOTLIGHT
========================================================= */

function loadSpotlight() {
    const deals =
        globalDeals;

    if (!deals.length) return;

    let featuredDeal =
        deals.find(
            d =>
                Number(d.is_featured) === 1 ||
                d.isFeatured === true
        );

    if (!featuredDeal) {
        featuredDeal =
            deals[0];
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
            ? `${Math.round(
                featuredDeal.discount_percent
            )}% OFF`
            : "Special Offer";

    const oldPrice =
        Number(
            featuredDeal.old_price ||
            0
        );

    const newPrice =
        Number(
            featuredDeal.new_price ||
            featuredDeal.price ||
            0
        );

    const savingsAmount =
        oldPrice > newPrice
            ? oldPrice - newPrice
            : 0;

    const currency =
        getDealCurrency(
            featuredDeal
        );

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

                ${escapeHtml(
                    discountText
                )}

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
                    ${escapeHtml(
                        featuredDeal.store ||
                        "Store"
                    )}
                </div>

            </div>

            <div class="flex flex-col min-w-0 justify-center flex-1">

                <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">

                    <span>
                        ${getDealFlag(
                            featuredDeal
                        )}
                    </span>

                    <span>
                        ${escapeHtml(
                            getDealCountryName(
                                featuredDeal
                            )
                        )}
                    </span>

                    <span class="text-on-surface-variant">
                        ·
                    </span>

                    <span class="font-semibold text-on-surface truncate">
                        ${escapeHtml(
                            featuredDeal.store ||
                            "Store"
                        )}
                    </span>

                    <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined fill-1">
                        star
                    </span>

                    <span class="font-bold text-on-surface">
                        4.8
                    </span>

                </div>

                <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">
                    ${escapeHtml(
                        featuredDeal.title ||
                        "Special Deal"
                    )}
                </h3>

                <div class="flex items-baseline gap-2 mt-1.5">

                    <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">
                        ${formatPrice(
                            newPrice,
                            currency
                        )}
                    </span>

                    ${
                        oldPrice
                            ? `
                                <span class="font-price-strikethrough text-[13px] text-outline line-through">
                                    ${formatPrice(
                                        oldPrice,
                                        currency
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

                Save ${formatPrice(
                    savingsAmount,
                    currency
                )}

            </div>

            <div class="flex items-center gap-2">

                <button
                    onclick="shareDeal('${encodeURIComponent(featuredDeal.title || "")}', '${escapeAttribute(featuredDeal.url || window.location.href)}')"
                    class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm"
                    title="Share Deal">

                    <span class="material-symbols-outlined text-[18px]">
                        share
                    </span>

                </button>

                <a
                    href="${escapeAttribute(
                        featuredDeal.url ||
                        "#"
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">

                    <span>
                        Check Deal
                    </span>

                    <span class="material-symbols-outlined text-[16px]">
                        arrow_forward
                    </span>

                </a>

            </div>
        </div>
    `;
}


/* =========================================================
   DEAL CARDS
========================================================= */

function loadDeals(filter = "all") {
    const container =
        document.getElementById(
            "discountsContainer"
        );

    if (!container) return;

    let deals =
        globalDeals.filter(
            deal =>
                getDealCountry(deal) ===
                currentCountry
        );

    if (filter !== "all") {
        deals =
            deals.filter(
                deal =>
                    String(
                        deal.category || ""
                    ).toLowerCase() ===
                    String(
                        filter
                    ).toLowerCase()
            );
    }

    container.innerHTML = "";

    if (deals.length === 0) {
        const country =
            COUNTRIES[currentCountry];

        container.innerHTML = `
            <div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">

                <div class="text-3xl mb-2">
                    ${
                        country
                            ? country.flag
                            : "🌐"
                    }
                </div>

                <div class="font-semibold text-on-surface mb-1">
                    No verified deals available
                </div>

                <div class="text-[12px]">
                    There are currently no deals listed for
                    ${
                        country
                            ? escapeHtml(
                                country.name
                            )
                            : "this country"
                    }.
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
                ? `${Math.round(
                    deal.discount_percent
                )}% OFF`
                : "Special Deal";

        const currency =
            getDealCurrency(deal);

        const newPrice =
            Number(
                deal.new_price ||
                deal.price ||
                0
            );

        const oldPrice =
            deal.old_price
                ? Number(
                    deal.old_price
                )
                : null;

        const card =
            document.createElement("div");

        card.className =
            "bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3";

        const dealId =
            deal.id || "";

        /*
         IMPORTANT CHANGE:
         Store Name is now displayed beside the country.
         Example:
         🇴🇲 Oman · Sharaf DG
         🇺🇸 United States · Amazon
        */

        const storeName =
            String(
                deal.store ||
                deal.store_name ||
                deal.storeName ||
                deal.retailer ||
                deal.retailer_name ||
                "Store"
            ).trim();

        card.innerHTML = `

            <div class="flex items-center justify-between gap-2">

                <div class="flex items-center gap-1.5 min-w-0">

                    <span class="text-[20px] flex-shrink-0">
                        ${getDealFlag(deal)}
                    </span>

                    <span class="font-badge-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                        ${escapeHtml(
                            getDealCountryName(
                                deal
                            )
                        )}
                    </span>

                    <span class="text-on-surface-variant text-[11px] flex-shrink-0">
                        ·
                    </span>

                    <span
                        class="font-semibold text-[12px] text-on-surface truncate"
                        title="${escapeAttribute(
                            storeName
                        )}">
                        ${escapeHtml(
                            storeName
                        )}
                    </span>

                </div>

                <span class="px-2.5 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold flex items-center gap-1 flex-shrink-0">

                    <span class="material-symbols-outlined text-[12px]">
                        verified
                    </span>

                    ${escapeHtml(
                        discountText
                    )}

                </span>

            </div>


            <div class="flex gap-3">

                <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">

                    <img
                        src="${escapeAttribute(
                            imgSrc
                        )}"
                        class="w-full h-full object-cover"
                        alt="Deal"
                        onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'"
                    >

                </div>


                <div class="flex flex-col min-w-0 justify-center flex-1">

                    <div class="flex items-center gap-1 mb-1">

                        ${
                            deal.category
                                ? `
                                    <span class="text-[10px] font-semibold text-primary">
                                        ${escapeHtml(
                                            deal.category
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">
                        ${escapeHtml(
                            deal.title ||
                            "Deal"
                        )}
                    </h3>

                    <div class="flex items-baseline gap-2 mt-1.5">

                        <span class="font-headline-sm text-[18px] font-extrabold text-primary-container">
                            ${formatPrice(
                                newPrice,
                                currency
                            )}
                        </span>

                        ${
                            oldPrice
                                ? `
                                    <span class="font-price-strikethrough text-[13px] text-outline line-through">
                                        ${formatPrice(
                                            oldPrice,
                                            currency
                                        )}
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
                        ${escapeHtml(
                            deal.last_verified_at ||
                            deal.created_at ||
                            "Verified"
                        )}
                    </span>

                </div>


                <div class="flex items-center gap-2 flex-shrink-0">

                    ${
                        dealId
                            ? `
                                <button
                                    onclick="openDealComparison('${escapeAttribute(
                                        String(
                                            dealId
                                        )
                                    )}')"
                                    class="py-2 px-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold flex items-center gap-1"
                                    title="Compare Prices">

                                    <span class="material-symbols-outlined text-[17px]">
                                        compare_arrows
                                    </span>

                                </button>
                            `
                            : ""
                    }


                    <button
                        onclick="shareDeal('${encodeURIComponent(
                            deal.title || ""
                        )}', '${escapeAttribute(
                            deal.url ||
                            window.location.href
                        )}')"
                        class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm"
                        title="Share Deal">

                        <span class="material-symbols-outlined text-[18px]">
                            share
                        </span>

                    </button>


                    <a
                        href="${escapeAttribute(
                            deal.url || "#"
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="py-2 px-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm">

                        <span>
                            Get Deal
                        </span>

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
   OLD FILTER COMPATIBILITY
========================================================= */

function setupFilters() {
    // Old static filters are intentionally hidden by the country system.
}


/* =========================================================
   PRICE COMPARISON
========================================================= */

async function openDealComparison(dealId) {

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
            "fixed inset-0 z-[100] hidden bg-navy-deep/60 backdrop-blur-sm p-4 items-center justify-center";

        modal.innerHTML = `
            <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl">

                <div class="sticky top-0 bg-surface-container-lowest border-b border-surface-container p-4 flex items-center justify-between">

                    <div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-primary">
                            Price Comparison
                        </div>

                        <h3 class="text-[17px] font-bold text-on-surface">
                            Compare Stores
                        </h3>
                    </div>

                    <button
                        onclick="closeComparisonModal()"
                        class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center">

                        <span class="material-symbols-outlined">
                            close
                        </span>

                    </button>

                </div>

                <div id="cdComparisonContent" class="p-4">
                    <div class="text-center py-8 text-on-surface-variant">
                        Loading comparison...
                    </div>
                </div>

            </div>
        `;

        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const content =
        document.getElementById(
            "cdComparisonContent"
        );

    if (!content) return;

    content.innerHTML = `
        <div class="text-center py-8 text-on-surface-variant">

            <span class="material-symbols-outlined animate-spin">
                progress_activity
            </span>

            <div class="mt-2">
                Checking other stores...
            </div>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/deals/${encodeURIComponent(
                    dealId
                )}/compare`
            );

        if (!response.ok) {
            throw new Error(
                "Comparison API failed"
            );
        }

        const data =
            await response.json();

        const comparisons =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data.deals
                    )
                        ? data.deals
                        : (
                            Array.isArray(
                                data.comparisons
                            )
                                ? data.comparisons
                                : []
                        )
                );

        if (!comparisons.length) {

            content.innerHTML = `
                <div class="text-center py-8">

                    <div class="text-3xl mb-2">
                        🔎
                    </div>

                    <div class="font-semibold text-on-surface">
                        No other store prices found
                    </div>

                    <div class="text-[12px] text-on-surface-variant mt-1">
                        We will show more comparisons as they become available.
                    </div>

                </div>
            `;

            return;
        }

        content.innerHTML =
            comparisons
                .map(item => {

                    const normalized =
                        normalizeDeal(item);

                    const countryCode =
                        getDealCountry(
                            normalized
                        );

                    const currency =
                        getDealCurrency(
                            normalized
                        );

                    const price =
                        Number(
                            normalized.new_price ||
                            normalized.price ||
                            0
                        );

                    return `
                        <div class="border border-surface-container rounded-xl p-3 mb-3">

                            <div class="flex items-center justify-between gap-3">

                                <div class="min-w-0">

                                    <div class="flex items-center gap-1.5">

                                        <span>
                                            ${
                                                COUNTRIES[
                                                    countryCode
                                                ]?.flag ||
                                                "🌐"
                                            }
                                        </span>

                                        <span class="font-semibold text-on-surface">
                                            ${escapeHtml(
                                                normalized.store ||
                                                "Store"
                                            )}
                                        </span>

                                    </div>

                                    <div class="text-[12px] text-on-surface-variant mt-1 line-clamp-2">
                                        ${escapeHtml(
                                            normalized.title ||
                                            "Product"
                                        )}
                                    </div>

                                </div>

                                <div class="text-right flex-shrink-0">

                                    <div class="font-bold text-primary text-[18px]">
                                        ${formatPrice(
                                            price,
                                            currency
                                        )}
                                    </div>

                                    ${
                                        normalized.old_price
                                            ? `
                                                <div class="text-[11px] text-on-surface-variant line-through">
                                                    ${formatPrice(
                                                        normalized.old_price,
                                                        currency
                                                    )}
                                                </div>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>

                            ${
                                normalized.url
                                    ? `
                                        <a
                                            href="${escapeAttribute(
                                                normalized.url
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-container text-on-primary text-[12px] font-semibold">

                                            View Deal

                                            <span class="material-symbols-outlined text-[15px]">
                                                arrow_forward
                                            </span>

                                        </a>
                                    `
                                    : ""
                            }

                        </div>
                    `;
                })
                .join("");

    } catch (error) {

        console.error(
            "Comparison error:",
            error
        );

        content.innerHTML = `
            <div class="text-center py-8 text-on-surface-variant">

                <div class="text-2xl mb-2">
                    ⚠️
                </div>

                <div class="font-semibold text-on-surface">
                    Comparison is not available yet
                </div>

                <div class="text-[12px] mt-1">
                    Please try again later.
                </div>

            </div>
        `;
    }
}


function closeComparisonModal() {
    const modal =
        document.getElementById(
            "cdComparisonModal"
        );

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");
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

    if (
        document.getElementById(
            "customBurgerMenu"
        )
    ) {
        return;
    }

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
                        class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container">

                        <span class="material-symbols-outlined text-[18px]">
                            close
                        </span>

                    </button>

                </div>


                <div class="flex flex-col gap-2 pt-4">

                    <a
                        href="index.html"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            home
                        </span>

                        Home
                    </a>


                    <a
                        href="#market-deals"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            local_offer
                        </span>

                        Top Deals
                    </a>


                    <a
                        href="#savings-tool"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            calculate
                        </span>

                        Savings Checker
                    </a>


                    <a
                        href="#tool-comparison"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            compare_arrows
                        </span>

                        Price Comparison
                    </a>


                    <a
                        href="#tool-history"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            trending_down
                        </span>

                        Price History
                    </a>


                    <a
                        href="#tool-watchlist"
                        onclick="closeMenu()"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">

                        <span class="material-symbols-outlined text-[20px] text-primary">
                            bookmark
                        </span>

                        Watchlist
                    </a>

                </div>

            </div>


            <div class="pt-4 border-t border-surface-container text-center text-[12px] text-on-surface-variant">
                CheckerDiscount
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

            setTimeout(() => {
                drawer.classList.remove(
                    "translate-x-full"
                );
            }, 10);
        }
    );

    const closeBtn =
        document.getElementById(
            "closeBurgerMenu"
        );

    if (closeBtn) {
        closeBtn.addEventListener(
            "click",
            closeMenu
        );
    }

    menuOverlay.addEventListener(
        "click",
        e => {

            if (
                e.target ===
                menuOverlay
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

    setTimeout(() => {
        menuOverlay.classList.add(
            "hidden"
        );
    }, 300);
}


/* =========================================================
   SHARE
========================================================= */

function shareDeal(title, url) {

    const decodedTitle =
        decodeURIComponent(title);

    if (navigator.share) {

        navigator.share({
            title: decodedTitle,
            url: url
        }).catch(() => {});

    } else if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(url)
            .then(() => {
                alert(
                    "Deal link copied to clipboard!"
                );
            })
            .catch(() => {
                alert(
                    "Deal link: " +
                    url
                );
            });

    } else {

        alert(
            "Deal link: " +
            url
        );
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
            ? (
                (delta / paid) *
                100
            ).toFixed(1)
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
            `${store}: $${paid.toFixed(
                2
            )} vs $${current.toFixed(
                2
            )} yields ${pct}% price drop. Eligible for store price adjustments.`;
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

    if (
        name &&
        status
    ) {

        status.textContent =
            `Tracking "${name}" for drops below $${
                price || "0.00"
            }`;

        alert(
            "Added to price drop watchlist successfully!"
        );
    }
}


/* =========================================================
   SMART TOOL PLACEHOLDERS
========================================================= */

function runPriceComparison() {

    const input =
        document.getElementById(
            "compareProductInput"
        );

    const value =
        input?.value?.trim();

    if (!value) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    alert(
        `Price comparison search for "${value}" will use available verified store data.`
    );
}


function runPriceHistoryCheck() {

    const input =
        document.getElementById(
            "historyProductInput"
        );

    const value =
        input?.value?.trim();

    if (!value) {
        alert(
            "Please enter a product name."
        );
        return;
    }

    const floor =
        document.getElementById(
            "priceFloorDisplay"
        );

    const trend =
        document.getElementById(
            "priceTrendDisplay"
        );

    if (floor) {
        floor.textContent =
            "Checking price history...";
    }

    if (trend) {
        trend.textContent =
            `Price history for "${value}" will appear when historical data is available.`;
    }
}


function runCouponChecker() {

    const store =
        document.getElementById(
            "couponStoreInput"
        )?.value?.trim();

    const keyword =
        document.getElementById(
            "couponKeywordInput"
        )?.value?.trim();

    if (
        !store &&
        !keyword
    ) {
        alert(
            "Please enter a store or product keyword."
        );
        return;
    }

    alert(
        "Coupon checker is ready for future verified coupon data."
    );
}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHtml(value) {

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


function escapeAttribute(value) {
    return escapeHtml(value);
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.selectCountry =
    selectCountry;

window.closeMenu =
    closeMenu;

window.shareDeal =
    shareDeal;

window.calculateSavings =
    calculateSavings;

window.runFinalPriceCalc =
    runFinalPriceCalc;

window.addToWatchlist =
    addToWatchlist;

window.runPriceComparison =
    runPriceComparison;

window.runPriceHistoryCheck =
    runPriceHistoryCheck;

window.runCouponChecker =
    runCouponChecker;

window.openDealComparison =
    openDealComparison;

window.closeComparisonModal =
    closeComparisonModal;
