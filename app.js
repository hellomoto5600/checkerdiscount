// CheckerDiscount - Complete App.js v9.0
// Country Selector + Trust Badge + Admin Views + Rating + 5 Tools + Watchlist + Blog

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

// ========== FALLBACK RATES ==========
const FALLBACK_RATES = {
    AED: 1.00, OMR: 9.54, SAR: 0.98, USD: 3.67, GBP: 4.65,
    EUR: 3.98, KWD: 11.95, QAR: 1.01, BHD: 9.74, PKR: 0.013,
    INR: 0.044, EGP: 0.076, JOD: 5.18
};

let LIVE_RATES = null;

async function loadLiveRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/AED');
        const data = await response.json();
        if (data && data.rates) LIVE_RATES = data.rates;
    } catch (e) { console.warn('Live rates unavailable'); }
}

function convertToAED(amount, currency) {
    const rates = LIVE_RATES || FALLBACK_RATES;
    const rate = rates[currency] || FALLBACK_RATES[currency] || 1;
    return Number(amount) * rate;
}

function getRate(from, to) {
    const rates = LIVE_RATES || FALLBACK_RATES;
    const fromRate = rates[from] || FALLBACK_RATES[from] || 1;
    const toRate = rates[to] || FALLBACK_RATES[to] || 1;
    return toRate / fromRate;
}

function formatAED(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    return `AED ${num.toFixed(2)}`;
}

// ========== TRUST BADGE ==========
function getTrustBadge(deal) {
    const storeType = String(deal.store_type || 'third-party').toLowerCase();
    if (storeType === 'official') {
        return {
            label: 'Official Store', icon: 'verified',
            bgClass: 'bg-savings-green-subtle', textClass: 'text-savings-green',
            borderClass: 'border-savings-green-border'
        };
    }
    return {
        label: 'Third-Party / Local', icon: 'storefront',
        bgClass: 'bg-warning-amber-subtle', textClass: 'text-warning-amber',
        borderClass: 'border-warning-amber/40'
    };
}

// ========== VIEWS ==========
function getDealViews(dealId, deal) {
    if (deal && deal.views) return Number(deal.views);
    if (!dealId) return 0;
    try {
        const views = localStorage.getItem(`cd_views_${dealId}`);
        return views ? parseInt(views) : 0;
    } catch (e) { return 0; }
}

function incrementDealViews(dealId) {
    if (!dealId) return;
    try {
        const current = getDealViews(dealId);
        localStorage.setItem(`cd_views_${dealId}`, current + 1);
    } catch (e) {}
}

function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// ========== RATING ==========
function getDealRating(dealId) {
    if (!dealId) return { up: 0, down: 0, userVote: null };
    try {
        const data = localStorage.getItem(`cd_rating_${dealId}`);
        return data ? JSON.parse(data) : { up: 0, down: 0, userVote: null };
    } catch (e) { return { up: 0, down: 0, userVote: null }; }
}

function saveDealRating(dealId, rating) {
    if (!dealId) return;
    try { localStorage.setItem(`cd_rating_${dealId}`, JSON.stringify(rating)); } catch (e) {}
}

function voteDeal(dealId, voteType) {
    if (!dealId) return;
    const rating = getDealRating(dealId);
    if (rating.userVote === voteType) {
        if (voteType === 'up') rating.up = Math.max(0, rating.up - 1);
        else rating.down = Math.max(0, rating.down - 1);
        rating.userVote = null;
        showToast('Vote removed');
    } else {
        if (rating.userVote === 'up') rating.up = Math.max(0, rating.up - 1);
        if (rating.userVote === 'down') rating.down = Math.max(0, rating.down - 1);
        if (voteType === 'up') rating.up++;
        else rating.down++;
        rating.userVote = voteType;
        showToast(voteType === 'up' ? '👍 Thanks for voting!' : '👎 Noted!');
    }
    saveDealRating(dealId, rating);
    loadDeals(currentCategory);
}

function calculateRatingPercent(rating) {
    const total = rating.up + rating.down;
    if (total === 0) return 0;
    return Math.round((rating.up / total) * 100);
}

