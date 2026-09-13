/**
 * CheckerDiscount.com — Core Application Logic
 * Client-side data management, dynamic filtering, state handling, and modal comparisons.
 */

// Production Demo Data Structure (Phase 2 Target Data Schema)
const DEMO_CATEGORIES = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'computers', name: 'Computers & Laptops' },
    { id: 'audio', name: 'Audio & Headphones' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'fashion', name: 'Fashion & Apparel' }
];

const DEMO_STORES = [
    { id: 'amazon', name: 'Amazon' },
    { id: 'walmart', name: 'Walmart' },
    { id: 'bestbuy', name: 'Best Buy' },
    { id: 'ebay', name: 'eBay' }
];

const DEMO_PRODUCTS = [
    {
        id: "prod-101",
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        category: "audio",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        rating: 4.8,
        reviewCount: 3420,
        offers: [
            { storeId: "amazon", storeName: "Amazon", price: 298.00, referencePrice: 399.99, url: "https://amazon.com", dealScore: 94, lastChecked: "8 mins ago" },
            { storeId: "walmart", storeName: "Walmart", price: 328.00, referencePrice: 399.99, url: "https://walmart.com", dealScore: 82, lastChecked: "12 mins ago" },
            { storeId: "bestbuy", storeName: "Best Buy", price: 349.99, referencePrice: 399.99, url: "https://bestbuy.com", dealScore: 75, lastChecked: "15 mins ago" }
        ]
    },
    {
        id: "prod-102",
        title: "Apple MacBook Air M3 Chip 15-inch 16GB RAM 512GB SSD",
        category: "computers",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
        rating: 4.9,
        reviewCount: 1250,
        offers: [
            { storeId: "bestbuy", storeName: "Best Buy", price: 1299.00, referencePrice: 1499.00, url: "https://bestbuy.com", dealScore: 91, lastChecked: "5 mins ago" },
            { storeId: "amazon", storeName: "Amazon", price: 1349.00, referencePrice: 1499.00, url: "https://amazon.com", dealScore: 85, lastChecked: "10 mins ago" }
        ]
    },
    {
        id: "prod-103",
        title: "Samsung 65-inch Class OLED S90C Series 4K Smart TV",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80",
        rating: 4.7,
        reviewCount: 890,
        offers: [
            { storeId: "amazon", storeName: "Amazon", price: 1597.99, referencePrice: 2097.99, url: "https://amazon.com", dealScore: 89, lastChecked: "14 mins ago" },
            { storeId: "walmart", storeName: "Walmart", price: 1599.00, referencePrice: 2097.99, url: "https://walmart.com", dealScore: 88, lastChecked: "18 mins ago" }
        ]
    },
    {
        id: "prod-104",
        title: "Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker 6 Qt",
        category: "home",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80",
        rating: 4.6,
        reviewCount: 5410,
        offers: [
            { storeId: "walmart", storeName: "Walmart", price: 79.95, referencePrice: 129.95, url: "https://walmart.com", dealScore: 96, lastChecked: "2 mins ago" },
            { storeId: "ebay", storeName: "eBay", price: 84.50, referencePrice: 129.95, url: "https://ebay.com", dealScore: 90, lastChecked: "22 mins ago" }
        ]
    }
];

// App State Management
const appState = {
    selectedCategory: 'all',
    selectedStore: 'all',
    minDiscount: 0,
    searchQuery: '',
    sortBy: 'deal_score'
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initCategoryChips();
    initFilterDropdowns();
    initEventListeners();
    renderDeals();
    renderStoresGrid();
    updateMetrics();
});

// Calculate Discount Percentage
function computeDiscount(price, referencePrice) {
    if (!referencePrice || referencePrice <= price) return 0;
    return Math.round(((referencePrice - price) / referencePrice) * 100);
}

// Render Top Category Slider Chips
function initCategoryChips() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    let html = `<button type="button" class="category-chip active" data-id="all">All Deals</button>`;
    DEMO_CATEGORIES.forEach(cat => {
        html += `<button type="button" class="category-chip" data-id="${cat.id}">${cat.name}</button>`;
    });
    container.innerHTML = html;

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-chip')) {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            appState.selectedCategory = e.target.dataset.id;
            document.getElementById('categoryFilter').value = appState.selectedCategory;
            renderDeals();
        }
    });
}

// Populate Dropdown Options
function initFilterDropdowns() {
    const catSelect = document.getElementById('categoryFilter');
    const storeSelect = document.getElementById('storeFilter');

    DEMO_CATEGORIES.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    DEMO_STORES.forEach(store => {
        storeSelect.innerHTML += `<option value="${store.id}">${store.name}</option>`;
    });
}

