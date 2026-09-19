// CheckerDiscount Frontend Logic - Updated for 7 Requirements

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

const COUNTRIES = {
    ALL: { code: "ALL", flag: "🌍", name: "All Countries", currency: "USD", symbol: "$" },
    US: { code: "US", flag: "🇺🇸", name: "United States", currency: "USD", symbol: "$" },
    GB: { code: "GB", flag: "🇬🇧", name: "United Kingdom", currency: "GBP", symbol: "£" },
    OM: { code: "OM", flag: "🇴🇲", name: "Oman", currency: "OMR", symbol: "OMR" },
    SA: { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", currency: "SAR", symbol: "SAR" }
};

let allDeals = [];
let currentCountry = "ALL"; // Default: Show all countries

// Fetch deals on page load
async function loadDeals() {
    try {
        const res = await fetch(`${API_BASE}/api/deals`);
        const data = await res.json();
        if (data.success) {
            allDeals = data.deals;
            renderDeals();
            renderFeaturedDeals();
        }
    } catch (err) {
        console.error("Failed to load deals:", err);
    }
}

// Filter deals based on selected country (Default is ALL)
function filterByCountry(countryCode) {
    currentCountry = countryCode;
    renderDeals();
}

// Render main deals list
function renderDeals() {
    const container = document.getElementById("deals-container");
    if (!container) return;

    let filtered = allDeals;
    if (currentCountry !== "ALL") {
        filtered = allDeals.filter(d => d.country === currentCountry);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-deals">No deals available for this region.</p>`;
        return;
    }

    container.innerHTML = filtered.map(deal => {
        const oldPrice = parseFloat(deal.old_price) || 0;
        const newPrice = parseFloat(deal.new_price) || 0;
        const savings = (oldPrice - newPrice > 0) ? (oldPrice - newPrice).toFixed(3) : 0;
        const currencySymbol = deal.currency || 'USD';
        const rating = deal.rating ? Number(deal.rating).toFixed(1) : "5.0";

        return `
            <div class="deal-card">
                <div class="deal-image-wrap">
                    <img src="${deal.image || 'placeholder.jpg'}" alt="${deal.title}" loading="lazy">
                    <span class="deal-badge">${deal.store || 'Store'}</span>
                </div>
                <div class="deal-content">
                    <div class="deal-rating">⭐ ${rating}</div>
                    <h3 class="deal-title">${deal.title}</h3>
                    <p class="deal-desc">${deal.description}</p>
                    <div class="price-section">
                        <span class="old-price">${currencySymbol} ${oldPrice.toFixed(3)}</span>
                        <span class="new-price">${currencySymbol} ${newPrice.toFixed(3)}</span>
                    </div>
                    ${savings > 0 ? `<div class="savings-text">You Save ${currencySymbol}${savings}</div>` : ''}
                    <a href="${deal.affiliate_link}" target="_blank" class="deal-btn">Get Deal</a>
                </div>
            </div>
        `;
    }).join("");
}

// Render only Manually Featured Deals in the Spotlight Section
function renderFeaturedDeals() {
    const featuredContainer = document.getElementById("featured-container");
    if (!featuredContainer) return;

    // Filter deals where is_featured == 1 (Manually chosen by Admin)
    const featuredDeals = allDeals.filter(d => d.is_featured === 1);

    if (featuredDeals.length === 0) {
        featuredContainer.innerHTML = `<p class="no-deals">No featured deals at the moment.</p>`;
        return;
    }

    featuredContainer.innerHTML = featuredDeals.map(deal => {
        const currencySymbol = deal.currency || 'USD';
        const rating = deal.rating ? Number(deal.rating).toFixed(1) : "5.0";
        return `
            <div class="featured-card">
                <img src="${deal.image}" alt="${deal.title}">
                <div class="featured-info">
                    <span class="rating-badge">⭐ ${rating}</span>
                    <h4>${deal.title}</h4>
                    <a href="${deal.affiliate_link}" target="_blank" class="deal-btn">Grab Deal</a>
                </div>
            </div>
        `;
    }).join("");
}

// Initialize on load
document.addEventListener("DOMContentLoaded", loadDeals);
