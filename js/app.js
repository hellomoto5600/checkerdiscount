// CheckerDiscount app.js - Complete Final Version with Admin Panel Image Debugging & Fixes

const sampleDeals = [
    {
        id: 1,
        category: "home",
        store: "Amazon",
        title: "Cervical Neck Pillow, Memory Foam Pillow with Dual Height, White",
        price: 33.98,
        originalPrice: 56.99,
        discount: "40% OFF",
        savings: "$23.01",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=400",
        date: "2026-09-15 13:19:39",
        url: "#",
        isFeatured: true
    },
    {
        id: 2,
        category: "kitchen",
        store: "Amazon",
        title: "Ninja Nutri-Plus Personal Blender, 900PW, (3) 20oz Cups, Silver, BN301",
        price: 69.97,
        originalPrice: 89.99,
        discount: "22% OFF",
        savings: "$20.02",
        image: "https://images.unsplash.com/photo-1570222094114-d074f7e1e4e1?auto=format&fit=crop&q=80&w=400",
        date: "2026-09-15 12:25:29",
        url: "#",
        isFeatured: false
    },
    {
        id: 3,
        category: "kitchen",
        store: "Amazon",
        title: "Hamilton Beach Power Deluxe 6-Speed Electric Hand Mixer",
        price: 24.97,
        originalPrice: 31.95,
        discount: "22% OFF",
        savings: "$6.98",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
        date: "2026-09-15 11:00:00",
        url: "#",
        isFeatured: false
    }
];

document.addEventListener("DOMContentLoaded", () => {
    loadDeals();
    loadSpotlight();
    setupFilters();
    initBurgerMenu();
});

