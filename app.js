// CheckerDiscount - Complete App.js with all features
// Country filtering, ratings, savings, all-countries default, Best Deal comparison (with Tie support), Comparison Images, Cheaper Compare Price button

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

// ========== EXCHANGE RATES (Approximate - for comparison only) ==========
const EXCHANGE_RATES = {
    AED: 1.00,
    OMR: 9.54,
    SAR: 0.98,
    USD: 3.67,
    GBP: 4.65,
    EUR: 3.98,
    KWD: 11.95,
    QAR: 1.01,
    BHD: 9.74,
    PKR: 0.013,
    INR: 0.044,
    EGP: 0.076,
    JOD: 5.18
};

function convertToAED(amount, currency) {
    const rate = EXCHANGE_RATES[currency] || 1;
    return Number(amount) * rate;
}

function formatAED(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    return `AED ${num.toFixed(2)}`;
}

// ========== DESKTOP LAYOUT CSS ==========
(function injectDesktopCSS(){
    if (window.__cdDesktopCSS) return;
    window.__cdDesktopCSS = true;
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 900px) {
        main.w-full.pt-16 { padding-top: 64px; }
        #market-deals { max-width: 1240px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        #discountsContainer {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }
        #discountsContainer > div { height: 100%; }
        section#savings-tool,
        section#tool-comparison,
        section#tool-history,
        section#tool-coupons,
        section#tool-calculator,
        section#tool-watchlist {
          max-width: 1240px;
          margin-left: auto;
          margin-right: auto;
        }
        section.relative.w-full.bg-gradient-to-b {
          max-width: 1240px; margin: 0 auto;
        }
      }
      @media (min-width: 1200px) {
        #discountsContainer { grid-template-columns: repeat(3, 1fr); }
      }
      .cd-flag-chip {
        display:inline-flex; align-items:center; justify-content:center;
        width:44px; height:40px; border-radius:12px;
        background:#eef2f6; border:2px solid transparent;
        font-size:22px; cursor:pointer;
      }
      .cd-flag-chip.active { background:#155eef; border-color:#0047c1; color:#fff; }
      .cd-best-deal {
        background: linear-gradient(135deg, #ecfdf3 0%, #d1fadf 100%);
        border: 2px solid #12b76a;
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 14px;
        position: relative;
      }
      .cd-best-deal-badge {
        position: absolute;
        top: -10px;
        left: 12px;
        background: #12b76a;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 999px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .cd-comparison-img {
        width: 72px;
        height: 72px;
        border-radius: 10px;
        background: #f6f8fc;
        border: 1px solid #e4e7ec;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cd-comparison-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;
    document.head.appendChild(style);
})();

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

const POPULAR_COUNTRIES = ["US", "GB", "SA", "AE", "OM", "PK", "IN", "CA", "AU", "DE"];
const ALL = "ALL";

let globalDeals = [];
let currentCountry = "ALL";
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    currentCountry = detectCountry();
    setupCountrySystem();
    fetchDealsAndInit();
    initBurgerMenu();
});

function detectCountry() {
    const saved = localStorage.getItem("cd_country");
    if (saved === ALL) return ALL;
    if (saved && COUNTRIES[saved]) return saved;
    return ALL;
}