// ========== WATCHLIST ==========
function getWatchlist() {
    try {
        const data = localStorage.getItem('cd_watchlist');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

function saveWatchlist(list) {
    try { localStorage.setItem('cd_watchlist', JSON.stringify(list)); } catch (e) {}
}

function isInWatchlist(dealId) {
    if (!dealId) return false;
    return getWatchlist().some(item => String(item.id) === String(dealId));
}

function toggleWatchlist(dealId, dealData) {
    if (!dealId) return;
    let list = getWatchlist();
    const exists = list.some(item => String(item.id) === String(dealId));

    if (exists) {
        list = list.filter(item => String(item.id) !== String(dealId));
        saveWatchlist(list);
        showToast('🤍 Removed from Favorites');
    } else {
        list.push({
            id: dealId,
            title: dealData.title || 'Deal',
            store: dealData.store || 'Store',
            price: dealData.new_price || dealData.price || 0,
            old_price: dealData.old_price || null,
            currency: dealData.currency || 'AED',
            image_url: dealData.image_url || dealData.image || '',
            url: dealData.url || '#',
            country: dealData.country || '',
            added_at: new Date().toISOString()
        });
        saveWatchlist(list);
        showToast('❤️ Saved to Favorites!');
    }

    updateFavCount();
    renderFavorites();
    loadDeals(currentCategory);
}

function removeFromFavorites(dealId) {
    let list = getWatchlist();
    list = list.filter(item => String(item.id) !== String(dealId));
    saveWatchlist(list);
    updateFavCount();
    renderFavorites();
    loadDeals(currentCategory);
    showToast('🤍 Removed from Favorites');
}

function updateFavCount() {
    const count = getWatchlist().length;
    const badge = document.getElementById('fav-count-badge');
    const menuBadge = document.getElementById('menu-fav-count');
    if (badge) badge.textContent = count;
    if (menuBadge) menuBadge.textContent = count;
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    const list = getWatchlist();

    if (list.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-on-surface-variant text-[13px]">
                <span class="material-symbols-outlined text-[32px] text-outline mb-1 block">favorite_border</span>
                No favorites yet. Tap ❤️ on any deal to save it.
            </div>`;
        return;
    }

    container.innerHTML = list.map(item => `
        <div class="flex gap-3 p-3 rounded-xl border border-surface-container bg-surface-subtle/50">
            <img src="${escapeAttribute(item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100')}" 
                 class="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                 onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100'">
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="text-[13px] font-semibold text-on-surface line-clamp-2">${escapeHtml(item.title)}</div>
                <div class="text-[11px] text-on-surface-variant mt-0.5">${escapeHtml(item.store)}</div>
                <div class="text-[14px] font-bold text-primary-container mt-1">${formatPrice(item.price, item.currency)}</div>
            </div>
            <div class="flex flex-col gap-1.5 self-center flex-shrink-0">
                <a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer" 
                   class="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
                <button onclick="removeFromFavorites('${escapeAttribute(String(item.id))}')" 
                        class="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
        </div>
    `).join("");
}

function showToast(message) {
    const existing = document.getElementById('cd-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cd-toast';
    toast.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] bg-navy-deep text-white px-5 py-3 rounded-xl shadow-2xl text-[13px] font-semibold transition-all duration-300 opacity-0 pointer-events-none';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(-10px)'; }, 10);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 2200);
    setTimeout(() => { toast.remove(); }, 2600);
}

// ========== DESKTOP CSS ==========
(function injectDesktopCSS(){
    if (window.__cdDesktopCSS) return;
    window.__cdDesktopCSS = true;
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 900px) {
        main.w-full.pt-16 { padding-top: 64px; }
        #market-deals, #favorites-section, #smart-tools { max-width: 1240px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        #discountsContainer { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
        #discountsContainer > div { height: 100%; }
      }
      @media (min-width: 1200px) { #discountsContainer { grid-template-columns: repeat(3, 1fr); } }
      .cd-flag-chip { display:inline-flex; align-items:center; justify-content:center; width:44px; height:40px; border-radius:12px; background:#eef2f6; border:2px solid transparent; font-size:22px; cursor:pointer; }
      .cd-flag-chip.active { background:#155eef; border-color:#0047c1; color:#fff; }
      .cd-best-deal { background: linear-gradient(135deg, #ecfdf3 0%, #d1fadf 100%); border: 2px solid #12b76a; border-radius: 16px; padding: 14px; margin-bottom: 14px; position: relative; }
      .cd-best-deal-badge { position: absolute; top: -10px; left: 12px; background: #12b76a; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 999px; letter-spacing: 0.05em; text-transform: uppercase; }
      .cd-comparison-img { width: 72px; height: 72px; border-radius: 12px; background: #f6f8fc; border: 1px solid #e4e7ec; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .cd-comparison-img img { width: 100%; height: 100%; object-fit: cover; }
      .cd-card { background: #FFFFFF; border-radius: 18px; padding: 16px; box-shadow: 0 2px 12px rgba(16, 24, 40, 0.06); border: 1px solid #F0F2F5; display: flex; flex-direction: column; gap: 12px; position: relative; transition: box-shadow 0.2s ease; }
      .cd-card:hover { box-shadow: 0 6px 24px rgba(16, 24, 40, 0.1); }
      .cd-heart-btn { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid #E4E7EC; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; z-index: 5; padding: 0; }
      .cd-heart-btn:hover { border-color: #D92D20; transform: scale(1.1); }
      .cd-heart-btn.saved { background: #FEE4E2; border-color: #D92D20; }
      .cd-heart-btn .material-symbols-outlined { font-size: 20px; color: #98A2B3; font-variation-settings: 'FILL' 0, 'wght' 500; }
      .cd-heart-btn.saved .material-symbols-outlined { color: #D92D20; font-variation-settings: 'FILL' 1, 'wght' 600; }
      .cd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; font-size: 13px; padding: 10px 14px; border-radius: 12px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; white-space: nowrap; }
      .cd-btn:active { transform: scale(0.96); }
      .cd-btn-compare { background: linear-gradient(135deg, #EFF4FF 0%, #DBE7FF 100%); color: #155EEF; border: 1.5px solid #B2CCFF; flex: 1; }
      .cd-btn-share { background: #F9FAFB; color: #475467; border: 1.5px solid #E4E7EC; padding: 10px; width: 42px; flex-shrink: 0; }
      .cd-btn-primary { background: linear-gradient(135deg, #155EEF 0%, #0047C1 100%); color: #FFFFFF; flex: 1; }
      .cd-store-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; background: #F9FAFB; border: 1px solid #E4E7EC; border-radius: 10px; font-size: 11px; color: #475467; width: fit-content; max-width: 100%; }
      .cd-vote-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s; }
      .cd-vote-btn.up { background: #ECFDF3; color: #027A48; border-color: #A6F4C5; }
      .cd-vote-btn.up.active { background: #12B76A; color: white; border-color: #12B76A; }
      .cd-vote-btn.down { background: #FEF3F2; color: #B42318; border-color: #FECDCA; }
      .cd-vote-btn.down.active { background: #D92D20; color: white; border-color: #D92D20; }
      .cd-vote-btn:hover { transform: scale(1.05); }
      @media (max-width: 640px) {
        .cd-card { padding: 14px; border-radius: 16px; }
        .cd-btn { font-size: 12px; padding: 9px 12px; }
        .cd-btn-share { width: 38px; padding: 9px; }
        .cd-heart-btn { width: 32px; height: 32px; top: 10px; right: 10px; }
        .cd-heart-btn .material-symbols-outlined { font-size: 18px; }
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

document.addEventListener("DOMContentLoaded", async () => {
    await loadLiveRates();
    currentCountry = detectCountry();
    setupCountrySystem();
    await fetchDealsAndInit();
    initBurgerMenu();
    setupAllTools();
    updateFavCount();
    renderFavorites();
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
    if (!filterRow) return;

    const wrapper = document.createElement("div");
    wrapper.id = "cdCountrySelector";
    wrapper.className = "mb-2";

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
            <div id="cdMoreCountries" class="hidden mt-3">
                <div class="text-[11px] font-semibold text-on-surface-variant mb-2">More Countries</div>
                <div id="cdMoreCountryList" class="flex flex-wrap gap-2"></div>
            </div>
            <button id="cdMoreCountriesBtn" type="button" class="mt-3 text-[12px] font-semibold text-primary hover:underline">More Countries</button>
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
            moreBtn.textContent = more.classList.contains("hidden") ? "More Countries" : "Hide Countries";
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

    Object.keys(COUNTRIES).filter(code => !POPULAR_COUNTRIES.includes(code)).forEach(code => {
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
    if (currentCountry === "ALL") { el.textContent = "🌐 All Countries"; return; }
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
        globalDeals = data.success && Array.isArray(data.deals) ? data.deals : (Array.isArray(data.deals) ? data.deals : []);
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
                if (data.success && Array.isArray(data.deals)) globalDeals = data.deals.map(normalizeDeal);
            }
        } catch (e) { console.warn("All-deals fetch failed:", e); }
    } else {
        try {
            const response = await fetch(`${API_BASE}/api/deals?country=${encodeURIComponent(currentCountry)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.deals) && data.deals.length > 0) {
                    const apiDeals = data.deals.map(normalizeDeal);
                    const filtered = apiDeals.filter(d => getDealCountry(d) === currentCountry);
                    if (filtered.length > 0) globalDeals = filtered;
                } else { globalDeals = globalDeals.map(normalizeDeal); }
            }
        } catch (e) { console.warn("Country API failed:", e); }
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
    copy.store_type = copy.store_type || "third-party";
    copy.views = copy.views || 0;
    return copy;
}

