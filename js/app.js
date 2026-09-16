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
      headers: {
        Accept: "application/json"
      },
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

    return `
      <article class="discount-card">
        <div class="deal-content" style="width:100%">

          <div class="deal-top-line">
            <span>${esc(deal.store)}</span>
            <span>${discount.toFixed(0)}% OFF</span>
          </div>

          <h3 class="deal-title">
            ${esc(deal.title)}
          </h3>

          <div class="deal-price-row">
            <strong>${money(newPrice, deal.currency)}</strong>
            ${oldPrice > 0 ? `<del>${money(oldPrice, deal.currency)}</del>` : ""}
          </div>

          <div class="deal-save">
            SAVE ${money(saving, deal.currency)} · ${discount.toFixed(2)}% OFF
          </div>

          <div
            class="floating-saving"
            style="position:static;display:inline-block;margin-top:12px"
          >
            <small>Potential Savings</small>
            <strong>${money(saving, deal.currency)}</strong>
          </div>

          <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px">

            <a
              class="preview-button"
              href="${esc(deal.url)}"
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Check This Deal →
            </a>

            <button
              class="share-deal"
              data-id="${deal.id}"
              type="button"
            >
              Share
            </button>

            <button
              class="watch-deal"
              data-title="${esc(deal.title)}"
              data-price="${newPrice}"
              type="button"
            >
              ♡ Watch
            </button>

          </div>

          <p style="font-size:11px;color:#667085;margin-top:10px">
            ✓ Verified ${esc(deal.last_verified_at || "")}
          </p>

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
        <div
          class="featured-v10"
          style="border:2px solid #12B76A;background:#F7FFF9;border-radius:16px;padding:18px;margin-bottom:18px"
        >
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

      // IMPORTANT: the Worker returns { deals: [...] }.
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
    const deal = allDeals.find(
      (item) => Number(item.id) === id
    );

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
        alert("Deal link copied.");
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
      out.innerHTML = `
        <div class="tool-empty">
          No matching verified offers found yet. Try a shorter product name.
        </div>
      `;
      return;
    }

    matches.sort((a, b) => Number(a.new_price) - Number(b.new_price));

    const best = Number(matches[0].new_price);

    out.innerHTML = `
      <table class="compare-table">
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
              ${
                Number(deal.new_price) === best
                  ? `<span class="compare-best">BEST</span>`
                  : ""
              }
            </td>

            <td>${money(deal.new_price, deal.currency)}</td>

            <td>${Number(deal.discount_percent || 0).toFixed(0)}%</td>

            <td>
              <a
                href="${esc(deal.url)}"
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                Check →
              </a>
            </td>
          </tr>
        `).join("")}
      </table>

      <div class="tool-note">
        ${matches.length} verified offer(s) matched your search.
      </div>
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
      out.innerHTML = `
        <div class="tool-empty">
          No verified product matched that search.
        </div>
      `;
      return;
    }

    try {
      const data = await get(`/api/deals/${deal.id}/history`);
      const history = data.history || [];

      if (!history.length) {
        out.innerHTML = `
          <div class="tool-empty">
            No recorded history yet. Re-verify this deal from Admin Panel to create the first snapshot.
          </div>
        `;
        return;
      }

      out.innerHTML = `
        <div class="history-list">
          ${history.slice(-12).reverse().map((item) => `
            <div class="history-row">
              <span>${esc(item.checked_at)}</span>
              <strong>${money(item.price, deal.currency)}</strong>
            </div>
          `).join("")}
        </div>

        <div class="tool-note">
          Latest recorded price:
          ${money(history[history.length - 1].price, deal.currency)}.
        </div>
      `;

    } catch (error) {
      console.error(error);
      out.innerHTML = `
        <div class="tool-empty">
          Price history is temporarily unavailable.
        </div>
      `;
    }
  }

  async function coupons() {
    const store = $("couponStore")?.value.trim() || "";
    const query = $("couponQuery")?.value.trim() || "";
    const out = $("couponResult");

    if (!out) return;

    if (!store && !query) {
      out.innerHTML = `
        <div class="tool-empty">
          Enter a store or keyword.
        </div>
      `;
      return;
    }

    try {
      const params = new URLSearchParams();

      if (store) params.set("store", store);
      if (query) params.set("q", query);

      const data = await get(`/api/coupons?${params.toString()}`);
      const couponList = data.coupons || [];

      if (!couponList.length) {
        out.innerHTML = `
          <div class="tool-empty">
            No verified coupons found for this search.
          </div>
        `;
        return;
      }

      out.innerHTML = couponList.map((coupon) => `
        <div class="coupon-card">
          <strong>${esc(coupon.title)}</strong>

          <div style="margin:7px 0">
            ${coupon.code
              ? `<span class="coupon-code">${esc(coupon.code)}</span>`
              : ""
            }
            ${esc(coupon.discount_text || "")}
          </div>

          <div style="font-size:12px;color:#667085">
            ${esc(coupon.description || "")}
          </div>

          ${coupon.url
            ? `<a href="${esc(coupon.url)}" target="_blank" rel="noopener noreferrer sponsored">View offer →</a>`
            : ""
          }
        </div>
      `).join("");

    } catch (error) {
      console.error(error);
      out.innerHTML = `
        <div class="tool-empty">
          Coupon checker is temporarily unavailable.
        </div>
      `;
    }
  }

  function finalPrice() {
    const price = Number($("fpPrice")?.value) || 0;
    const coupon = Number($("fpCoupon")?.value) || 0;
    const shipping = Number($("fpShipping")?.value) || 0;
    const tax = Number($("fpTax")?.value) || 0;
    const out = $("finalPriceResult");

    if (!out) return;

    const total = Math.max(0, price - coupon) + shipping + tax;

    out.innerHTML = `
      <div
        style="background:var(--green-soft);border:1px solid #b7ebce;border-radius:12px;padding:16px"
      >
        <small style="color:var(--green-dark)">
          ESTIMATED FINAL COST
        </small>

        <div style="font-size:30px;font-weight:800;color:var(--green-dark)">
          ${money(total)}
        </div>

        <div style="font-size:12px;color:#667085">
          ${money(price)} price − ${money(coupon)} coupon +
          ${money(shipping)} shipping + ${money(tax)} tax
        </div>
      </div>
    `;
  }

  function calculateRefundSavings() {
    const retailer = $("retailer")?.value.trim() || "Store";
    const purchasePrice = Number($("purchasePrice")?.value) || 0;
    const currentPrice = Number($("currentPrice")?.value) || 0;
    const out = $("refundResult");

    if (!out) return;

    const savings = Math.max(0, purchasePrice - currentPrice);

    if (purchasePrice <= 0 || currentPrice < 0) {
      out.style.display = "block";
      out.innerHTML = `
        <div class="tool-empty">
          Please enter valid prices.
        </div>
      `;
      return;
    }

    const percent = purchasePrice > 0
      ? (savings / purchasePrice) * 100
      : 0;

    out.style.display = "block";

    out.innerHTML = `
      <div
        style="margin-top:16px;background:#F7FFF9;border:1px solid #B7E8CD;border-radius:12px;padding:16px"
      >
        <div style="font-size:12px;color:#667085">
          ${esc(retailer)} POTENTIAL SAVINGS
        </div>

        <div style="font-size:30px;font-weight:800;color:#087443">
          ${money(savings)}
        </div>

        <div style="font-size:12px;color:#667085;margin-top:5px">
          You paid ${money(purchasePrice)} and the current price is
          ${money(currentPrice)} — ${percent.toFixed(1)}% lower.
        </div>
      </div>
    `;
  }

  function addWatch(title, target) {
    if (!title || !Number.isFinite(target) || target <= 0) return;

    if (!watchlist.some(
      (item) => item.title.toLowerCase() === title.toLowerCase()
    )) {
      watchlist.push({
        title,
        target,
        createdAt: new Date().toISOString()
      });
    }

    saveWatchlist();
    updateWatchlist();
  }

  function updateWatchlist() {
    const out = $("watchResult");
    if (!out) return;

    if (!watchlist.length) {
      out.innerHTML = `
        <div class="tool-empty">
          Your watchlist is empty.
        </div>
      `;
      return;
    }

    out.innerHTML = `
      <div class="watch-list">
        ${watchlist.map((item, index) => {
          const deal = allDeals.find((candidate) => {
            const a = (candidate.title || "").toLowerCase();
            const b = item.title.toLowerCase();
            return a.includes(b) || b.includes(a);
          });

          const price = deal ? Number(deal.new_price) : null;
          const hit = price !== null && price <= Number(item.target);

          return `
            <div class="watch-item">

              <div>
                <strong>${esc(item.title)}</strong>

                <div style="font-size:12px;color:#667085">
                  Target: ${money(item.target)}

                  ${
                    price !== null
                      ? ` · Current: ${money(price, deal.currency)} ${hit ? "· 🔔 Target reached" : ""}`
                      : " · Waiting for a matching verified deal"
                  }
                </div>
              </div>

              <button
                type="button"
                data-remove-watch="${index}"
              >
                Remove
              </button>

            </div>
          `;
        }).join("")}
      </div>
    `;

    out.querySelectorAll("[data-remove-watch]").forEach((button) => {
      button.addEventListener("click", () => {
        watchlist.splice(
          Number(button.dataset.removeWatch),
          1
        );

        saveWatchlist();
        updateWatchlist();
      });
    });
  }

  function setup() {
    $("compareForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      compare($("compareQuery").value.trim());
    });

    $("historyForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      priceHistory($("historyQuery").value.trim());
    });

    $("couponForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      coupons();
    });

    $("finalPriceForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      finalPrice();
    });

    $("refundForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateRefundSavings();
    });

    $("watchForm")?.addEventListener("submit", (event) => {
      event.preventDefault();

      addWatch(
        $("watchProduct").value.trim(),
        Number($("watchTarget").value)
      );

      event.target.reset();
    });

    document.querySelectorAll("[data-tool-tab]").forEach((button) => {
      button.addEventListener("click", () => {

        document.querySelectorAll("[data-tool-tab]").forEach((item) => {
          item.classList.remove("active");
        });

        button.classList.add("active");

        const name = button.dataset.toolTab;

        document.querySelectorAll("[data-tool-panel]").forEach((panel) => {
          panel.style.display =
            panel.dataset.toolPanel === name
              ? "block"
              : "none";
        });
      });
    });

    document.querySelectorAll("[data-tool-panel]").forEach((panel, index) => {
      panel.style.display = index === 0 ? "block" : "none";
    });

    updateWatchlist();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setup();
    loadDeals();
  });

  window.refreshCheckerDiscountDeals = loadDeals;

})();