function setupCountrySystem() {
    const marketSection = document.getElementById("market-deals");
    if (!marketSection) return;
    if (document.getElementById("cdCountrySelector")) return;

    const filterRow = marketSection.querySelector(".overflow-x-auto");
    if (!filterRow) {
        console.warn("CheckerDiscount: original category filter row not found.");
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "cdCountrySelector";
    wrapper.className = "mb-4";

    wrapper.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl border border-surface-container p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3 mb-3">
                <div>
                    <div class="text-[11px] font-bold uppercase tracking-wider text-primary">Deals by Country</div>
                    <div id="cdSelectedCountryName" class="text-[15px] font-bold text-on-surface mt-0.5"></div>
                </div>
                <span class="material-symbols-outlined text-primary">public</span>
            </div>
            <div id="cdPopularCountries" class="flex gap-2 overflow-x-auto pb-1"></div>
            <div id="cdMoreCountries" class="hidden mt-3 pt-3 border-t border-surface-container">
                <div class="text-[11px] font-semibold text-on-surface-variant mb-2">More Countries</div>
                <div id="cdMoreCountryList" class="flex flex-wrap gap-2"></div>
            </div>
            <button id="cdMoreCountriesBtn" type="button"
                    class="mt-3 text-[12px] font-semibold text-primary hover:underline">More Countries</button>
        </div>
        <div id="cdCategorySelector" class="mt-3"></div>
    `;

    filterRow.parentNode.insertBefore(wrapper, filterRow);
    filterRow.style.display = "none";

    renderCountryButtons();
    renderCountryName();
    renderCountryCategories();

    const moreBtn = document.getElementById("cdMoreCountriesBtn");
    if (moreBtn) {
        moreBtn.addEventListener("click", () => {
            const more = document.getElementById("cdMoreCountries");
            if (!more) return;
            more.classList.toggle("hidden");
            moreBtn.textContent = more.classList.contains("hidden")
                ? "More Countries"
                : "Hide Countries";
        });
    }
}

function renderCountryButtons() {
    const popular = document.getElementById("cdPopularCountries");
    const more = document.getElementById("cdMoreCountryList");
    if (!popular || !more) return;

    popular.innerHTML = "";
    more.innerHTML = "";

    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "cd-flag-chip" + (currentCountry === "ALL" ? " active" : "");
    allChip.innerHTML = "🌐";
    allChip.title = "All Countries";
    allChip.addEventListener("click", () => selectCountry("ALL"));
    popular.appendChild(allChip);

    POPULAR_COUNTRIES.forEach(code => {
        const country = COUNTRIES[code];
        if (!country) return;
        popular.appendChild(createCountryButton(country));
    });

    Object.keys(COUNTRIES)
        .filter(code => !POPULAR_COUNTRIES.includes(code))
        .forEach(code => {
            const country = COUNTRIES[code];
            if (!country) return;
            more.appendChild(createCountryButton(country));
        });
}

function createCountryButton(country) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.country = country.code;
    button.className = "cd-flag-chip" + (country.code === currentCountry ? " active" : "");
    button.title = country.name;
    button.innerHTML = country.flag;
    button.addEventListener("click", () => selectCountry(country.code));
    return button;
}

function renderCountryName() {
    const el = document.getElementById("cdSelectedCountryName");
    if (!el) return;
    if (currentCountry === "ALL") {
        el.textContent = "🌐 All Countries";
        return;
    }
    const country = COUNTRIES[currentCountry];
    if (!country) return;
    el.textContent = `${country.flag} ${country.name} Deals`;
}

function selectCountry(code) {
    if (code !== "ALL" && !COUNTRIES[code]) return;
    currentCountry = code;
    currentCategory = "all";
    localStorage.setItem("cd_country", code);
    renderCountryButtons();
    renderCountryName();
    fetchCountryDeals();
}

async function fetchDealsAndInit() {
    try {
        const response = await fetch(`${API_BASE}/api/deals`);
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.deals)) {
            globalDeals = data.deals;
        } else if (Array.isArray(data.deals)) {
            globalDeals = data.deals;
        } else {
            globalDeals = [];
        }
    } catch (error) {
        console.error("Failed to fetch deals:", error);
        globalDeals = [];
    }
    await fetchCountryDeals();
}

async function fetchCountryDeals() {
    if (!Array.isArray(globalDeals)) globalDeals = [];

    if (currentCountry === "ALL") {
        try {
            const response = await fetch(`${API_BASE}/api/deals`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.deals)) {
                    globalDeals = data.deals.map(normalizeDeal);
                }
            }
        } catch (e) {
            console.warn("All-deals fetch failed:", e);
        }
    } else {
        try {
            const response = await fetch(
                `${API_BASE}/api/deals?country=${encodeURIComponent(currentCountry)}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.deals) && data.deals.length > 0) {
                    const apiDeals = data.deals.map(normalizeDeal);
                    const filtered = apiDeals.filter(
                        d => getDealCountry(d) === currentCountry
                    );
                    if (filtered.length > 0) globalDeals = filtered;
                } else {
                    globalDeals = globalDeals.map(normalizeDeal);
                }
            }
        } catch (e) {
            console.warn("Country API failed. Using local filtering:", e);
        }
    }

    globalDeals = globalDeals.map(normalizeDeal);
    renderCountryCategories();
    loadSpotlight();
    loadDeals(currentCategory);
}

function normalizeDeal(deal) {
    if (!deal || typeof deal !== "object") return {};
    const copy = { ...deal };
    copy.country = copy.country || copy.country_code || copy.countryCode || copy.market || copy.market_code || "";
    copy.category = copy.category || copy.category_name || copy.categoryName || "";
    copy.currency = copy.currency || copy.currency_code || copy.currencyCode || "";
    copy.store = copy.store || copy.store_name || copy.storeName || copy.retailer || copy.retailer_name || "";
    return copy;
}