function getDealCountry(deal) {
    if (!deal) return "";
    let country = deal.country || deal.country_code || deal.countryCode || deal.market || deal.market_code || "";
    country = String(country).trim().toUpperCase();
    const nameMap = {
        "UNITED STATES": "US", "USA": "US", "AMERICA": "US",
        "UNITED KINGDOM": "GB", "UK": "GB",
        "OMAN": "OM", "UNITED ARAB EMIRATES": "AE", "UAE": "AE",
        "SAUDI ARABIA": "SA", "PAKISTAN": "PK", "INDIA": "IN",
        "CANADA": "CA", "AUSTRALIA": "AU", "GERMANY": "DE",
        "FRANCE": "FR", "ITALY": "IT", "SPAIN": "ES"
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

    const scoped = currentCountry === "ALL" ? globalDeals : globalDeals.filter(d => getDealCountry(d) === currentCountry);
    const categories = [...new Set(scoped.map(d => String(d.category || "").trim()).filter(Boolean))];

    let html = `<div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button type="button" data-category="all" class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl font-label-md text-[13px]">All (${scoped.length})</button>`;

    categories.forEach(category => {
        const count = scoped.filter(d => String(d.category || "").toLowerCase() === category.toLowerCase()).length;
        html += `<button type="button" data-category="${escapeAttribute(category)}" class="cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]">${escapeHtml(category)} (${count})</button>`;
    });
    html += `</div>`;

    if (categories.length === 0) html = `<div class="text-[12px] text-on-surface-variant">No categories available yet.</div>`;
    container.innerHTML = html;

    const buttons = container.querySelectorAll(".cd-category-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentCategory = button.dataset.category || "all";
            buttons.forEach(btn => btn.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]");
            button.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";
            loadDeals(currentCategory);
        });
    });

    const allButton = container.querySelector('[data-category="all"]');
    if (allButton) allButton.className = "cd-category-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";
}

function getDealCurrency(deal) {
    const dealCountry = getDealCountry(deal);
    if (dealCountry && COUNTRIES[dealCountry]) return COUNTRIES[dealCountry].currency;
    if (deal.currency) return String(deal.currency).toUpperCase();
    return "USD";
}