function getStoredDeals() {
    const local = localStorage.getItem("checker_deals");
    if (local) {
        try { 
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    return sampleDeals;
}

function loadSpotlight() {
    const deals = getStoredDeals();
    let featuredDeal = deals.find(d => d.isFeatured === true || d.featured === true || d.isFeatured === "true" || d.featured === "1" || String(d.isFeatured).toLowerCase() === "yes");
    if (!featuredDeal && deals.length > 0) {
        featuredDeal = deals[0];
    }

    const spotlightContainer = document.querySelector(".relative.w-full.bg-gradient-to-b");
    if (!spotlightContainer || !featuredDeal) return;

    const imgSrc = featuredDeal.image || featuredDeal.imageUrl || featuredDeal.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

    let showcaseBox = spotlightContainer.querySelector(".w-full.mt-2.bg-surface-container-lowest");
    if (showcaseBox) {
        showcaseBox.innerHTML = `
            <div class="flex items-center justify-between gap-2 pb-3 border-b border-surface-container-low">
                <div class="flex items-center gap-1 text-primary font-badge-caps text-[11px] font-bold uppercase tracking-wider"><span class="material-symbols-outlined text-[15px]">bolt</span> Deal Spotlight</div>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold"><span class="material-symbols-outlined text-[12px]">verified</span> ${featuredDeal.discount || 'Special Offer'}</span>
            </div>
            <div class="flex gap-3 pt-3">
                <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
                    <img class="w-full h-full object-cover" src="${imgSrc}" alt="Spotlight Deal" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
                    <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.2 rounded font-mono">${featuredDeal.store || 'Amazon'}</div>
                </div>
                <div class="flex flex-col min-w-0 justify-center flex-1">
                    <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">
                        <span>${featuredDeal.store || 'Amazon'}</span>
                        <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined fill-1">star</span>
                        <span class="font-bold text-on-surface">4.8</span>
                    </div>
                    <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2 mt-0.5">${featuredDeal.title}</h3>
                    <div class="flex items-baseline gap-2 mt-1.5">
                        <span class="font-headline-sm text-[20px] font-extrabold text-primary-container">$${Number(featuredDeal.price).toFixed(2)}</span>
                        ${featuredDeal.originalPrice ? `<span class="font-price-strikethrough text-[13px] text-outline line-through">$${Number(featuredDeal.originalPrice).toFixed(2)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="mt-3 pt-2.5 border-t border-surface-container flex items-center justify-between">
                <div class="px-2.5 py-1 rounded-lg bg-savings-green-subtle text-savings-green font-bold text-[12px] flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">savings</span> Save ${featuredDeal.savings || '$0.00'}
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="shareDeal('${encodeURIComponent(featuredDeal.title)}', '${featuredDeal.url || window.location.href}')" class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm" title="Share Deal">
                        <span class="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <a href="${featuredDeal.url || '#'}" target="_blank" class="py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">
                        <span>Check Deal</span>
                        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                </div>
            </div>
        `;
    }
}

function loadDeals(filter = "all") {
    const container = document.getElementById("discountsContainer");
    if (!container) return;

    let deals = getStoredDeals();
    if (filter !== "all") {
        deals = deals.filter(d => d.category && d.category.toLowerCase() === filter.toLowerCase());
    }

    container.innerHTML = "";

    if (deals.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">No deals found in this category.</div>`;
        return;
    }

    deals.forEach(deal => {
        // یہاں ایڈمن پینل سے آنے والے امیج لنک کو کنسول میں چیک کرنے کے لیے پرنٹ کیا جا رہا ہے
        console.log("Admin Panel Image Link:", deal.image || deal.imageUrl || deal.img);

        const imgSrc = deal.image || deal.imageUrl || deal.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";
        
        const card = document.createElement("div");
        card.className = "bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container/60 flex flex-col gap-3";
        card.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <span class="font-badge-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">${deal.store || 'Amazon'}</span>
                <span class="px-2.5 py-0.5 rounded-full bg-savings-green-subtle text-secondary font-badge-caps text-[10px] font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">verified</span> ${deal.discount || 'Special Deal'}
                </span>
            </div>
            <div class="flex gap-3">
                <div class="w-20 h-20 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
                    <img src="${imgSrc}" class="w-full h-full object-cover" alt="Deal" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
                </div>
                <div class="flex flex-col min-w-0 justify-center flex-1">
                    <h3 class="font-headline-sm text-[14px] text-on-surface font-semibold leading-snug line-clamp-2">${deal.title}</h3>
                    <div class="flex items-baseline gap-2 mt-1.5">
                        <span class="font-headline-sm text-[18px] font-extrabold text-primary-container">$${Number(deal.price).toFixed(2)}</span>
                        ${deal.originalPrice ? `<span class="font-price-strikethrough text-[13px] text-outline line-through">$${Number(deal.originalPrice).toFixed(2)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-surface-container-low text-[11px] text-on-surface-variant">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-savings-green text-[14px]">check_circle</span>
                    <span>${deal.date || 'Verified'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="shareDeal('${encodeURIComponent(deal.title)}', '${deal.url || window.location.href}')" class="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-sm" title="Share Deal">
                        <span class="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <a href="${deal.url || '#'}" target="_blank" class="py-2 px-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm transition-colors">
                        <span>Get Deal</span>
                        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll("#market-deals .overflow-x-auto button");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => {
                b.className = "flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-[13px]";
            });
            btn.className = "flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-[13px] font-semibold shadow-sm";
            
            const text = btn.textContent.toLowerCase();
            let category = "all";
            if (text.includes("home")) category = "home";
            else if (text.includes("kitchen")) category = "kitchen";
            else if (text.includes("trending")) category = "trending";
            
            loadDeals(category);
        });
    });
}

function initBurgerMenu() {
    const btn = document.getElementById("burgerMenuBtn");
    if (!btn) return;

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
                    <a href="index.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">home</span> Home
                    </a>
                    <a href="#market-deals" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">local_offer</span> Top Deals
                    </a>
                    <a href="#savings-tool" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">calculate</span> Savings Checker
                    </a>
                    <a href="#tool-comparison" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">compare_arrows</span> Price Comparison
                    </a>
                    <a href="#tool-history" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">trending_down</span> Price History
                    </a>
                    <a href="#tool-watchlist" onclick="closeMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-on-surface font-label-md text-[14px] transition-colors">
                        <span class="material-symbols-outlined text-[20px] text-primary">bookmark</span> Watchlist
                    </a>
                </div>
            </div>
            <div class="pt-4 border-t border-surface-container text-center text-[12px] text-on-surface-variant">
                CheckerDiscount v2.5
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
    closeBtn.addEventListener("click", closeMenu);
    menuOverlay.addEventListener("click", (e) => {
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
        navigator.share({
            title: decodedTitle,
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url);
        alert("Deal link copied to clipboard!");
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
    
    if (deltaEl) deltaEl.textContent = `$${Math.max(0, delta).toFixed(2)}`;
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
        display.innerHTML = `<span class="text-on-surface-variant">Total Out-of-Pocket:</span><span class="font-bold text-on-surface text-[16px]">$${total.toFixed(2)}</span>`;
    }
}

function addToWatchlist() {
    const name = document.getElementById("watchProductName")?.value;
    const price = document.getElementById("watchAlertPrice")?.value;
    const status = document.getElementById("watchStatusText");
    if (name && status) {
        status.textContent = `Tracking "${name}" for drops below $${price || '0.00'}`;
        alert("Added to price drop watchlist successfully!");
    }
}