function getDealCountry(deal) {
    if (!deal) return "";
    let country = deal.country || deal.country_code || deal.countryCode || deal.market || deal.market_code || "";
    country = String(country).trim().toUpperCase();

    const nameMap = {
        "UNITED STATES": "US", "USA": "US", "AMERICA": "US",
        "UNITED KINGDOM": "GB", "UK": "GB",
        "OMAN": "OM",
        "UNITED ARAB EMIRATES": "AE", "UAE": "AE",
        "SAUDI ARABIA": "SA",
        "PAKISTAN": "PK", "INDIA": "IN", "CANADA": "CA", "AUSTRALIA": "AU",
        "GERMANY": "DE", "FRANCE": "FR", "ITALY": "IT", "SPAIN": "ES"
    };

    if (nameMap[country]) return nameMap[country];
    if (COUNTRIES[country]) return country;

    if (!country && String(deal.currency || "").toUpperCase() === "USD") return "US";
    if (!country && String(deal.currency || "").toUpperCase() === "OMR") return "OM";

    return "";
}

function renderCountryCategories() {
    const container = document.getElementById("cdCategorySelector");
    if (!container) return;

    const scoped = currentCountry === "ALL"
        ? globalDeals
        : globalDeals.filter(d => getDealCountry(d) === currentCountry);

    const categories = [...new Set(
        scoped.map(d => String(d.category || "").trim()).filter(Boolean)
    )];

    let html = `
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button type="button" data-category="all"
          class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl font-label-md text-[13px]">
          All (${scoped.length})
        </button>
    `;

    categories.forEach(category => {
        const count = scoped.filter(
            d => String(d.category || "").toLowerCase() === category.toLowerCase()
        ).length;
        html += `
          <button type="button" data-category="${escapeAttribute(category)}"
            class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]">
            ${escapeHtml(category)} (${count})
          </button>
        `;
    });

    html += `</div>`;

    if (categories.length === 0) {
        html = `<div class="text-[12px] text-on-surface-variant">No categories available yet.</div>`;
    }

    container.innerHTML = html;

    const buttons = container.querySelectorAll(".cd-category-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentCategory = button.dataset.category || "all";
            buttons.forEach(btn => {
                btn.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]";
            });
            button.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";
            loadDeals(currentCategory);
        });
    });

    const allButton = container.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";
    }
}

function getDealCurrency(deal) {
    const dealCountry = getDealCountry(deal);
    if (dealCountry && COUNTRIES[dealCountry]) {
        return COUNTRIES[dealCountry].currency;
    }
    if (deal.currency) return String(deal.currency).toUpperCase();
    return "USD";
}

function formatPrice(value, currency) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const curr = currency || "USD";
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: curr,
            minimumFractionDigits: curr === "JPY" || curr === "KRW" ? 0 : 2,
            maximumFractionDigits: curr === "JPY" || curr === "KRW" ? 0 : 2
        }).format(number);
    } catch (e) {
        const country = Object.values(COUNTRIES).find(c => c.currency === curr);
        return `${country ? country.symbol : curr} ${number.toFixed(2)}`;
    }
}

function getDealFlag(deal) {
    const code = getDealCountry(deal);
    return COUNTRIES[code]?.flag || "🌐";
}

function getDealCountryName(deal) {
    const code = getDealCountry(deal);
    return COUNTRIES[code]?.name || "International";
}