function formatPrice(value, currency) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const curr = currency || "USD";
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: curr, minimumFractionDigits: curr === "JPY" || curr === "KRW" ? 0 : 2, maximumFractionDigits: curr === "JPY" || curr === "KRW" ? 0 : 2 }).format(number);
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
    if (!featuredDeal) featuredDeal = [...deals].sort((a, b) => (Number(b.discount_percent) || 0) - (Number(a.discount_percent) || 0))[0];

    const spotlightContainer = document.querySelector(".relative.w-full.bg-gradient-to-b");
    if (!spotlightContainer || !featuredDeal) return;

    const imgSrc = featuredDeal.image_url || featuredDeal.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";
    const discountText = featuredDeal.discount_percent ? `${Math.round(featuredDeal.discount_percent)}% OFF` : "Special Offer";
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
          <span class="material-symbols-outlined text-[15px]">bolt</span> Deal Spotlight
        </div>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold">
          <span class="material-symbols-outlined text-[12px]">verified</span> ${escapeHtml(discountText)}
        </span>
      </div>
      <div class="flex gap-3 pt-3">
        <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
          <img class="w-full h-full object-cover" src="${escapeAttribute(imgSrc)}" alt="Spotlight Deal" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
          <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.5 rounded font-mono">${escapeHtml(featuredDeal.store || "Store")}</div>
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
          <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">${escapeHtml(featuredDeal.title || "Special Deal")}</h3>
          <div class="flex items-baseline gap-2 mt-1.5">
            <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">${formatPrice(newPrice, currency)}</span>
            ${oldPrice ? `<span class="font-price-strikethrough text-[13px] text-outline line-through">${formatPrice(oldPrice, currency)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="mt-3 pt-2.5 border-t border-surface-container flex items-center justify-between">
        <div class="px-2.5 py-1 rounded-lg bg-savings-green-subtle text-savings-green font-bold text-[12px] flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">savings</span> You Save ${formatPrice(savingsAmount, currency)}
        </div>
        <div class="flex items-center gap-2">
          <button onclick="shareDeal('${encodeURIComponent(featuredDeal.title || "")}', '${escapeAttribute(featuredDeal.url || window.location.href)}')" class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm" title="Share Deal">
            <span class="material-symbols-outlined text-[18px]">share</span>
          </button>
          <a href="${escapeAttribute(featuredDeal.url || "#")}" target="_blank" rel="noopener noreferrer" class="py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">
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
    if (currentCountry !== "ALL") deals = deals.filter(d => getDealCountry(d) === currentCountry);
    if (filter !== "all") deals = deals.filter(d => String(d.category || "").toLowerCase() === String(filter).toLowerCase());

    container.innerHTML = "";

    if (deals.length === 0) {
        const country = COUNTRIES[currentCountry];
        container.innerHTML = `<div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">
            <div class="text-3xl mb-2">${country ? country.flag : "🌐"}</div>
            <div class="font-semibold text-on-surface mb-1">No verified deals available</div>
            <div class="text-[12px]">There are currently no deals listed for ${country ? escapeHtml(country.name) : "this selection"}.</div>
        </div>`;
        return;
    }

    deals.forEach(deal => {
        const imgSrc = deal.image_url || deal.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";
        const discountText = deal.discount_percent ? `${Math.round(deal.discount_percent)}% OFF` : "Special Deal";
        const currency = getDealCurrency(deal);
        const newPrice = Number(deal.new_price || deal.price || 0);
        const oldPrice = deal.old_price ? Number(deal.old_price) : null;
        const card = document.createElement("div");
        card.className = "cd-card";
        const dealId = deal.id || "";
        const storeName = String(deal.store || deal.store_name || deal.storeName || deal.retailer || deal.retailer_name || "Store").trim();
        const rating = Number(deal.rating || 0);
        const hasRating = rating > 0;
        const savings = (oldPrice && newPrice && oldPrice > newPrice) ? (oldPrice - newPrice) : 0;
        const saved = isInWatchlist(dealId);
        const trust = getTrustBadge(deal);
        const views = getDealViews(dealId, deal);
        const dealRating = getDealRating(dealId);
        const upPercent = calculateRatingPercent(dealRating);

        const dealDataJson = escapeAttribute(JSON.stringify({
            id: dealId,
            title: deal.title || 'Deal',
            store: storeName,
            new_price: newPrice,
            old_price: oldPrice,
            currency: currency,
            image_url: imgSrc,
            url: deal.url || '#',
            country: getDealCountry(deal)
        }));

        card.innerHTML = `
          <button class="cd-heart-btn ${saved ? 'saved' : ''}" 
                  onclick='toggleWatchlist("${escapeAttribute(String(dealId))}", ${dealDataJson})'
                  title="${saved ? 'Remove from Favorites' : 'Save to Favorites'}">
            <span class="material-symbols-outlined">favorite</span>
          </button>

          <div class="flex items-center gap-2 flex-wrap pr-12">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${trust.bgClass} ${trust.textClass} text-[10px] font-bold border ${trust.borderClass}">
              <span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1;">${trust.icon}</span>
              ${trust.label}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold">
              <span class="material-symbols-outlined text-[12px]">visibility</span>
              ${formatViews(views)} views
            </span>
          </div>

          <div class="flex gap-3">
            <div class="w-[76px] h-[76px] rounded-2xl bg-surface-subtle overflow-hidden flex-shrink-0 border border-surface-container flex items-center justify-center">
              <img src="${escapeAttribute(imgSrc)}" class="w-full h-full object-cover" alt="Deal" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
            </div>
            <div class="flex flex-col min-w-0 justify-center flex-1">
              <h3 class="text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">${escapeHtml(deal.title || "Deal")}</h3>
              <div class="flex items-baseline gap-2 mt-1.5 flex-wrap">
                <span class="text-[18px] font-extrabold text-primary-container">${formatPrice(newPrice, currency)}</span>
                ${oldPrice ? `<span class="text-[12px] text-outline line-through">${formatPrice(oldPrice, currency)}</span>` : ""}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined text-warning-amber text-[14px]" style="font-variation-settings:'FILL' 1;">star</span>
                <span class="text-[12px] font-bold text-on-surface">${hasRating ? rating.toFixed(1) : "—"}</span>
                <span class="text-[11px] text-on-surface-variant">/ 5</span>
              </div>
            </div>
          </div>

          ${savings > 0 ? `
          <div class="px-3 py-2 rounded-xl bg-gradient-to-r from-savings-green-subtle to-savings-green-subtle/30 text-savings-green font-bold text-[12px] flex items-center gap-1.5 border border-savings-green-border/50">
            <span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">savings</span>
            You Save ${formatPrice(savings, currency)}
          </div>` : ""}

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="voteDeal('${escapeAttribute(String(dealId))}', 'up')" 
                    class="cd-vote-btn up ${dealRating.userVote === 'up' ? 'active' : ''}">
              <span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' 1;">thumb_up</span>
              ${dealRating.up > 0 ? `(${dealRating.up})` : ''} ${upPercent > 0 ? upPercent + '%' : 'Helpful'}
            </button>
            <button onclick="voteDeal('${escapeAttribute(String(dealId))}', 'down')" 
                    class="cd-vote-btn down ${dealRating.userVote === 'down' ? 'active' : ''}">
              <span class="material-symbols-outlined text-[14px]">thumb_down</span>
            </button>
          </div>

          <div class="cd-store-badge">
            <span class="text-[16px] flex-shrink-0">${getDealFlag(deal)}</span>
            <span class="font-semibold text-on-surface">${escapeHtml(storeName)}</span>
            <span class="text-outline">·</span>
            <span class="truncate">${escapeHtml(getDealCountryName(deal))}</span>
          </div>

          <div class="flex items-center gap-2">
            ${dealId ? `<button onclick="openDealComparison('${escapeAttribute(String(dealId))}')" class="cd-btn cd-btn-compare" title="Compare prices">
                <span class="material-symbols-outlined text-[16px]">compare_arrows</span>
                <span>Compare</span>
              </button>` : ""}
            <button onclick="shareDeal('${encodeURIComponent(deal.title || "")}', '${escapeAttribute(deal.url || window.location.href)}')" class="cd-btn cd-btn-share" title="Share Deal">
              <span class="material-symbols-outlined text-[16px]">share</span>
            </button>
            <a href="${escapeAttribute(deal.url || "#")}" target="_blank" rel="noopener noreferrer" class="cd-btn cd-btn-primary">
              <span>Get Deal</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
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
                <div id="cdComparisonContent" class="p-4"><div class="text-center py-8 text-on-surface-variant">Loading comparison...</div></div>
            </div>`;
        document.body.appendChild(modal);
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const content = document.getElementById("cdComparisonContent");
    if (!content) return;
    content.innerHTML = `<div class="text-center py-8 text-on-surface-variant"><span class="material-symbols-outlined animate-spin">progress_activity</span><div class="mt-2">Checking other stores...</div></div>`;

    try {
        const response = await fetch(`${API_BASE}/api/deals/${encodeURIComponent(dealId)}/compare`);
        if (!response.ok) throw new Error("Comparison API failed");
        const data = await response.json();
        const comparisons = Array.isArray(data) ? data : (Array.isArray(data.deals) ? data.deals : (Array.isArray(data.offers) ? data.offers : (Array.isArray(data.comparisons) ? data.comparisons : [])));

        if (!comparisons.length) {
            content.innerHTML = `<div class="text-center py-8"><div class="text-3xl mb-2">🔎</div><div class="font-semibold text-on-surface">No other store prices found</div><div class="text-[12px] text-on-surface-variant mt-1">We will show more comparisons as they become available.</div></div>`;
            return;
        }

        let cheapestAed = Infinity;
        let cheapestOffers = [];

        comparisons.forEach(item => {
            const normalized = normalizeDeal(item);
            const currency = getDealCurrency(normalized);
            const price = Number(normalized.new_price || normalized.price || 0);
            const priceAed = convertToAED(price, currency);
            if (priceAed > 0) {
                if (priceAed < cheapestAed - 0.01) { cheapestAed = priceAed; cheapestOffers = [{ normalized, currency, price, priceAed }]; }
                else if (Math.abs(priceAed - cheapestAed) < 0.01) { cheapestOffers.push({ normalized, currency, price, priceAed }); }
            }
        });

        let bestDealHtml = "";
        if (cheapestOffers.length > 0 && comparisons.length > 1) {
            if (cheapestOffers.length === 1) {
                const cheapest = cheapestOffers[0];
                const cheapestCountry = COUNTRIES[getDealCountry(cheapest.normalized)];
                const cheapestImg = cheapest.normalized.image_url || cheapest.normalized.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";
                const cheapestTrust = getTrustBadge(cheapest.normalized);
                bestDealHtml = `<div class="cd-best-deal">
                    <div class="cd-best-deal-badge">🏆 Best Deal</div>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="cd-comparison-img" style="border-color:#12b76a;">
                            <img src="${escapeAttribute(cheapestImg)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-[16px]">${cheapestCountry?.flag || "🌐"}</span>
                                <span class="font-bold text-on-surface text-[15px]">${escapeHtml(cheapest.normalized.store || "Store")}</span>
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${cheapestTrust.bgClass} ${cheapestTrust.textClass} text-[10px] font-bold">
                                    <span class="material-symbols-outlined text-[11px]">${cheapestTrust.icon}</span>${cheapestTrust.label}
                                </span>
                            </div>
                            <div class="flex items-baseline gap-2">
                                <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">${formatPrice(cheapest.price, cheapest.currency)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 pt-2 border-t border-savings-green/30 text-[11px] text-secondary">
                        <span class="material-symbols-outlined text-[12px] align-middle">info</span>
                        Approximate: <strong>${formatAED(cheapest.priceAed)}</strong> · Rate may vary.
                    </div>
                </div>`;
            } else {
                const tieImg = cheapestOffers[0].normalized.image_url || cheapestOffers[0].normalized.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";
                const storesList = cheapestOffers.map(o => {
                    const c = COUNTRIES[getDealCountry(o.normalized)];
                    return `<span class="inline-flex items-center gap-1 mr-2"><span>${c?.flag || "🌐"}</span> <strong>${escapeHtml(o.normalized.store || "Store")}</strong></span>`;
                }).join("");
                bestDealHtml = `<div class="cd-best-deal" style="border-color:#f79009;background:linear-gradient(135deg,#fffaeb 0%,#fef0c7 100%);">
                    <div class="cd-best-deal-badge" style="background:#f79009;">⚡ Best Price (Tie)</div>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="cd-comparison-img" style="border-color:#f79009;">
                            <img src="${escapeAttribute(tieImg)}">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-[11px] font-bold text-orange-700 uppercase mb-1">Same price at ${cheapestOffers.length} stores</div>
                            <div class="flex flex-wrap items-center gap-1 mb-2">${storesList}</div>
                            <div class="font-headline-sm text-[20px] font-extrabold text-orange-600">${formatPrice(cheapestOffers[0].price, cheapestOffers[0].currency)}</div>
                        </div>
                    </div>
                </div>`;
            }
        }

        content.innerHTML = bestDealHtml + comparisons.map(item => {
            const normalized = normalizeDeal(item);
            const countryCode = getDealCountry(normalized);
            const currency = getDealCurrency(normalized);
            const price = Number(normalized.new_price || normalized.price || 0);
            const rating = Number(normalized.rating || 0);
            const priceAed = convertToAED(price, currency);
            const isCheapest = cheapestOffers.some(o => o.normalized.id === normalized.id);
            const imgSrc = normalized.image_url || normalized.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";
            const trust = getTrustBadge(normalized);
            return `<div class="border ${isCheapest ? 'border-2 border-savings-green bg-savings-green-subtle/30' : 'border-surface-container'} rounded-2xl p-3 mb-3">
                <div class="flex items-center gap-3">
                    <div class="cd-comparison-img"><img src="${escapeAttribute(imgSrc)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'"></div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span>${COUNTRIES[countryCode]?.flag || "🌐"}</span>
                            <span class="font-semibold text-on-surface">${escapeHtml(normalized.store || "Store")}</span>
                            <span class="text-[11px] text-on-surface-variant">⭐ ${rating > 0 ? rating.toFixed(1) : "—"}</span>
                            ${isCheapest ? `<span class="text-[10px] font-bold text-secondary bg-savings-green-subtle px-2 py-0.5 rounded-full">BEST PRICE</span>` : ""}
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${trust.bgClass} ${trust.textClass} text-[9px] font-bold">
                                <span class="material-symbols-outlined text-[10px]">${trust.icon}</span>${trust.label}
                            </span>
                        </div>
                        <div class="text-[12px] text-on-surface-variant mt-1 line-clamp-2">${escapeHtml(normalized.title || "Product")}</div>
                        <div class="flex items-baseline gap-2 mt-1 flex-wrap">
                            <span class="font-bold text-primary text-[16px]">${formatPrice(price, currency)}</span>
                            <span class="text-[10px] text-on-surface-variant">≈ ${formatAED(priceAed)}</span>
                        </div>
                    </div>
                </div>
                ${normalized.url ? `<a href="${escapeAttribute(normalized.url)}" target="_blank" rel="noopener noreferrer" class="cd-btn cd-btn-primary mt-3 w-full">View Deal <span class="material-symbols-outlined text-[15px]">arrow_forward</span></a>` : ""}
            </div>`;
        }).join("");

    } catch (error) {
        console.error("Comparison error:", error);
        content.innerHTML = `<div class="text-center py-8 text-on-surface-variant"><div class="text-2xl mb-2">⚠️</div><div class="font-semibold text-on-surface">Comparison not available</div></div>`;
    }
}

function closeComparisonModal() {
    const modal = document.getElementById("cdComparisonModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// ========== 5 SMART TOOLS ==========
function setupAllTools() {
    setupDealScoreTool();
    setupFinalPriceTool();
    setupCurrencyTool();
    setupUnitPriceTool();
    setupBestTimeTool();
}

function setupDealScoreTool() {
    const container = document.getElementById('tool-dealscore');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 space-y-3">
            <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">stars</span>
                </span>
                <div>
                    <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Deal Score</h3>
                    <p class="text-[11px] text-on-surface-variant">Is this deal good? Get instant score</p>
                </div>
            </div>
            <div class="space-y-2">
                <input id="ds-price" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Current price (e.g. 899)" type="number" step="0.01">
                <input id="ds-old" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Old price (e.g. 1299)" type="number" step="0.01">
                <select id="ds-category" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container">
                    <option value="general">Category: General</option>
                    <option value="electronics">Electronics</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="fashion">Fashion</option>
                    <option value="beauty">Beauty</option>
                </select>
                <button onclick="calculateDealScore()" class="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm">Calculate Deal Score</button>
            </div>
            <div id="ds-result" class="hidden"></div>
        </div>
    `;
}

