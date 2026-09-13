/* ==========================================================================
   CheckerDiscount.com - Multi-Category Deal Engine Engine (2026)
   Supports: Retail, Flights, Digital Software & Promo Coupons
   ========================================================================== */

// 1. Multi-Category Deals Data Structure
const dealsData = [
  // --- Retail Products ---
  {
    id: 1,
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    category: "retail",
    merchant: "Amazon",
    currentPrice: "$328.00",
    originalPrice: "$399.99",
    discount: "18% OFF",
    badgeType: "badge-discount",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    link: "https://amazon.com",
    btnText: "Compare & Buy"
  },
  {
    id: 2,
    title: "Apple MacBook Air M3 Chip - 15-inch Retina Display",
    category: "retail",
    merchant: "Best Buy",
    currentPrice: "$1,099.00",
    originalPrice: "$1,299.00",
    discount: "15% OFF",
    badgeType: "badge-discount",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    link: "https://bestbuy.com",
    btnText: "Get Deal"
  },

  // --- Travel & Flights Deals ---
  {
    id: 3,
    title: "Round Trip Flight: New York (JFK) to London (LHR)",
    category: "flights",
    merchant: "Emirates / Travelpayouts",
    currentPrice: "$480.00",
    originalPrice: "$750.00",
    discount: "36% OFF",
    badgeType: "badge-flight",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&q=80",
    link: "https://skyscanner.com",
    btnText: "Book Flight Deal"
  },
  {
    id: 4,
    title: "Direct Flight: Dubai (DXB) to Bangkok (BKK) + 4★ Hotel",
    category: "flights",
    merchant: "Booking.com",
    currentPrice: "$620.00",
    originalPrice: "$890.00",
    discount: "30% OFF",
    badgeType: "badge-flight",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
    link: "https://booking.com",
    btnText: "View Hotel & Flight"
  },

  // --- Digital Software & Subscriptions ---
  {
    id: 5,
    title: "NordVPN 2-Year Plan + 3 Months Free",
    category: "software",
    merchant: "NordVPN Official",
    currentPrice: "$81.00",
    originalPrice: "$239.00",
    discount: "66% OFF",
    badgeType: "badge-discount",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80",
    link: "https://nordvpn.com",
    btnText: "Claim Subscription"
  },

  // --- Merchant Direct Promo Coupon (AdSense/Commission Model) ---
  {
    id: 6,
    title: "EXCLUSIVE: Extra 20% OFF Site-Wide Promo Code",
    category: "coupons",
    merchant: "Sponsored Partner",
    currentPrice: "CODE: CHECK20",
    originalPrice: "",
    discount: "SPONSORED",
    badgeType: "badge-sponsored",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80",
    link: "#",
    btnText: "Copy Code & Shop"
  }
];

// 2. DOM Elements
const dealsGrid = document.getElementById("dealsGrid");
const tabButtons = document.querySelectorAll(".tab-btn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

let currentCategory = "all";
let searchQuery = "";

// 3. Render Deals Function
function renderDeals() {
  if (!dealsGrid) return;
  
  dealsGrid.innerHTML = "";

  // Filter Data
  let filtered = dealsData.filter(deal => {
    const matchesCategory = currentCategory === "all" || deal.category === currentCategory;
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          deal.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    dealsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <h3>No deals found</h3>
        <p>Try searching for something else or change the category filter.</p>
      </div>
    `;
    return;
  }

  // Generate Cards HTML
  filtered.forEach((deal, index) => {
    const isSponsored = deal.category === "coupons" ? "native-ad-card" : "";
    
    const cardHTML = `
      <div class="deal-card ${isSponsored}">
        <span class="card-badge ${deal.badgeType}">${deal.discount}</span>
        <img src="${deal.image}" alt="${deal.title}" class="deal-image" loading="lazy">
        <div class="deal-content">
          <div class="merchant-tag">${deal.merchant}</div>
          <h3 class="deal-title">${deal.title}</h3>
          <div class="price-row">
            <span class="current-price">${deal.currentPrice}</span>
            ${deal.originalPrice ? `<span class="original-price">${deal.originalPrice}</span>` : ""}
          </div>
          <a href="${deal.link}" target="_blank" rel="noopener noreferrer" class="deal-btn">
            ${deal.btnText}
          </a>
        </div>
      </div>
    `;

    dealsGrid.innerHTML += cardHTML;
  });
}

// 4. Event Listeners
tabButtons.forEach(button => {
  button.addEventListener("click", (e) => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    currentCategory = e.target.getAttribute("data-category");
    renderDeals();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderDeals();
  });
}

// Initial Render
document.addEventListener("DOMContentLoaded", renderDeals);