function loadSpotlight() {
    const deals = globalDeals;
    if (!deals.length) return;

    let featuredDeal = deals.find(d => Number(d.is_featured) === 1);

    if (!featuredDeal) {
        featuredDeal = [...deals].sort(
            (a, b) => (Number(b.discount_percent) || 0) - (Number(a.discount_percent) || 0)
        )[0];
    }

    const spotlightContainer = document.querySelector(".relative.w-full.bg-gradient-to-b");
    if (!spotlightContainer || !featuredDeal) return;

    const imgSrc = featuredDeal.image_url || featuredDeal.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

    const discountText = featuredDeal.discount_percent
        ? `${Math.round(featuredDeal.discount_percent)}% OFF`
        : "Special Offer";

    const oldPrice = Number(featuredDeal.old_price || 0);
    const newPrice = Number(featuredDeal.new_price || featuredDeal.price || 0);
    const savingsAmount = oldPrice > newPrice ? oldPrice - newPrice : 0;
    const currency = getDealCurrency(featuredDeal);

    const rating = Number(featuredDeal.rating || 0);
    const hasRating = rating > 0;

    const showcaseBox = spotlightContainer.querySelector(".w-full.mt-2.bg-surface-container-lowest");
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
          <img class="w-full h-full object-cover" src="${escapeAttribute(imgSrc)}" alt="Spotlight Deal"
               onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
          <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.5 rounded font-mono">
            ${escapeHtml(featuredDeal.store || "Store")}
          </div>
        </div>
        <div class="flex flex-col min-w-0 justify-center flex-1">
          <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">
            <span>${getDealFlag(featuredDeal)}</span>
            <span>${escapeHtml(getDealCountryName(featuredDeal))}</span>
            <span>·</span>
            <span class="font-semibold text-on-surface truncate">${escapeHtml(featuredDeal.store || "Store")}</span>
            <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined" style="font-variation-settings:'FILL' 1;">star</span>
            <span class="font-bold text-on-surface">${hasRating ? rating.toFixed(1) : "—"}</span>
          </div>
          <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">
            ${escapeHtml(featuredDeal.title || "Special Deal")}
          </h3>
          <div class="flex items-baseline gap-2 mt-1.5">
            <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">
              ${formatPrice(newPrice, currency)}
            </span>
            ${oldPrice ? `<span class="font-price-strikethrough text-[13px] text-outline line-through">${formatPrice(oldPrice, currency)}</span>` : ""}
          </div>
        </div>
      </div>

      <div class="mt-3 pt-2.5 border-t border-surface-container flex items-center justify-between">
        <div class="px-2.5 py-1 rounded-lg bg-savings-green-subtle text-savings-green font-bold text-[12px] flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">savings</span>
          You Save ${formatPrice(savingsAmount, currency)}
        </div>
        <div class="flex items-center gap-2">
          <button onclick="shareDeal('${encodeURIComponent(featuredDeal.title || "")}', '${escapeAttribute(featuredDeal.url || window.location.href)}')"
                  class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm" title="Share Deal">
            <span class="material-symbols-outlined text-[18px]">share</span>
          </button>
          <a href="${escapeAttribute(featuredDeal.url || "#")}" target="_blank" rel="noopener noreferrer"
             class="py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">
            <span>Check Deal</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
    `;
}

function loadDeals(filter = "all") {
    const container = document.getElementById("discountsContainer");
    if (!container) return;

    let deals = [...globalDeals];

    if (currentCountry !== "ALL") {
        deals = deals.filter(d => getDealCountry(d) === currentCountry);
    }

    if (filter !== "all") {
        deals = deals.filter(
            d => String(d.category || "").toLowerCase() === String(filter).toLowerCase()
        );
    }

    container.innerHTML = "";

    if (deals.length === 0) {
        const country = COUNTRIES[currentCountry];
        container.innerHTML = `
            <div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">
                <div class="text-3xl mb-2">${country ? country.flag : "🌐"}</div>
                <div class="font-semibold text-on-surface mb-1">No verified deals available</div>
                <div class="text-[12px]">There are currently no deals listed for ${country ? escapeHtml(country.name) : "this selection"}.</div>
            </div>
        `;
        return;
    }

    deals.forEach(deal => {

        const imgSrc = deal.image_url || deal.image ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

        const discountText = deal.discount_percent
            ? `${Math.round(deal.discount_percent)}% OFF`
            : "Special Deal";

        const currency = getDealCurrency(deal);
        const newPrice = Number(deal.new_price || deal.price || 0);
        const oldPrice = deal.old_price ? Number(deal.old_price) : null;

        const card = document.createElement("div");
        card.className = "bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3";

        const dealId = deal.id || "";

        const storeName = String(
            deal.store || deal.store_name || deal.storeName ||
            deal.retailer || deal.retailer_name || "Store"
        ).trim();

        const rating = Number(deal.rating || 0);
        const hasRating = rating > 0;

        const savings = (oldPrice && newPrice && oldPrice > newPrice)
            ? (oldPrice - newPrice)
            : 0;

        card.innerHTML = `
          <!-- Discount Badge -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              ${deal.category ? `<span class="inline-block text-[10px] font-semibold text-primary mb-1">${escapeHtml(deal.category)}</span>` : ""}
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
              <span class="material-symbols-outlined text-[12px]">verified</span>
              ${escapeHtml(discountText)}
            </span>
          </div>

          <!-- Product Info -->
          <div class="flex gap-3">
            <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
              <img src="${escapeAttribute(imgSrc)}" class="w-full h-full object-cover" alt="Deal"
                   onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
            </div>
            <div class="flex flex-col min-w-0 justify-center flex-1">
              <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">
                ${escapeHtml(deal.title || "Deal")}
              </h3>
              <div class="flex items-baseline gap-2 mt-1.5">
                <span class="font-headline-sm text-[18px] font-extrabold text-primary-container">
                  ${formatPrice(newPrice, currency)}
                </span>
                ${oldPrice ? `<span class="font-price-strikethrough text-[13px] text-outline line-through">${formatPrice(oldPrice, currency)}</span>` : ""}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined text-warning-amber text-[14px]" style="font-variation-settings:'FILL' 1;">star</span>
                <span class="text-[12px] font-bold text-on-surface">
                  ${hasRating ? rating.toFixed(1) : "—"}
                </span>
                <span class="text-[11px] text-on-surface-variant">/ 5</span>
              </div>
            </div>
          </div>

          <!-- Savings -->
          ${savings > 0 ? `
          <div class="px-3 py-2 rounded-xl bg-savings-green-subtle text-savings-green font-bold text-[12px] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[15px]">savings</span>
            You Save ${formatPrice(savings, currency)}
          </div>` : ""}

          <!-- Store Badge + Actions -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-low">
            
            <!-- Store Badge -->
            <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-surface-container">
              <span class="text-[16px] flex-shrink-0">${getDealFlag(deal)}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[11px] font-bold text-on-surface truncate leading-tight">${escapeHtml(storeName)}</span>
                <span class="text-[9px] text-on-surface-variant truncate leading-tight">${escapeHtml(getDealCountryName(deal))}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              ${dealId ? `
                <button onclick="openDealComparison('${escapeAttribute(String(dealId))}')" 
                        class="py-2 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        title="Cheaper Compare Price">
                  <span class="material-symbols-outlined text-[16px]">compare_arrows</span>
                  <span class="text-[12px]">Cheaper Compare</span>
                </button>
              ` : ""}
              <button onclick="shareDeal('${encodeURIComponent(deal.title || "")}', '${escapeAttribute(deal.url || window.location.href)}')" 
                      class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm" 
                      title="Share Deal">
                <span class="material-symbols-outlined text-[18px]">share</span>
              </button>
              <a href="${escapeAttribute(deal.url || "#")}" target="_blank" rel="noopener noreferrer"
                 class="py-2 px-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">
                <span>Get Deal</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>
        `;

        container.appendChild(card);
    });
}

function setupFilters() {}

async function openDealComparison(dealId) {
    let modal = document.getElementById("cdComparisonModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cdComparisonModal";
        modal.className = "fixed inset-0 z-[100] hidden bg-navy-deep/60 backdrop-blur-sm p-4 items-center justify-center";
        modal.innerHTML = `
            <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl">
                <div class="sticky top-0 bg-surface-container-lowest border-b border-surface-container p-4 flex items-center justify-between">
                    <div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-primary">Cheaper Compare Price</div>
                        <h3 class="text-[17px] font-bold text-on-surface">Compare Stores</h3>
                    </div>
                    <button onclick="closeComparisonModal()" class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div id="cdComparisonContent" class="p-4">
                    <div class="text-center py-8 text-on-surface-variant">Loading comparison...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const content = document.getElementById("cdComparisonContent");
    if (!content) return;

    content.innerHTML = `
        <div class="text-center py-8 text-on-surface-variant">
            <span class="material-symbols-outlined animate-spin">progress_activity</span>
            <div class="mt-2">Checking other stores...</div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/api/deals/${encodeURIComponent(dealId)}/compare`);
        if (!response.ok) throw new Error("Comparison API failed");

        const data = await response.json();
        const comparisons = Array.isArray(data)
            ? data
            : (Array.isArray(data.deals) ? data.deals : (Array.isArray(data.offers) ? data.offers : (Array.isArray(data.comparisons) ? data.comparisons : [])));

        if (!comparisons.length) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-3xl mb-2">🔎</div>
                    <div class="font-semibold text-on-surface">No other store prices found</div>
                    <div class="text-[12px] text-on-surface-variant mt-1">We will show more comparisons as they become available.</div>
                </div>
            `;
            return;
        }

        // ========== BEST DEAL CALCULATION (with Tie handling) ==========
        let cheapestAed = Infinity;
        let cheapestOffers = [];

        comparisons.forEach(item => {
            const normalized = normalizeDeal(item);
            const currency = getDealCurrency(normalized);
            const price = Number(normalized.new_price || normalized.price || 0);
            const priceAed = convertToAED(price, currency);

            if (priceAed > 0) {
                if (priceAed < cheapestAed - 0.01) {
                    cheapestAed = priceAed;
                    cheapestOffers = [{ normalized, currency, price, priceAed }];
                } else if (Math.abs(priceAed - cheapestAed) < 0.01) {
                    cheapestOffers.push({ normalized, currency, price, priceAed });
                }
            }
        });

        // Build Best Deal banner
        let bestDealHtml = "";
        if (cheapestOffers.length > 0 && comparisons.length > 1) {
            if (cheapestOffers.length === 1) {
                const cheapest = cheapestOffers[0];
                const cheapestCountry = COUNTRIES[getDealCountry(cheapest.normalized)];
                const cheapestImg = cheapest.normalized.image_url || cheapest.normalized.image ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";

                bestDealHtml = `
                    <div class="cd-best-deal">
                        <div class="cd-best-deal-badge">🏆 Best Deal</div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="cd-comparison-img" style="border-color:#12b76a;">
                                <img src="${escapeAttribute(cheapestImg)}" alt="Best Deal"
                                     onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[16px]">${cheapestCountry?.flag || "🌐"}</span>
                                    <span class="font-bold text-on-surface text-[15px]">${escapeHtml(cheapest.normalized.store || "Store")}</span>
                                    <span class="text-[11px] text-secondary font-bold bg-savings-green-subtle px-2 py-0.5 rounded-full">CHEAPEST</span>
                                </div>
                                <div class="flex items-baseline gap-2">
                                    <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">
                                        ${formatPrice(cheapest.price, cheapest.currency)}
                                    </span>
                                    ${cheapest.normalized.old_price ? `<span class="text-[13px] text-outline line-through">${formatPrice(cheapest.normalized.old_price, cheapest.currency)}</span>` : ""}
                                </div>
                            </div>
                        </div>
                        <div class="text-[12px] text-on-surface-variant">
                            ${escapeHtml(cheapest.normalized.title || "").substring(0, 80)}...
                        </div>
                        <div class="mt-2 pt-2 border-t border-savings-green/30 text-[11px] text-secondary">
                            <span class="material-symbols-outlined text-[12px] align-middle">info</span>
                            Approximate conversion to AED: <strong>${formatAED(cheapest.priceAed)}</strong>
                            <br>
                            <span class="opacity-75">Rate may vary. Please confirm on store website.</span>
                        </div>
                    </div>
                `;
            } else {
                const tieImg = cheapestOffers[0].normalized.image_url || cheapestOffers[0].normalized.image ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";

                const storesList = cheapestOffers.map(o => {
                    const c = COUNTRIES[getDealCountry(o.normalized)];
                    return `<span class="inline-flex items-center gap-1 mr-2"><span>${c?.flag || "🌐"}</span> <strong>${escapeHtml(o.normalized.store || "Store")}</strong></span>`;
                }).join("");

                bestDealHtml = `
                    <div class="cd-best-deal" style="border-color:#f79009;background:linear-gradient(135deg,#fffaeb 0%,#fef0c7 100%);">
                        <div class="cd-best-deal-badge" style="background:#f79009;">⚡ Best Price (Tie)</div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="cd-comparison-img" style="border-color:#f79009;">
                                <img src="${escapeAttribute(tieImg)}" alt="Tie"
                                     onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'">
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-[11px] font-bold text-orange-700 uppercase mb-1">Same price at ${cheapestOffers.length} stores</div>
                                <div class="flex flex-wrap items-center gap-1 mb-2">
                                    ${storesList}
                                </div>
                                <div class="flex items-baseline gap-2">
                                    <span class="font-headline-sm text-[20px] font-extrabold text-orange-600">
                                        ${formatPrice(cheapestOffers[0].price, cheapestOffers[0].currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 pt-2 border-t border-orange-200 text-[11px] text-orange-700">
                            <span class="material-symbols-outlined text-[12px] align-middle">info</span>
                            Both stores offer the same price. Choose based on delivery, rating, or preference.
                            <br>
                            <span class="opacity-75">Rate may vary. Please confirm on store website.</span>
                        </div>
                    </div>
                `;
            }
        }

        // Build comparison list WITH IMAGES
        content.innerHTML = bestDealHtml + comparisons.map(item => {
            const normalized = normalizeDeal(item);
            const countryCode = getDealCountry(normalized);
            const currency = getDealCurrency(normalized);
            const price = Number(normalized.new_price || normalized.price || 0);
            const rating = Number(normalized.rating || 0);
            const priceAed = convertToAED(price, currency);
            const isCheapest = cheapestOffers.some(o => o.normalized.id === normalized.id);
            const imgSrc = normalized.image_url || normalized.image ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";

            return `
                <div class="border ${isCheapest ? 'border-2 border-savings-green bg-savings-green-subtle/30' : 'border-surface-container'} rounded-xl p-3 mb-3">
                    <div class="flex items-center gap-3">
                        <div class="cd-comparison-img">
                            <img src="${escapeAttribute(imgSrc)}"
                                 alt="${escapeAttribute(normalized.title || 'Product')}"
                                 onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'">
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span>${COUNTRIES[countryCode]?.flag || "🌐"}</span>
                                <span class="font-semibold text-on-surface">${escapeHtml(normalized.store || "Store")}</span>
                                <span class="text-[11px] text-on-surface-variant">⭐ ${rating > 0 ? rating.toFixed(1) : "—"}</span>
                                ${isCheapest ? `<span class="text-[10px] font-bold text-secondary bg-savings-green-subtle px-2 py-0.5 rounded-full">BEST PRICE</span>` : ""}
                            </div>
                            <div class="text-[12px] text-on-surface-variant mt-1 line-clamp-2">${escapeHtml(normalized.title || "Product")}</div>
                            <div class="flex items-baseline gap-2 mt-1">
                                <span class="font-bold text-primary text-[16px]">${formatPrice(price, currency)}</span>
                                <span class="text-[10px] text-on-surface-variant">≈ ${formatAED(priceAed)}</span>
                                ${normalized.old_price ? `<span class="text-[11px] text-on-surface-variant line-through">${formatPrice(normalized.old_price, currency)}</span>` : ""}
                            </div>
                        </div>
                    </div>
                    ${normalized.url ? `<a href="${escapeAttribute(normalized.url)}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-container text-on-primary text-[12px] font-semibold">View Deal <span class="material-symbols-outlined text-[15px]">arrow_forward</span></a>` : ""}
                </div>
            `;
        }).join("");

        if (comparisons.length > 1 && cheapestOffers.length > 0) {
            content.innerHTML += `
                <div class="mt-3 p-2 bg-surface-container-low rounded-lg text-[10px] text-on-surface-variant text-center">
                    💡 Prices converted to AED for comparison. Exchange rates are approximate and may vary.
                </div>
            `;
        }

    } catch (error) {
        console.error("Comparison error:", error);
        content.innerHTML = `
            <div class="text-center py-8 text-on-surface-variant">
                <div class="text-2xl mb-2">⚠️</div>
                <div class="font-semibold text-on-surface">Comparison is not available yet</div>
                <div class="text-[12px] mt-1">Please try again later.</div>
            </div>
        `;
    }
}

function closeComparisonModal() {
    const modal = document.getElementById("cdComparisonModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function initBurgerMenu() {
    const btn = document.getElementById("burgerMenuBtn");
    if (!btn) return;
    if (document.getElementById("customBurgerMenu")) return;

    const menuOverlay = document.createElement("div");
    menuOverlay.id = "customBurgerMenu";
    menuOverlay.className = "fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm hidden transition-opacity duration-300";

    menuOverlay.innerHTML = `
        <div class="absolute right-0 top-0 h-full w-[280px] bg-surface-container-lowest shadow-2xl p-5 flex flex-col justify-between transform translate-x-full transition-transform duration-300">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-surface-container">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-[14px]">CD</div>
                        <span class="font-headline-sm text-[16px] font-bold text-on-surface">Navigation Menu</span>
                    </div>
                    <button id="closeBurgerMenu" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                <div class="flex flex-col gap-2 pt-4">
                    <a href="index.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">home</span>
                        Home
                    </a>
                    <a href="customer.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">person</span>
                        My Account
                    </a>
                    <a href="#market-deals" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">local_offer</span>
                        Top Deals
                    </a>
                    <a href="#savings-tool" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">calculate</span>
                        Savings Checker
                    </a>
                    <a href="#tool-comparison" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">compare_arrows</span>
                        Price Comparison
                    </a>
                    <a href="#tool-history" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">trending_down</span>
                        Price History
                    </a>
                    <a href="#tool-watchlist" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px]">
                        <span class="material-symbols-outlined text-[20px] text-primary">bookmark</span>
                        Watchlist
                    </a>
                </div>
            </div>
            <div class="pt-4 border-t border-surface-container text-center text-[12px] text-on-surface-variant">
                CheckerDiscount
            </div>
        </div>
    `;

    document.body.appendChild(menuOverlay);

    const drawer = menuOverlay.querySelector("div > div");

    btn.addEventListener("click", () => {
        menuOverlay.classList.remove("hidden");
        setTimeout(() => {
            drawer.classList.remove("translate-x-full");
        }, 10);
    });

    const closeBtn = document.getElementById("closeBurgerMenu");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenu);
    }

    menuOverlay.addEventListener("click", e => {
        if (e.target === menuOverlay) closeMenu();
    });
}

function closeMenu() {
    const menuOverlay = document.getElementById("customBurgerMenu");
    if (!menuOverlay) return;
    const drawer = menuOverlay.querySelector("div > div");
    drawer.classList.add("translate-x-full");
    setTimeout(() => {
        menuOverlay.classList.add("hidden");
    }, 300);
}

function shareDeal(title, url) {
    const decodedTitle = decodeURIComponent(title);
    if (navigator.share) {
        navigator.share({ title: decodedTitle, url: url }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert("Deal link copied to clipboard!");
        }).catch(() => {
            alert("Deal link: " + url);
        });
    } else {
        alert("Deal link: " + url);
    }
}

function calculateSavings() {
    const paid = parseFloat(document.getElementById("checkerPaid")?.value) || 0;
    const current = parseFloat(document.getElementById("checkerCurrent")?.value) || 0;
    const store = document.getElementById("checkerStore")?.value || "Store";
    const delta = paid - current;
    const pct = paid > 0 ? ((delta / paid) * 100).toFixed(1) : 0;

    const deltaEl = document.getElementById("savingsDelta");
    const adviceEl = document.getElementById("savingsAdvice");

    if (deltaEl) {
        deltaEl.textContent = `$${Math.max(0, delta).toFixed(2)}`;
    }
    if (adviceEl) {
        adviceEl.textContent = `${store}: $${paid.toFixed(2)} vs $${current.toFixed(2)} yields ${pct}% price drop. Eligible for store price adjustments.`;
    }
}

function runFinalPriceCalc() {
    const price = parseFloat(document.getElementById("calcPrice")?.value) || 0;
    const coupon = parseFloat(document.getElementById("calcCoupon")?.value) || 0;
    const shipping = parseFloat(document.getElementById("calcShipping")?.value) || 0;
    const tax = parseFloat(document.getElementById("calcTax")?.value) || 0;
    const total = Math.max(0, price - coupon + shipping + tax);

    const display = document.querySelector("#finalPriceDisplay strong") || document.getElementById("finalPriceDisplay");
    if (display) {
        display.innerHTML = `
            <span class="text-on-surface-variant">Total Out-of-Pocket:</span>
            <span class="font-bold text-on-surface text-[16px]">$${total.toFixed(2)}</span>
        `;
    }
}

function addToWatchlist() {
    const name = document.getElementById("watchProductName")?.value;
    const price = document.getElementById("watchAlertPrice")?.value;
    const status = document.getElementById("watchStatusText");

    if (name && status) {
        status.textContent = `Tracking "${name}" for drops below $${price || "0.00"}`;
        alert("Added to price drop watchlist successfully!");
    }
}

function runPriceComparison() {
    const input = document.getElementById("compareProductInput");
    const value = input?.value?.trim();
    if (!value) { alert("Please enter a product name."); return; }
    alert(`Price comparison search for "${value}" will use available verified store data.`);
}

function runPriceHistoryCheck() {
    const input = document.getElementById("historyProductInput");
    const value = input?.value?.trim();
    if (!value) { alert("Please enter a product name."); return; }

    const floor = document.getElementById("priceFloorDisplay");
    const trend = document.getElementById("priceTrendDisplay");
    if (floor) floor.textContent = "Checking price history...";
    if (trend) trend.textContent = `Price history for "${value}" will appear when historical data is available.`;
}

function runCouponChecker() {
    const store = document.getElementById("couponStoreInput")?.value?.trim();
    const keyword = document.getElementById("couponKeywordInput")?.value?.trim();
    if (!store && !keyword) { alert("Please enter a store or product keyword."); return; }
    alert("Coupon checker is ready for future verified coupon data.");
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
    return escapeHtml(value);
}

window.selectCountry = selectCountry;
window.closeMenu = closeMenu;
window.shareDeal = shareDeal;
window.calculateSavings = calculateSavings;
window.runFinalPriceCalc = runFinalPriceCalc;
window.addToWatchlist = addToWatchlist;
window.runPriceComparison = runPriceComparison;
window.runPriceHistoryCheck = runPriceHistoryCheck;
window.runCouponChecker = runCouponChecker;
window.openDealComparison = openDealComparison;
window.closeComparisonModal = closeComparisonModal;