function calculateDealScore() {
    const price = parseFloat(document.getElementById('ds-price')?.value) || 0;
    const oldPrice = parseFloat(document.getElementById('ds-old')?.value) || 0;
    const category = document.getElementById('ds-category')?.value || 'general';
    const resultEl = document.getElementById('ds-result');
    if (!resultEl) return;

    if (!price || !oldPrice || oldPrice <= price) {
        resultEl.className = 'p-3 rounded-xl bg-error-container text-on-error-container text-[13px]';
        resultEl.textContent = '⚠️ Please enter valid prices (old must be higher)';
        resultEl.classList.remove('hidden');
        return;
    }

    const discountPct = ((oldPrice - price) / oldPrice) * 100;
    const avgDiscounts = { general: 25, electronics: 20, home: 30, fashion: 35, beauty: 25 };
    const avg = avgDiscounts[category] || 25;
    let score = Math.min(10, (discountPct / avg) * 7);
    score = Math.round(score * 10) / 10;

    let verdict, emoji, colorClass;
    if (score >= 8) { verdict = 'Excellent Deal! Buy Now'; emoji = '🌟'; colorClass = 'bg-savings-green-subtle text-savings-green'; }
    else if (score >= 6) { verdict = 'Good Deal — Worth Buying'; emoji = '✅'; colorClass = 'bg-savings-green-subtle text-savings-green'; }
    else if (score >= 4) { verdict = 'Average — Consider Waiting'; emoji = '⚠️'; colorClass = 'bg-warning-amber-subtle text-warning-amber'; }
    else { verdict = 'Weak Deal — Better Options Likely'; emoji = '❌'; colorClass = 'bg-error-container text-on-error-container'; }

    const stars = '⭐'.repeat(Math.round(score / 2)) + '☆'.repeat(5 - Math.round(score / 2));

    resultEl.className = `p-3 rounded-xl ${colorClass} text-[13px] space-y-1`;
    resultEl.innerHTML = `
        <div class="font-bold text-[15px]">${emoji} ${score.toFixed(1)} / 10</div>
        <div class="text-[13px]">${stars}</div>
        <div class="font-semibold">${verdict}</div>
        <div class="text-[11px] opacity-80">Save ${discountPct.toFixed(1)}% (avg: ${avg}%)</div>
    `;
    resultEl.classList.remove('hidden');
}
window.calculateDealScore = calculateDealScore;

