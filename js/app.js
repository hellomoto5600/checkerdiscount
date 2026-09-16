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
      <article class="discount-card" style="display:flex;gap:16px;align-items:flex-start;background:#ffffff;border:1px solid #eaecf0;border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 2px 6px rgba(16,24,40,0.04);">
        
        ${imageUrl ? `
          <div style="flex-shrink:0;width:110px;height:110px;background:#f8f9fa;border-radius:10px;overflow:hidden;border:1px solid #eeF2f6;display:flex;align-items:center;justify-content:center;">
            <img src="${imageUrl}" alt="${esc(deal.title)}" style="max-width:100%;max-height:100%;object-fit:contain;" loading="lazy">
          </div>
        ` : ""}

        <div class="deal-content" style="flex-grow:1;width:100%;">

          <div class="deal-top-line" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:#475467;text-transform:uppercase;">${esc(deal.store)}</span>
            <span style="background:#ecfdf3;color:#027a48;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">${discount.toFixed(0)}% OFF</span>
          </div>

          <h3 class="deal-title" style="font-size:15px;font-weight:600;color:#1d2939;line-height:1.4;margin:0 0 8px 0;">
            ${esc(deal.title)}
          </h3>

          <div class="deal-price-row" style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;">
            <strong style="font-size:18px;font-weight:700;color:#101828;">${money(newPrice, deal.currency)}</strong>
            ${oldPrice > 0 ? `<del style="font-size:13px;color:#98a2b3;">${money(oldPrice, deal.currency)}</del>` : ""}
          </div>

          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px;">
            <a
              href="${esc(deal.url)}"
              target="_blank"
              rel="noopener noreferrer sponsored"
              style="background:#026aa2;color:#ffffff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;"
            >
              Get Deal →
            </a>

            <button
              class="share-deal"
              data-id="${deal.id}"
              type="button"
              style="background:#f8f9fa;color:#344054;border:1px solid #d0d5dd;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;"
            >
              📤 Share
            </button>

            <button
              class="watch-deal"
              data-title="${esc(deal.title)}"
              data-price="${newPrice}"
              type="button"
              style="background:#f8f9fa;color:#344054;border:1px solid #d0d5dd;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;"
            >
              🔔 Watch
            </button>
          </div>

          <div style="font-size:11px;color:#98a2b3;margin-top:10px;">
            ✓ Verified ${esc(deal.last_verified_at || "")}
          </div>

        </div>
      </article>
    `;
  }

  function renderDeals() {
    const box = $("discountsContainer");
    if (!box) return;

    const verifiedDeals = allDeals.filter(
      (deal) => String(deal.verification_status || "VERIFIED").toUpperCase() === "VERIFIED"
    );

    const featured = verifiedDeals.find(
      (deal) => Number(deal.is_featured) === 1
    );

    const regular = verifiedDeals.filter(
      (deal) => Number(deal.is_featured) !== 1
    );

    let html = "";

    if (featured) {
      html += `
        <div class="featured-v10" style="border:2px solid #12B76A;background:#F7FFF9;border-radius:16px;padding:18px;margin-bottom:18px">
          <div style="font-size:11px;font-weight:800;color:#087443;letter-spacing:.5px;margin-bottom:10px">
            ⭐ FEATURED VERIFIED DEAL
          </div>
          ${dealCard(featured)}
        </div>
      `;
    }

    if (regular.length) {
      html += regular.map(dealCard).join("");
    }

    if (!html) {
      html = `
        <div class="tool-empty">
          No verified deals are available right now.
        </div>
      `;
    }

    box.innerHTML = html;

    box.querySelectorAll(".share-deal").forEach((button) => {
      button.addEventListener("click", () => {
        shareDeal(Number(button.dataset.id));
      });
    });

    box.querySelectorAll(".watch-deal").forEach((button) => {
      button.addEventListener("click", () => {
        addWatch(
          button.dataset.title,
          Number(button.dataset.price)
        );
      });
    });
  }

  async function loadDeals() {
    const box = $("discountsContainer");

    try {
      const data = await get("/api/deals");
      allDeals = Array.isArray(data.deals) ? data.deals : [];

      renderDeals();
      updateWatchlist();

    } catch (error) {
      console.error("CheckerDiscount deal loading error:", error);
      if (box) {
        box.innerHTML = `
          <div class="tool-empty">
            Deals could not be loaded right now. Please try again.
          </div>
        `;
      }
    }
  }

  async function shareDeal(id) {
    const deal = allDeals.find((item) => Number(item.id) === id);
    if (!deal) return;

    const shareData = {
      title: deal.title,
      text: `${deal.title} — ${money(deal.new_price, deal.currency)} at ${deal.store}`,
      url: deal.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(deal.url);
        alert("Deal link copied to clipboard.");
      } else {
        window.prompt("Copy this deal link:", deal.url);
      }
    } catch {
      // User cancelled share.
    }
  }

  function compare(query) {
    const out = $("compareResult");
    if (!out) return;

    const q = String(query || "").trim().toLowerCase();
    if (!q) {
      out.innerHTML = `<div class="tool-empty">Enter a product name first.</div>`;
      return;
    }

    const matches = allDeals.filter((deal) => {
      const title = String(deal.title || "").toLowerCase();
      const store = String(deal.store || "").toLowerCase();
      const asin = String(deal.asin || "").toLowerCase();
      return title.includes(q) || store.includes(q) || asin === q;
    });

    if (!matches.length) {
      out.innerHTML = `<div class="tool-empty">No matching verified offers found yet.</div>`;
      return;
    }

    matches.sort((a, b) => Number(a.new_price) - Number(b.new_price));
    const best = Number(matches[0].new_price);

    out.innerHTML = `
      <table class="compare-table" style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr>
          <th>Store</th>
          <th>Current</th>
          <th>Discount</th>
          <th></th>
        </tr>
        ${matches.map((deal) => `
          <tr>
            <td>
              ${esc(deal.store)}
              ${Number(deal.new_price) === best ? `<span class="compare-best" style="background:#ecfdf3;color:#027a48;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:4px;">BEST</span>` : ""}
            </td>
            <td>${money(deal.new_price, deal.currency)}</td>
            <td>${Number(deal.discount_percent || 0).toFixed(0)}%</td>
            <td>
              <a href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer sponsored" style="color:#026aa2;font-weight:600;">Check →</a>
            </td>
          </tr>
        `).join("")}
      </table>
    `;
  }

  async function priceHistory(query) {
    const out = $("historyResult");
    if (!out) return;

    const q = String(query || "").trim().toLowerCase();
    const deal = allDeals.find((item) => {
      const title = String(item.title || "").toLowerCase();
      const asin = String(item.asin || "").toLowerCase();
      return title.includes(q) || asin === q;
    });

    if (!deal) {
      out.innerHTML = `<div class="tool-empty">No verified product matched that search.</div>`;
      return;
    }

    try {
      const data = await get(`/api/deals/${deal.id}/history`);
      const history = data.history || [];

      if (!history.length) {
        out.innerHTML = `<div class="tool-empty">No recorded history yet. Re-verify from Admin Panel.</div>`;
        return;
      }

      out.innerHTML = `
        <div class="history-list">
          ${history.slice(-12).reverse().map((item) => `
            <div class="history-row" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eaecf0;">
              <span>${esc(item.checked_at)}</span>
              <strong>${money(item.price, deal.currency)}</strong>
            </div>
          `).join("")}
        </div>
      `;
    } catch {
      out.innerHTML = `<div class="tool-empty">Price history is temporarily unavailable.</div>`;
    }
  }

  async function coupons() {
    const store = $("couponStore")?.value.trim() || "";
    const query = $("couponQuery")?.value.trim() || "";
    const out = $("couponResult");
    if (!out) return;

    try {
      const params = new URLSearchParams();
      if (store) params.set("store", store);
      if (query) params.set("q", query);

      const data = await get(`/api/coupons?${params.toString()}`);
      const couponList = data.coupons || [];

      if (!couponList.length) {
        out.innerHTML = `<div class="tool-empty">No verified coupons found.</div>`;
        return;
      }

      out.innerHTML = couponList.map((coupon) => `
        <div class="coupon-card" style="background:#fff;border:1px solid #eaecf0;padding:12px;border-radius:8px;margin-bottom:8px;">
          <strong>${esc(coupon.title)}</strong>
          <div style="margin:5px 0">
            ${coupon.code ? `<span class="coupon-code" style="background:#f0f4ff;color:#3538cd;padding:2px 6px;border-radius:4px;font-family:monospace;">${esc(coupon.code)}</span>` : ""}
          </div>
        </div>
      `).join("");
    } catch {
      out.innerHTML = `<div class="tool-empty">Coupons unavailable.</div>`;
    }
  }

  function addWatch(title, target) {
    if (!title || !Number.isFinite(target) || target <= 0) return;

    if (!watchlist.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
      watchlist.push({
        title,
        target,
        createdAt: new Date().toISOString()
      });
    }

    saveWatchlist();
    updateWatchlist();
    alert("Added to your watchlist!");
  }

  function updateWatchlist() {
    const out = $("watchResult");
    if (!out) return;

    if (!watchlist.length) {
      out.innerHTML = `<div class="tool-empty">Your watchlist is empty.</div>`;
      return;
    }

    out.innerHTML = `
      <div class="watch-list" style="display:flex;flex-direction:column;gap:8px;">
        ${watchlist.map((item, index) => `
          <div class="watch-item" style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #eaecf0;padding:10px;border-radius:8px;">
            <div>
              <strong>${esc(item.title)}</strong>
              <div style="font-size:12px;color:#667085">Target: ${money(item.target)}</div>
            </div>
            <button type="button" data-remove-watch="${index}" style="background:#fee4e2;color:#d92d20;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-weight:600;">Remove</button>
          </div>
        `).join("")}
      </div>
    `;

    out.querySelectorAll("[data-remove-watch]").forEach((button) => {
      button.addEventListener("click", () => {
        watchlist.splice(Number(button.dataset.removeWatch), 1);
        saveWatchlist();
        updateWatchlist();
      });
    });
  }

  function setup() {
    $("compareForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      compare($("compareQuery").value.trim());
    });

    $("historyForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      priceHistory($("historyQuery").value.trim());
    });

    $("couponForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      coupons();
    });

    $("watchForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      addWatch($("watchProduct").value.trim(), Number($("watchTarget").value));
      e.target.reset();
    });

    updateWatchlist();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setup();
    loadDeals();
  });

  window.refreshCheckerDiscountDeals = loadDeals;
})();
