(function () {
  const API_BASE = "https://deal-api.hamraahirn32.workers.dev";
  const $ = (id) => document.getElementById(id);

  let allDeals = [];
  let watchlist = JSON.parse(localStorage.getItem("cd_watchlist_v10") || "[]");

  const esc = (value) => String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c])
  );

  const money = (value, currency = "USD") => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2
      }).format(number);
    } catch {
      return `${currency || "USD"} ${number.toFixed(2)}`;
    }
  };

  const saveWatchlist = () => {
    localStorage.setItem("cd_watchlist_v10", JSON.stringify(watchlist));
  };

  async function get(path) {
    const response = await fetch(API_BASE + path, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid API response");
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  function dealCard(deal) {
    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);
    const saving = Math.max(0, oldPrice - newPrice);
    const discount = Number(deal.discount_percent || 0);
    const imageUrl = deal.image_url ? esc(deal.image_url) : "";

    return `
      <article class="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-surface-container/60 mb-3" style="display:flex;gap:12px;align-items:flex-start;">
        ${imageUrl ? `
          <div class="w-24 h-24 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center">
            <img src="${imageUrl}" alt="${esc(deal.title)}" class="w-full h-full object-contain" loading="lazy">
          </div>
        ` : ""}
        <div class="flex flex-col flex-grow min-w-0 justify-between">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold text-outline uppercase">${esc(deal.store)}</span>
            <span class="px-1.5 py-0.5 rounded bg-savings-green-subtle text-savings-green font-bold text-[11px]">${discount.toFixed(0)}% OFF</span>
          </div>
          <h4 class="font-headline-sm text-[14px] font-semibold text-on-surface line-clamp-2 leading-snug mt-0.5">${esc(deal.title)}</h4>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="font-bold text-[18px] text-on-surface">${money(newPrice, deal.currency)}</span>
            ${oldPrice > 0 ? `<span class="text-[12px] text-outline line-through">${money(oldPrice, deal.currency)}</span>` : ""}
          </div>
          <div class="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-surface-container-low">
            <div class="flex items-center gap-1 text-[11px] text-outline">
              <span class="material-symbols-outlined text-[14px] text-savings-green">verified</span> ${esc(deal.last_verified_at || "Just now")}
            </div>
            <div class="flex items-center gap-1.5">
              <button class="watch-deal p-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors" data-title="${esc(deal.title)}" data-price="${newPrice}" type="button" title="Watch">
                <span class="material-symbols-outlined text-[18px] text-warning-amber">notifications</span>
              </button>
              <a href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer sponsored" class="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm text-decoration-none">
                <span>Get Deal</span><span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderDeals() {
    const box = $("discountsContainer") || document.querySelector("#market-deals .flex.flex-col.gap-3");
    
    const verifiedDeals = allDeals.filter(
      (deal) => String(deal.verification_status || "VERIFIED").toUpperCase() === "VERIFIED"
    );

    const featured = verifiedDeals.find(
      (deal) => Number(deal.is_featured) === 1
    ) || verifiedDeals[0];

    if (featured) {
      const oldP = Number(featured.old_price);
      const newP = Number(featured.new_price);
      const saveAmount = Math.max(0, oldP - newP);
      const disc = Number(featured.discount_percent || 0);

      const previewContainer = document.querySelector("#market-deals .bg-surface-container-lowest.rounded-2xl.p-4");
      if (previewContainer && previewContainer.querySelector("img")) {
        previewContainer.querySelector("img").src = featured.image_url || "";
        previewContainer.querySelector("img").alt = featured.title;
        previewContainer.querySelector("h3").textContent = featured.title;
        previewContainer.querySelector(".font-headline-sm.text-\\[20px\\]").textContent = money(newP, featured.currency);
        previewContainer.querySelector("del").textContent = oldP > 0 ? money(oldP, featured.currency) : "";
        previewContainer.querySelector(".bg-savings-green-subtle").innerHTML = `<span class="material-symbols-outlined text-[14px]">savings</span> Save ${money(saveAmount, featured.currency)}`;
        previewContainer.querySelector("a").href = featured.url;
      }
    }

    if (!box) return;

    let html = "";
    if (verifiedDeals.length) {
      html += verifiedDeals.map(dealCard).join("");
    } else {
      html = `<div class="p-4 text-center text-outline">No verified deals are available right now.</div>`;
    }

    box.innerHTML = html;

    box.querySelectorAll(".watch-deal").forEach((button) => {
      button.addEventListener("click", () => {
        addWatch(button.dataset.title, Number(button.dataset.price));
      });
    });
  }

  async function loadDeals() {
    try {
      const data = await get("/api/deals");
      allDeals = Array.isArray(data.deals) ? data.deals : [];
      renderDeals();
      updateWatchlist();
    } catch (error) {
      console.error("CheckerDiscount deal loading error:", error);
    }
  }

  window.calculateSavings = function() {
    const retailer = $("checkerStore")?.value.trim() || "Store";
    const purchasePrice = Number($("checkerPaid")?.value) || 0;
    const currentPrice = Number($("checkerCurrent")?.value) || 0;
    const savingsDelta = $("savingsDelta");
    const savingsAdvice = $("savingsAdvice");

    if (!savingsDelta) return;

    const savings = Math.max(0, purchasePrice - currentPrice);
    const percent = purchasePrice > 0 ? (savings / purchasePrice) * 100 : 0;

    savingsDelta.textContent = money(savings);
    if (savingsAdvice) {
      savingsAdvice.textContent = `Sample: ${money(purchasePrice)} vs ${money(currentPrice)} yields ${percent.toFixed(1)}% price drop. Eligible for store price adjustments.`;
    }
  };

  window.runFinalPriceCalc = function() {
    const price = Number($("calcPrice")?.value) || 0;
    const coupon = Number($("calcCoupon")?.value) || 0;
    const shipping = Number($("calcShipping")?.value) || 0;
    const tax = Number($("calcTax")?.value) || 0;
    const display = document.querySelector("#finalPriceDisplay span:last-child");

    if (!display) return;
    const total = Math.max(0, price - coupon) + shipping + tax;
    display.textContent = money(total);
  };

  function addWatch(title, target) {
    if (!title || !Number.isFinite(target) || target <= 0) return;

    if (!watchlist.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
      watchlist.push({ title, target, createdAt: new Date().toISOString() });
    }

    saveWatchlist();
    updateWatchlist();
    alert("Added to your watchlist!");
  }

  window.addToWatchlist = function() {
    const title = $("watchProductName")?.value.trim();
    const target = Number($("watchAlertPrice")?.value);
    if (title && target > 0) {
      addWatch(title, target);
      $("watchProductName").value = "";
      $("watchAlertPrice").value = "";
    }
  };

  function updateWatchlist() {
    const statusBox = $("watchStatusText");
    if (!statusBox) return;

    if (!watchlist.length) {
      statusBox.textContent = "Watchlist empty. Add item above to track.";
      return;
    }

    statusBox.parentElement.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-savings-green">check_circle</span>
      <span id="watchStatusText">Tracking ${watchlist.length} item(s): ${watchlist.map(i => i.title).join(", ")}</span>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadDeals();
  });

  window.refreshCheckerDiscountDeals = loadDeals;
})();