function setupFinalPriceTool() {
    const container = document.getElementById('tool-finalprice');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 space-y-3">
            <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-warning-amber/10 text-warning-amber flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">calculate</span>
                </span>
                <div>
                    <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Final Price Calculator</h3>
                    <p class="text-[11px] text-on-surface-variant">Total cost at checkout</p>
                </div>
            </div>
            <div class="space-y-2">
                <input id="fp-price" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Product price (e.g. 899)" type="number" step="0.01">
                <input id="fp-coupon" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Coupon / discount (e.g. 50)" type="number" step="0.01">
                <input id="fp-shipping" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Shipping (e.g. 15)" type="number" step="0.01">
                <input id="fp-vat" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="VAT % (e.g. 5)" type="number" step="0.01">
                <button onclick="calculateFinalPrice()" class="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm">Calculate Total</button>
            </div>
            <div id="fp-result" class="hidden"></div>
        </div>
    `;
}

function calculateFinalPrice() {
    const price = parseFloat(document.getElementById('fp-price')?.value) || 0;
    const coupon = parseFloat(document.getElementById('fp-coupon')?.value) || 0;
    const shipping = parseFloat(document.getElementById('fp-shipping')?.value) || 0;
    const vatPct = parseFloat(document.getElementById('fp-vat')?.value) || 0;
    const resultEl = document.getElementById('fp-result');
    if (!resultEl) return;

    if (!price) {
        resultEl.className = 'p-3 rounded-xl bg-error-container text-on-error-container text-[13px]';
        resultEl.textContent = '⚠️ Please enter product price';
        resultEl.classList.remove('hidden');
        return;
    }

    const subtotal = Math.max(0, price - coupon);
    const vat = subtotal * (vatPct / 100);
    const total = subtotal + vat + shipping;

    resultEl.className = 'p-3 rounded-xl bg-savings-green-subtle text-savings-green text-[13px] space-y-1';
    resultEl.innerHTML = `
        <div class="flex justify-between"><span>Product:</span><strong>AED ${price.toFixed(2)}</strong></div>
        ${coupon > 0 ? `<div class="flex justify-between"><span>Coupon:</span><strong>- AED ${coupon.toFixed(2)}</strong></div>` : ''}
        ${vat > 0 ? `<div class="flex justify-between"><span>VAT (${vatPct}%):</span><strong>+ AED ${vat.toFixed(2)}</strong></div>` : ''}
        ${shipping > 0 ? `<div class="flex justify-between"><span>Shipping:</span><strong>+ AED ${shipping.toFixed(2)}</strong></div>` : ''}
        <div class="flex justify-between pt-2 border-t border-savings-green/30 text-[15px]"><span class="font-bold">💰 Total:</span><strong>AED ${total.toFixed(2)}</strong></div>
    `;
    resultEl.classList.remove('hidden');
}
window.calculateFinalPrice = calculateFinalPrice;

function setupCurrencyTool() {
    const container = document.getElementById('tool-currency');
    if (!container) return;
    const uniqueCurrencies = [...new Set(Object.values(COUNTRIES).map(c => c.currency))];
    const opts = uniqueCurrencies.map(c => `<option value="${c}">${c}</option>`).join('');

    container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 space-y-3">
            <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">currency_exchange</span>
                </span>
                <div>
                    <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Currency Converter</h3>
                    <p class="text-[11px] text-on-surface-variant">${LIVE_RATES ? '🟢 Live rates' : '🟡 Approximate rates'}</p>
                </div>
            </div>
            <div class="space-y-2">
                <input id="cc-amount" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[14px] border border-surface-container" placeholder="Amount" type="number" step="0.01" value="100">
                <div class="grid grid-cols-2 gap-2">
                    <select id="cc-from" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container">${opts}</select>
                    <select id="cc-to" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container">${opts}</select>
                </div>
                <button onclick="convertCurrency()" class="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm">Convert</button>
            </div>
            <div id="cc-result" class="hidden"></div>
        </div>
    `;
    const fromSel = document.getElementById('cc-from');
    const toSel = document.getElementById('cc-to');
    if (fromSel) fromSel.value = 'USD';
    if (toSel) toSel.value = 'AED';
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('cc-amount')?.value) || 0;
    const from = document.getElementById('cc-from')?.value || 'USD';
    const to = document.getElementById('cc-to')?.value || 'AED';
    const resultEl = document.getElementById('cc-result');
    if (!resultEl) return;

    const rate = getRate(from, to);
    const result = amount * rate;

    resultEl.className = 'p-3 rounded-xl bg-primary-container/10 text-primary text-[13px] space-y-1';
    resultEl.innerHTML = `
        <div class="text-[16px] font-bold">${amount.toFixed(2)} ${from} = ${result.toFixed(2)} ${to}</div>
        <div class="text-[11px] opacity-75">1 ${from} = ${rate.toFixed(4)} ${to}</div>
        <div class="text-[10px] opacity-60">${LIVE_RATES ? '✅ Live rate' : '⚠️ Approximate'}</div>
    `;
    resultEl.classList.remove('hidden');
}
window.convertCurrency = convertCurrency;

