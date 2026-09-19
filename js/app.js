/* =========================================================
   SPOTLIGHT (Fixed)
========================================================= */

function loadSpotlight() {
    const deals = globalDeals;
    if (!deals.length) return;

    let featuredDeal = deals.find(d => Number(d.is_featured) === 1 || d.isFeatured === true) || deals[0];
    const spotlightContainer = document.querySelector(".relative.w-full.bg-gradient-to-b");
    if (!spotlightContainer || !featuredDeal) return;

    const imgSrc = featuredDeal.image_url || featuredDeal.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";
    const discountText = featuredDeal.discount_percent ? `${Math.round(featuredDeal.discount_percent)}% OFF` : "Special Offer";
    const oldPrice = Number(featuredDeal.old_price || 0);
    const newPrice = Number(featuredDeal.new_price || featuredDeal.price || 0);
    const savingsAmount = oldPrice > newPrice ? oldPrice - newPrice : 0;
    const currency = getDealCurrency(featuredDeal);
    const dealRating = featuredDeal.rating || "4.8";

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
                <img class="w-full h-full object-cover" src="${escapeAttribute(imgSrc)}" alt="Spotlight Deal" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'">
                <div class="absolute bottom-1 right-1 bg-navy-deep/80 text-on-primary text-[9px] px-1 py-0.5 rounded font-mono">
                    ${escapeHtml(featuredDeal.store || "Store")}
                </div>
            </div>
            <div class="flex flex-col min-w-0 justify-center flex-1">
                <div class="flex items-center gap-1 text-caption-timestamp text-[11px] text-on-surface-variant">
                    <span>${getDealFlag(featuredDeal)}</span>
                    <span>${escapeHtml(getDealCountryName(featuredDeal))}</span>
                    <span class="text-on-surface-variant">·</span>
                    <span class="font-semibold text-on-surface truncate">${escapeHtml(featuredDeal.store || "Store")}</span>
                    <span class="inline-flex text-warning-amber text-[12px] material-symbols-outlined fill-1">star</span>
                    <span class="font-bold text-on-surface">${escapeHtml(String(dealRating))}</span>
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
                Save ${formatPrice(savingsAmount, currency)}
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
