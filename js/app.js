(function () {
  "use strict";

  const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

  const $ = (id) => document.getElementById(id);

  let allDeals = [];

  let watchlist = [];
  try {
    watchlist = JSON.parse(
      localStorage.getItem("cd_watchlist_v10") || "[]"
    );

    if (!Array.isArray(watchlist)) {
      watchlist = [];
    }
  } catch {
    watchlist = [];
  }

  /* =========================================================
     BASIC HELPERS
  ========================================================= */

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[c])
    );

  const money = (value, currency = "USD") => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    const curr = String(currency || "USD").toUpperCase();

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: curr,
        maximumFractionDigits: 2
      }).format(number);
    } catch {
      return `${curr} ${number.toFixed(2)}`;
    }
  };

  function saveWatchlist() {
    try {
      localStorage.setItem(
        "cd_watchlist_v10",
        JSON.stringify(watchlist)
      );
    } catch (error) {
      console.error("Watchlist save error:", error);
    }
  }

  /* =========================================================
     API
  ========================================================= */

  async function get(path) {
    const response = await fetch(API_BASE + path, {
      method: "GET",
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

  /* =========================================================
     DEAL CARD
  ========================================================= */

  function dealCard(deal) {
    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);

    const saving = Math.max(
      0,
      (Number.isFinite(oldPrice) ? oldPrice : 0) -
        (Number.isFinite(newPrice) ? newPrice : 0)
    );

    const discount = Number(deal.discount_percent || 0);

    const imageUrl = deal.image_url
      ? esc(deal.image_url)
      : "";

    const title = esc(deal.title || "Untitled Deal");
    const store = esc(deal.store || "Store");
    const url = esc(deal.url || "#");
    const currency = deal.currency || "USD";

    return `
      <article
        class="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-surface-container/60 mb-3"
        style="display:flex;gap:12px;align-items:flex-start;"
      >

        ${
          imageUrl
            ? `
              <div
                class="w-24 h-24 rounded-xl bg-surface-subtle overflow-hidden flex-shrink-0 relative border border-surface-container flex items-center justify-center"
              >
                <img
                  src="${imageUrl}"
                  alt="${title}"
                  class="w-full h-full object-contain"
                  loading="lazy"
                  onerror="this.style.display='none';"
                >
              </div>
            `
            : ""
        }

        <div class="flex flex-col flex-grow min-w-0 justify-between">

          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold text-outline uppercase">
              ${store}
            </span>

            <span
              class="px-1.5 py-0.5 rounded bg-savings-green-subtle text-savings-green font-bold text-[11px]"
            >
              ${discount.toFixed(0)}% OFF
            </span>
          </div>

          <h4
            class="font-headline-sm text-[14px] font-semibold text-on-surface line-clamp-2 leading-snug mt-0.5"
          >
            ${title}
          </h4>

          <div class="flex items-baseline gap-2 mt-1">
            <span class="font-bold text-[18px] text-on-surface">
              ${money(newPrice, currency)}
            </span>

            ${
              oldPrice > 0
                ? `
                  <span class="text-[12px] text-outline line-through">
                    ${money(oldPrice, currency)}
                  </span>
                `
                : ""
            }
          </div>

          <div
            class="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-surface-container-low"
          >

            <div class="flex items-center gap-1 text-[11px] text-outline">
              <span
                class="material-symbols-outlined text-[14px] text-savings-green"
              >
                verified
              </span>

              ${esc(deal.last_verified_at || "Just now")}
            </div>

            <div class="flex items-center gap-1.5">

              <button
                class="watch-deal p-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                data-title="${title}"
                data-price="${newPrice}"
                data-currency="${esc(currency)}"
                type="button"
                title="Watch this deal"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-warning-amber"
                >
                  notifications
                </span>
              </button>

              ${
                url !== "#"
                  ? `
                    <a
                      href="${url}"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      class="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-[13px] font-semibold flex items-center gap-1 shadow-sm text-decoration-none"
                    >
                      <span>Get Deal</span>

                      <span class="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </a>
                  `
                  : ""
              }

            </div>

          </div>
        </div>
      </article>
    `;
  }

  /* =========================================================
     FIND DEAL CONTAINER
  ========================================================= */

  function getDealsContainer() {
    const explicit = $("discountsContainer");

    if (explicit) {
      return explicit;
    }

    const section = document.getElementById("market-deals");

    if (!section) {
      return null;
    }

    /*
      New index.html does not currently have
      discountsContainer ID.

      We therefore find the most suitable flex column
      container without changing the HTML structure.
    */

    const candidates = Array.from(
      section.querySelectorAll(".flex.flex-col.gap-3")
    );

    if (candidates.length) {
      return candidates[candidates.length - 1];
    }

    return null;
  }

  /* =========================================================
     FEATURED DEAL
  ========================================================= */

  function renderFeatured(deal) {
    if (!deal) {
      return;
    }

    const section = document.getElementById("market-deals");

    if (!section) {
      return;
    }

    /*
      Find the featured preview card.
      We deliberately avoid replacing the entire section
      because the new design must remain unchanged.
    */

    const cards = Array.from(
      section.querySelectorAll(
        ".bg-surface-container-lowest.rounded-2xl"
      )
    );

    let previewContainer = null;

    for (const card of cards) {
      const heading = card.querySelector("h3");

      if (heading) {
        previewContainer = card;
        break;
      }
    }

    if (!previewContainer) {
      return;
    }

    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);

    const saveAmount = Math.max(
      0,
      (Number.isFinite(oldPrice) ? oldPrice : 0) -
        (Number.isFinite(newPrice) ? newPrice : 0)
    );

    const image = previewContainer.querySelector("img");

    if (image) {
      image.src = deal.image_url || "";
      image.alt = deal.title || "Featured Deal";

      if (!deal.image_url) {
        image.style.display = "none";
      } else {
        image.style.display = "";
      }
    }

    const heading = previewContainer.querySelector("h3");

    if (heading) {
      heading.textContent = deal.title || "Featured Deal";
    }

    const priceElements =
      previewContainer.querySelectorAll(
        ".font-headline-sm"
      );

    if (priceElements.length) {
      for (const element of priceElements) {
        if (
          element.textContent.includes("$") ||
          element.textContent.includes("USD") ||
          element.textContent.trim() === ""
        ) {
          element.textContent = money(
            newPrice,
            deal.currency
          );
          break;
        }
      }
    }

    const del = previewContainer.querySelector("del");

    if (del) {
      del.textContent =
        oldPrice > 0
          ? money(oldPrice, deal.currency)
          : "";
    }

    const savingBadge =
      previewContainer.querySelector(
        ".bg-savings-green-subtle"
      );

    if (savingBadge) {
      savingBadge.innerHTML = `
        <span class="material-symbols-outlined text-[14px]">
          savings
        </span>
        Save ${money(saveAmount, deal.currency)}
      `;
    }

    const dealLink =
      previewContainer.querySelector("a");

    if (dealLink && deal.url) {
      dealLink.href = deal.url;
      dealLink.target = "_blank";
      dealLink.rel =
        "noopener noreferrer sponsored";
    }
  }

  /* =========================================================
     RENDER DEALS
  ========================================================= */

  function renderDeals() {
    const verifiedDeals = allDeals.filter(
      (deal) =>
        String(
          deal.verification_status || "VERIFIED"
        ).toUpperCase() === "VERIFIED"
    );

    const featured =
      verifiedDeals.find(
        (deal) => Number(deal.is_featured) === 1
      ) || verifiedDeals[0];

    if (featured) {
      renderFeatured(featured);
    }

    const box = getDealsContainer();

    if (!box) {
      console.warn(
        "CheckerDiscount: deals container not found."
      );
      return;
    }

    if (!verifiedDeals.length) {
      box.innerHTML = `
        <div
          class="p-4 text-center text-outline"
        >
          No verified deals are available right now.
        </div>
      `;
      return;
    }

    box.innerHTML = verifiedDeals
      .map(dealCard)
      .join("");

    box
      .querySelectorAll(".watch-deal")
      .forEach((button) => {
        button.addEventListener(
          "click",
          function () {
            addWatch(
              this.dataset.title,
              Number(this.dataset.price)
            );
          }
        );
      });
  }

  /* =========================================================
     LOAD DEALS
  ========================================================= */

  async function loadDeals() {
    try {
      const data = await get("/api/deals");

      allDeals = Array.isArray(data.deals)
        ? data.deals
        : [];

      renderDeals();
      updateWatchlist();

    } catch (error) {
      console.error(
        "CheckerDiscount deal loading error:",
        error
      );

      const box = getDealsContainer();

      if (box) {
        box.innerHTML = `
          <div
            class="p-4 text-center text-outline"
          >
            Deals are temporarily unavailable.
          </div>
        `;
      }
    }
  }

  /* =========================================================
     SAVINGS CALCULATOR
  ========================================================= */

  window.calculateSavings = function () {
    const retailer =
      $("checkerStore")?.value.trim() || "Store";

    const purchasePrice =
      Number($("checkerPaid")?.value) || 0;

    const currentPrice =
      Number($("checkerCurrent")?.value) || 0;

    const savingsDelta =
      $("savingsDelta");

    const savingsAdvice =
      $("savingsAdvice");

    if (!savingsDelta) {
      return;
    }

    const savings = Math.max(
      0,
      purchasePrice - currentPrice
    );

    const percent =
      purchasePrice > 0
        ? (savings / purchasePrice) * 100
        : 0;

    savingsDelta.textContent =
      money(savings);

    if (savingsAdvice) {
      if (
        purchasePrice <= 0 ||
        currentPrice <= 0
      ) {
        savingsAdvice.textContent =
          "Enter both prices to calculate your savings.";
      } else {
        savingsAdvice.textContent =
          `${retailer}: ${money(
            purchasePrice
          )} vs ${money(
            currentPrice
          )} means a ${percent.toFixed(
            1
          )}% price drop.`;
      }
    }
  };

  /* =========================================================
     FINAL PRICE CALCULATOR
  ========================================================= */

  window.runFinalPriceCalc = function () {
    const price =
      Number($("calcPrice")?.value) || 0;

    const coupon =
      Number($("calcCoupon")?.value) || 0;

    const shipping =
      Number($("calcShipping")?.value) || 0;

    const tax =
      Number($("calcTax")?.value) || 0;

    const display =
      document.querySelector(
        "#finalPriceDisplay span:last-child"
      );

    if (!display) {
      return;
    }

    const total =
      Math.max(0, price - coupon) +
      shipping +
      tax;

    display.textContent =
      money(total);
  };

  /* =========================================================
     WATCHLIST
  ========================================================= */

  function addWatch(title, target) {
    if (
      !title ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      return;
    }

    const exists = watchlist.some(
      (item) =>
        String(item.title).toLowerCase() ===
        String(title).toLowerCase()
    );

    if (!exists) {
      watchlist.push({
        title,
        target,
        createdAt:
          new Date().toISOString()
      });

      saveWatchlist();

      alert(
        "Added to your watchlist!"
      );
    } else {
      alert(
        "This item is already in your watchlist."
      );
    }

    updateWatchlist();
  }

  window.addToWatchlist = function () {
    const title =
      $("watchProductName")
        ?.value.trim();

    const target =
      Number(
        $("watchAlertPrice")?.value
      );

    if (!title) {
      alert("Please enter a product name.");
      return;
    }

    if (
      !Number.isFinite(target) ||
      target <= 0
    ) {
      alert(
        "Please enter a valid target price."
      );
      return;
    }

    addWatch(title, target);

    if ($("watchProductName")) {
      $("watchProductName").value = "";
    }

    if ($("watchAlertPrice")) {
      $("watchAlertPrice").value = "";
    }
  };

  function updateWatchlist() {
    const statusBox =
      $("watchStatusText");

    if (!statusBox) {
      return;
    }

    if (!watchlist.length) {
      statusBox.textContent =
        "Watchlist empty. Add item above to track.";
      return;
    }

    const parent =
      statusBox.parentElement;

    if (!parent) {
      return;
    }

    const names = watchlist
      .map((item) =>
        esc(item.title)
      )
      .join(", ");

    parent.innerHTML = `
      <span
        class="material-symbols-outlined text-[16px] text-savings-green"
      >
        check_circle
      </span>

      <span id="watchStatusText">
        Tracking ${watchlist.length}
        item${watchlist.length === 1 ? "" : "s"}:
        ${names}
      </span>
    `;
  }

  /* =========================================================
     SEARCH / COMPARISON
  ========================================================= */

  function findInputNearButton(button) {
    if (!button) {
      return null;
    }

    const parent =
      button.parentElement;

    if (parent) {
      const input =
        parent.querySelector("input");

      if (input) {
        return input;
      }
    }

    const grand =
      parent?.parentElement;

    if (grand) {
      const input =
        grand.querySelector("input");

      if (input) {
        return input;
      }
    }

    return null;
  }

  function findButtonByText(text) {
    const buttons =
      Array.from(
        document.querySelectorAll("button")
      );

    const wanted =
      text.toLowerCase();

    return (
      buttons.find(
        (button) =>
          button.textContent
            .trim()
            .toLowerCase()
            .includes(wanted)
      ) || null
    );
  }

  function showToolMessage(
    container,
    message
  ) {
    if (!container) {
      return;
    }

    let output =
      container.querySelector(
        ".cd-tool-result"
      );

    if (!output) {
      output =
        document.createElement("div");

      output.className =
        "cd-tool-result mt-3 p-3 rounded-xl text-sm bg-surface-container-low text-on-surface";

      container.appendChild(output);
    }

    output.textContent = message;
  }

  /* =========================================================
     COMPARISON TOOL
  ========================================================= */

  async function runComparison(button) {
    const input =
      findInputNearButton(button);

    const query =
      input?.value.trim() || "";

    if (!query) {
      alert(
        "Please enter a product name."
      );
      return;
    }

    const tool =
      button.closest("div");

    try {
      button.disabled = true;
      button.textContent =
        "Checking...";

      const data =
        await get(
          "/api/deals?q=" +
          encodeURIComponent(query)
        );

      const deals =
        Array.isArray(data.deals)
          ? data.deals
          : [];

      if (!deals.length) {
        showToolMessage(
          tool,
          "No verified deals found for this product."
        );
        return;
      }

      const html = deals
        .slice(0, 8)
        .map(
          (deal) => `
            <div class="flex items-center justify-between gap-3 py-2 border-b border-surface-container-low last:border-0">
              <div class="min-w-0">
                <div class="font-semibold text-sm truncate">
                  ${esc(deal.store)}
                </div>
                <div class="text-xs text-outline truncate">
                  ${esc(deal.title)}
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <div class="font-bold">
                  ${money(
                    deal.new_price,
                    deal.currency
                  )}
                </div>

                <div class="text-xs text-savings-green font-semibold">
                  ${Number(
                    deal.discount_percent || 0
                  ).toFixed(0)}% OFF
                </div>
              </div>
            </div>
          `
        )
        .join("");

      let output =
        tool?.querySelector(
          ".cd-tool-result"
        );

      if (!output) {
        output =
          document.createElement("div");

        output.className =
          "cd-tool-result mt-3 p-3 rounded-xl bg-surface-container-low";

        tool?.appendChild(output);
      }

      output.innerHTML = html;

    } catch (error) {
      showToolMessage(
        tool,
        error.message ||
          "Unable to compare deals."
      );
    } finally {
      button.disabled = false;
      button.textContent =
        "Compare Across Stores";
    }
  }

  /* =========================================================
     PRICE HISTORY
  ========================================================= */

  async function runHistory(button) {
    const input =
      findInputNearButton(button);

    const query =
      input?.value.trim() || "";

    if (!query) {
      alert(
        "Please enter a product name."
      );
      return;
    }

    const tool =
      button.closest("div");

    const matching =
      allDeals.filter(
        (deal) =>
          String(deal.title || "")
            .toLowerCase()
            .includes(query.toLowerCase())
      );

    if (!matching.length) {
      showToolMessage(
        tool,
        "No matching verified deal was found for price history."
      );
      return;
    }

    const deal =
      matching[0];

    try {
      button.disabled = true;
      button.textContent =
        "Checking...";

      const data =
        await get(
          `/api/deals/${Number(
            deal.id
          )}/history`
        );

      const history =
        Array.isArray(data.history)
          ? data.history
          : [];

      if (!history.length) {
        showToolMessage(
          tool,
          "No price history is available yet. More history will appear as the deal is verified again."
        );
        return;
      }

      const latest =
        history[history.length - 1];

      const lowest =
        history.reduce(
          (min, item) =>
            Number(item.price) <
            Number(min.price)
              ? item
              : min,
          history[0]
        );

      const output =
        document.createElement(
          "div"
        );

      output.className =
        "cd-tool-result mt-3 p-3 rounded-xl bg-surface-container-low text-sm";

      output.innerHTML = `
        <div class="font-semibold mb-2">
          ${esc(deal.title)}
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="text-xs text-outline">
              Current
            </div>
            <div class="font-bold">
              ${money(
                latest.price,
                deal.currency
              )}
            </div>
          </div>

          <div>
            <div class="text-xs text-outline">
              Lowest recorded
            </div>
            <div class="font-bold text-savings-green">
              ${money(
                lowest.price,
                deal.currency
              )}
            </div>
          </div>
        </div>

        <div class="text-xs text-outline mt-2">
          ${history.length} recorded price check${
            history.length === 1
              ? ""
              : "s"
          }.
        </div>
      `;

      const old =
        tool?.querySelector(
          ".cd-tool-result"
        );

      if (old) {
        old.replaceWith(output);
      } else {
        tool?.appendChild(output);
      }

    } catch (error) {
      showToolMessage(
        tool,
        error.message ||
          "Unable to load price history."
      );
    } finally {
      button.disabled = false;
      button.textContent =
        "Check Price History";
    }
  }

  /* =========================================================
     COUPON TOOL
  ========================================================= */

  async function runCoupons(button) {
    const tool =
      button.closest("div");

    const inputs =
      tool
        ? Array.from(
            tool.querySelectorAll("input")
          )
        : [];

    const store =
      inputs[0]?.value.trim() || "";

    const keyword =
      inputs[1]?.value.trim() || "";

    if (!store && !keyword) {
      alert(
        "Please enter a store or keyword."
      );
      return;
    }

    try {
      button.disabled = true;
      button.textContent =
        "Checking...";

      const params =
        new URLSearchParams();

      if (store) {
        params.set(
          "store",
          store
        );
      }

      if (keyword) {
        params.set(
          "q",
          keyword
        );
      }

      const data =
        await get(
          "/api/coupons?" +
          params.toString()
        );

      const coupons =
        Array.isArray(data.coupons)
          ? data.coupons
          : [];

      if (!coupons.length) {
        showToolMessage(
          tool,
          "No verified coupons found."
        );
        return;
      }

      const output =
        document.createElement(
          "div"
        );

      output.className =
        "cd-tool-result mt-3 p-3 rounded-xl bg-surface-container-low";

      output.innerHTML =
        coupons
          .slice(0, 8)
          .map(
            (coupon) => `
              <div class="py-2 border-b border-surface-container-low last:border-0">

                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-sm">
                    ${esc(coupon.store)}
                  </span>

                  ${
                    coupon.discount_text
                      ? `
                        <span class="text-xs font-bold text-savings-green">
                          ${esc(
                            coupon.discount_text
                          )}
                        </span>
                      `
                      : ""
                  }
                </div>

                <div class="text-sm mt-1">
                  ${esc(coupon.title)}
                </div>

                ${
                  coupon.code
                    ? `
                      <div class="mt-1 text-xs">
                        Code:
                        <strong>
                          ${esc(
                            coupon.code
                          )}
                        </strong>
                      </div>
                    `
                    : ""
                }

                ${
                  coupon.url
                    ? `
                      <a
                        href="${esc(
                          coupon.url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        class="inline-block mt-2 text-xs font-semibold"
                      >
                        View Coupon
                      </a>
                    `
                    : ""
                }

              </div>
            `
          )
          .join("");

      const old =
        tool.querySelector(
          ".cd-tool-result"
        );

      if (old) {
        old.replaceWith(output);
      } else {
        tool.appendChild(output);
      }

    } catch (error) {
      showToolMessage(
        tool,
        error.message ||
          "Unable to load coupons."
      );
    } finally {
      button.disabled = false;
      button.textContent =
        "Check Verified Coupons";
    }
  }

  /* =========================================================
     TOOL BUTTON CONNECTION
  ========================================================= */

  function connectSmartTools() {
    const comparison =
      findButtonByText(
        "Compare Across Stores"
      );

    if (
      comparison &&
      !comparison.dataset.cdConnected
    ) {
      comparison.dataset.cdConnected =
        "1";

      comparison.addEventListener(
        "click",
        () =>
          runComparison(
            comparison
          )
      );
    }

    const history =
      findButtonByText(
        "Check Price History"
      );

    if (
      history &&
      !history.dataset.cdConnected
    ) {
      history.dataset.cdConnected =
        "1";

      history.addEventListener(
        "click",
        () =>
          runHistory(history)
      );
    }

    const coupons =
      findButtonByText(
        "Check Verified Coupons"
      );

    if (
      coupons &&
      !coupons.dataset.cdConnected
    ) {
      coupons.dataset.cdConnected =
        "1";

      coupons.addEventListener(
        "click",
        () =>
          runCoupons(coupons)
      );
    }
  }

  /* =========================================================
     FILTER BUTTONS
  ========================================================= */

  function connectFilters() {
    const section =
      document.getElementById(
        "market-deals"
      );

    if (!section) {
      return;
    }

    const buttons =
      Array.from(
        section.querySelectorAll(
          "button"
        )
      );

    buttons.forEach(
      (button) => {
        if (
          button.dataset.cdFilterConnected
        ) {
          return;
        }

        const text =
          button.textContent
            .trim()
            .toLowerCase();

        const filterWords = [
          "all",
          "amazon",
          "ebay",
          "walmart",
          "best",
          "electronics",
          "home",
          "fashion"
        ];

        if (
          !filterWords.some(
            (word) =>
              text === word ||
              text.includes(word)
          )
        ) {
          return;
        }

        button.dataset.cdFilterConnected =
          "1";

        button.addEventListener(
          "click",
          () => {
            const word =
              button.textContent
                .trim()
                .toLowerCase();

            if (
              word === "all" ||
              word === "best"
            ) {
              renderDeals();
              return;
            }

            const filtered =
              allDeals.filter(
                (deal) =>
                  String(
                    deal.store || ""
                  )
                    .toLowerCase()
                    .includes(word) ||
                  String(
                    deal.title || ""
                  )
                    .toLowerCase()
                    .includes(word)
              );

            const box =
              getDealsContainer();

            if (!box) {
              return;
            }

            if (!filtered.length) {
              box.innerHTML = `
                <div class="p-4 text-center text-outline">
                  No verified deals found for this filter.
                </div>
              `;
              return;
            }

            box.innerHTML =
              filtered
                .map(dealCard)
                .join("");

            box
              .querySelectorAll(
                ".watch-deal"
              )
              .forEach(
                (watchButton) => {
                  watchButton.addEventListener(
                    "click",
                    () => {
                      addWatch(
                        watchButton.dataset.title,
                        Number(
                          watchButton.dataset.price
                        )
                      );
                    }
                  );
                }
              );
          }
        );
      }
    );
  }

  /* =========================================================
     START
  ========================================================= */

  function init() {
    connectSmartTools();
    connectFilters();
    updateWatchlist();
    loadDeals();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

  /*
    Useful for manual refresh from browser console
    or future frontend code.
  */
  window.refreshCheckerDiscountDeals =
    loadDeals;

})();