function setupUnitPriceTool() {
    const container = document.getElementById('tool-unitprice');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 space-y-3">
            <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-savings-green-subtle text-savings-green flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">balance</span>
                </span>
                <div>
                    <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Unit Price Comparison</h3>
                    <p class="text-[11px] text-on-surface-variant">Which pack is cheaper per gram/ml?</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <input id="up-p1" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container" placeholder="P1 price" type="number" step="0.01">
                <input id="up-w1" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container" placeholder="P1 weight" type="number" step="0.01">
                <input id="up-p2" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container" placeholder="P2 price" type="number" step="0.01">
                <input id="up-w2" class="px-3 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container" placeholder="P2 weight" type="number" step="0.01">
            </div>
            <button onclick="compareUnitPrice()" class="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm">Compare Unit Prices</button>
            <div id="up-result" class="hidden"></div>
        </div>
    `;
}

function compareUnitPrice() {
    const p1 = parseFloat(document.getElementById('up-p1')?.value) || 0;
    const w1 = parseFloat(document.getElementById('up-w1')?.value) || 0;
    const p2 = parseFloat(document.getElementById('up-p2')?.value) || 0;
    const w2 = parseFloat(document.getElementById('up-w2')?.value) || 0;
    const resultEl = document.getElementById('up-result');
    if (!resultEl) return;

    if (!p1 || !w1 || !p2 || !w2) {
        resultEl.className = 'p-3 rounded-xl bg-error-container text-on-error-container text-[13px]';
        resultEl.textContent = '⚠️ Please fill all fields';
        resultEl.classList.remove('hidden');
        return;
    }

    const u1 = p1 / w1;
    const u2 = p2 / w2;
    const winner = u1 < u2 ? 'Product 1' : 'Product 2';
    const saving = Math.abs(u1 - u2).toFixed(4);

    resultEl.className = 'p-3 rounded-xl bg-savings-green-subtle text-savings-green text-[13px] space-y-1';
    resultEl.innerHTML = `
        <div class="flex justify-between"><span>Product 1:</span><strong>${u1.toFixed(4)} per unit</strong></div>
        <div class="flex justify-between"><span>Product 2:</span><strong>${u2.toFixed(4)} per unit</strong></div>
        <div class="pt-2 border-t border-savings-green/30 font-bold">🏆 ${winner} is cheaper by ${saving} per unit</div>
    `;
    resultEl.classList.remove('hidden');
}
window.compareUnitPrice = compareUnitPrice;

function setupBestTimeTool() {
    const container = document.getElementById('tool-besttime');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 space-y-3">
            <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-warning-amber-subtle text-warning-amber flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">schedule</span>
                </span>
                <div>
                    <h3 class="font-headline-sm text-[16px] font-bold text-on-surface">Best Time to Buy</h3>
                    <p class="text-[11px] text-on-surface-variant">Should you wait for a better price?</p>
                </div>
            </div>
            <div class="space-y-2">
                <select id="bt-category" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container">
                    <option value="electronics">Electronics</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="fashion">Fashion</option>
                    <option value="beauty">Beauty</option>
                    <option value="general">General</option>
                </select>
                <input id="bt-discount" class="w-full px-3.5 py-2.5 rounded-xl bg-surface text-[13px] border border-surface-container" placeholder="Current discount % (e.g. 30)" type="number" step="0.1">
                <button onclick="checkBestTime()" class="w-full py-2.5 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm">Check Best Time</button>
            </div>
            <div id="bt-result" class="hidden"></div>
        </div>
    `;
}

function checkBestTime() {
    const category = document.getElementById('bt-category')?.value || 'general';
    const currentDiscount = parseFloat(document.getElementById('bt-discount')?.value) || 0;
    const resultEl = document.getElementById('bt-result');
    if (!resultEl) return;

    const monthData = {
        electronics: { best: 'November (Black Friday)', bestVal: 45, currentMonth: 20 },
        home: { best: 'November (Black Friday)', bestVal: 45, currentMonth: 25 },
        fashion: { best: 'November (Black Friday)', bestVal: 50, currentMonth: 30 },
        beauty: { best: 'November (Black Friday)', bestVal: 42, currentMonth: 25 },
        general: { best: 'November (Black Friday)', bestVal: 45, currentMonth: 25 }
    };

    const data = monthData[category] || monthData.general;

    let verdict, emoji, colorClass;
    if (currentDiscount >= data.bestVal * 0.85) {
        verdict = 'Buy Now — Price is near lowest'; emoji = '🌟';
        colorClass = 'bg-savings-green-subtle text-savings-green';
    } else if (currentDiscount >= data.currentMonth) {
        verdict = 'Good Deal — Could wait for better'; emoji = '✅';
        colorClass = 'bg-savings-green-subtle text-savings-green';
    } else {
        verdict = 'Wait — Better deals come in ' + data.best; emoji = '⏳';
        colorClass = 'bg-warning-amber-subtle text-warning-amber';
    }

    resultEl.className = `p-3 rounded-xl ${colorClass} text-[13px] space-y-1`;
    resultEl.innerHTML = `
        <div class="font-bold text-[14px]">${emoji} ${verdict}</div>
        <div class="text-[11px] opacity-80">
            📊 Current: ${currentDiscount}% off<br>
            🎯 Best expected: ${data.bestVal}% off (${data.best})<br>
            📅 Avg this month: ${data.currentMonth}%
        </div>
        <div class="text-[10px] opacity-70 pt-1">💡 Based on seasonal patterns</div>
    `;
    resultEl.classList.remove('hidden');
}
window.checkBestTime = checkBestTime;