// Event Listeners Binding
function initEventListeners() {
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        appState.selectedCategory = e.target.value;
        // Sync chip
        document.querySelectorAll('.category-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.id === appState.selectedCategory);
        });
        renderDeals();
    });

    document.getElementById('storeFilter').addEventListener('change', (e) => {
        appState.selectedStore = e.target.value;
        renderDeals();
    });

    document.getElementById('minDiscountFilter').addEventListener('change', (e) => {
        appState.minDiscount = parseInt(e.target.value, 10);
        renderDeals();
    });

    document.getElementById('sortOrder').addEventListener('change', (e) => {
        appState.sortBy = e.target.value;
        renderDeals();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        appState.searchQuery = e.target.value.toLowerCase().trim();
        renderDeals();
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('compareModal').classList.remove('active');
    });
}

// Render Main Deals Grid
function renderDeals() {
    const grid = document.getElementById('dealsGrid');
    if (!grid) return;

    let processed = [];

    // Extract best single offer per product according to current filters
    DEMO_PRODUCTS.forEach(prod => {
        if (appState.selectedCategory !== 'all' && prod.category !== appState.selectedCategory) return;
        
        if (appState.searchQuery && !prod.title.toLowerCase().includes(appState.searchQuery)) return;

        // Filter valid store offers
        let validOffers = prod.offers.filter(off => {
            if (appState.selectedStore !== 'all' && off.storeId !== appState.selectedStore) return false;
            const disc = computeDiscount(off.price, off.referencePrice);
            if (disc < appState.minDiscount) return false;
            return true;
        });

        if (validOffers.length > 0) {
            // Sort to find best offer for card main display
            validOffers.sort((a, b) => b.dealScore - a.dealScore);
            const primaryOffer = validOffers[0];
            
            processed.push({
                product: prod,
                primaryOffer: primaryOffer,
                allOffersCount: prod.offers.length,
                discountPercent: computeDiscount(primaryOffer.price, primaryOffer.referencePrice)
            });
        }
    });

    // Sort final list
    processed.sort((a, b) => {
        if (appState.sortBy === 'deal_score') return b.primaryOffer.dealScore - a.primaryOffer.dealScore;
        if (appState.sortBy === 'discount_desc') return b.discountPercent - a.discountPercent;
        if (appState.sortBy === 'price_asc') return a.primaryOffer.price - b.primaryOffer.price;
        if (appState.sortBy === 'rating_desc') return b.product.rating - a.product.rating;
        return 0;
    });

    if (processed.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No verified deals match your filter criteria. Try resetting filters.</div>`;
        return;
    }

    grid.innerHTML = processed.map(item => {
        const { product, primaryOffer, allOffersCount, discountPercent } = item;
        return `
            <article class="deal-card">
                <div class="card-image-wrap">
                    <span class="badge-discount">${discountPercent}% OFF</span>
                    <span class="badge-deal-score">Score: ${primaryOffer.dealScore}</span>
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="card-body">
                    <div class="card-store">${primaryOffer.storeName}</div>
                    <h3 class="card-title">${product.title}</h3>
                    <div class="card-rating">★ ${product.rating} <span>(${product.reviewCount})</span></div>
                    <div class="card-price-row">
                        <span class="current-price">$${primaryOffer.price.toFixed(2)}</span>
                        ${primaryOffer.referencePrice ? `<span class="reference-price">$${primaryOffer.referencePrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="timestamp-tracker">Checked: ${primaryOffer.lastChecked}</div>
                    <div class="card-actions">
                        <a href="${primaryOffer.url}" target="_blank" rel="noopener sponsored" class="btn btn-primary">Buy Deal</a>
                        <button type="button" class="btn btn-outline" onclick="openCompareModal('${product.id}')">Compare (${allOffersCount})</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Render Supported Stores List
function renderStoresGrid() {
    const grid = document.getElementById('storesGrid');
    if (!grid) return;
    grid.innerHTML = DEMO_STORES.map(s => `<div class="store-card-item">${s.name}</div>`).join('');
}

// Open Multi-Store Comparison Modal
window.openCompareModal = function(productId) {
    const prod = DEMO_PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('compareModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    title.textContent = prod.title;

    let offersHtml = prod.offers.map(off => {
        const disc = computeDiscount(off.price, off.referencePrice);
        return `
            <tr>
                <td><strong>${off.storeName}</strong></td>
                <td><strong style="color:var(--text-primary);">$${off.price.toFixed(2)}</strong></td>
                <td><span style="color:var(--accent-red); font-weight:bold;">${disc}% OFF</span></td>
                <td>★ ${prod.rating}</td>
                <td>
                    <a href="${off.url}" target="_blank" rel="noopener sponsored" class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Get Deal</a>
                </td>
            </tr>
        `;
    }).join('');

    body.innerHTML = `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Store</th>
                    <th>Price</th>
                    <th>Savings</th>
                    <th>Rating</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${offersHtml}
            </tbody>
        </table>
    `;

    modal.classList.add('active');
};

// Dynamically update aggregate UI numbers
function updateMetrics() {
    const dealCountElem = document.getElementById('totalDealsCount');
    if (dealCountElem) {
        dealCountElem.textContent = DEMO_PRODUCTS.length;
    }
}