// ========== BURGER MENU (v9 — Logo + Blog link added) ==========
function initBurgerMenu() {
    const btn = document.getElementById("burgerMenuBtn");
    if (!btn) return;
    if (document.getElementById("customBurgerMenu")) return;

    const menuOverlay = document.createElement("div");
    menuOverlay.id = "customBurgerMenu";
    menuOverlay.className = "fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm hidden transition-opacity duration-300";

    menuOverlay.innerHTML = `
        <div class="absolute right-0 top-0 h-full w-[320px] bg-surface-container-lowest shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300">
            <div class="bg-gradient-to-br from-primary-container via-primary to-primary-dark p-5 pb-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div class="relative flex items-center justify-between">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" class="h-11 w-auto">
                        <defs>
                            <linearGradient id="cdMenuGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#70FDA7" />
                                <stop offset="100%" stop-color="#12B76A" />
                            </linearGradient>
                        </defs>
                        <g>
                            <path d="M26 4C14 4 6 8 6 8C6 24 10 42 26 56C42 42 46 24 46 8C46 8 38 4 26 4Z" fill="#FFFFFF" opacity="0.95" />
                            <path d="M18 28L23 33L34 20" stroke="url(#cdMenuGreen)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="36" cy="14" r="4" fill="url(#cdMenuGreen)" />
                        </g>
                        <text x="60" y="39" font-family="'Inter', system-ui" font-size="20" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">Checker<tspan font-weight="500" fill="#70FDA7">Discount</tspan></text>
                    </svg>
                    <button id="closeBurgerMenu" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white" type="button">
                        <span class="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <p class="relative text-white/80 text-[11px] mt-3 font-medium tracking-wide uppercase">Smart Shopping Made Easy</p>
            </div>

            <div class="flex-1 overflow-y-auto p-4">
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-3 mt-2">Main Menu</div>

                <a href="index.html" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">home</span>
                    </span>
                    <span class="flex-1">Home</span>
                </a>

                <a href="blog.html" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">article</span>
                    </span>
                    <span class="flex-1">Blog</span>
                    <span class="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">NEW</span>
                </a>

                <a href="customer.html" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">person</span>
                    </span>
                    <span class="flex-1">My Account</span>
                </a>

                <a href="#market-deals" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-savings-green-subtle text-savings-green flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">local_offer</span>
                    </span>
                    <span class="flex-1">Top Deals</span>
                    <span class="px-2 py-0.5 rounded-full bg-savings-green-subtle text-savings-green text-[10px] font-bold">HOT</span>
                </a>

                <a href="#favorites-section" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;">favorite</span>
                    </span>
                    <span class="flex-1">My Favorites</span>
                    <span id="menu-fav-count" class="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">0</span>
                </a>

                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-3 mt-5">Smart Tools</div>

                <a href="#tool-dealscore" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">stars</span>
                    </span>
                    <span class="flex-1">Deal Score</span>
                </a>

                <a href="#tool-finalprice" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-warning-amber/10 text-warning-amber flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">calculate</span>
                    </span>
                    <span class="flex-1">Final Price</span>
                </a>

                <a href="#tool-currency" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">currency_exchange</span>
                    </span>
                    <span class="flex-1">Currency Converter</span>
                </a>

                <a href="#tool-unitprice" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-savings-green-subtle text-savings-green flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">balance</span>
                    </span>
                    <span class="flex-1">Unit Price</span>
                </a>

                <a href="#tool-besttime" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-warning-amber-subtle text-warning-amber flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[20px]">schedule</span>
                    </span>
                    <span class="flex-1">Best Time to Buy</span>
                </a>
            </div>

            <div class="p-4 border-t border-surface-container bg-surface-container-low/50">
                <div class="flex items-center justify-center gap-2 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-savings-green text-[14px]">verified</span>
                    <span class="font-semibold">Verified Deals Worldwide</span>
                </div>
                <div class="text-center text-[10px] text-outline mt-1">© 2025 CheckerDiscount</div>
            </div>
        </div>
    `;

    document.body.appendChild(menuOverlay);
    const drawer = menuOverlay.querySelector("div > div");

    btn.addEventListener("click", () => {
        updateFavCount();
        menuOverlay.classList.remove("hidden");
        setTimeout(() => drawer.classList.remove("translate-x-full"), 10);
    });

    const closeBtn = document.getElementById("closeBurgerMenu");
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menuOverlay.addEventListener("click", e => { if (e.target === menuOverlay) closeMenu(); });
}

function closeMenu() {
    const menuOverlay = document.getElementById("customBurgerMenu");
    if (!menuOverlay) return;
    const drawer = menuOverlay.querySelector("div > div");
    drawer.classList.add("translate-x-full");
    setTimeout(() => menuOverlay.classList.add("hidden"), 300);
}

function shareDeal(title, url) {
    const decodedTitle = decodeURIComponent(title);
    if (navigator.share) {
        navigator.share({ title: decodedTitle, url: url }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!')).catch(() => alert("Deal link: " + url));
    } else { alert("Deal link: " + url); }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttribute(value) { return escapeHtml(value); }

// Global exports
window.selectCountry = selectCountry;
window.closeMenu = closeMenu;
window.shareDeal = shareDeal;
window.toggleWatchlist = toggleWatchlist;
window.removeFromFavorites = removeFromFavorites;
window.voteDeal = voteDeal;
window.openDealComparison = openDealComparison;
window.closeComparisonModal = closeComparisonModal;
window.showToast = showToast;
