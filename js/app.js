/* =========================================================
   CheckerDiscount - js/app.js
   Complete updated frontend application
========================================================= */

const API_BASE = "https://deal-api.hamraahirn32.workers.dev";

const COUNTRIES = {
    US:{name:"United States",flag:"🇺🇸",currency:"USD"},
    GB:{name:"United Kingdom",flag:"🇬🇧",currency:"GBP"},
    SA:{name:"Saudi Arabia",flag:"🇸🇦",currency:"SAR"},
    AE:{name:"United Arab Emirates",flag:"🇦🇪",currency:"AED"},
    OM:{name:"Oman",flag:"🇴🇲",currency:"OMR"},
    PK:{name:"Pakistan",flag:"🇵🇰",currency:"PKR"},
    IN:{name:"India",flag:"🇮🇳",currency:"INR"},
    CA:{name:"Canada",flag:"🇨🇦",currency:"CAD"},
    AU:{name:"Australia",flag:"🇦🇺",currency:"AUD"},
    DE:{name:"Germany",flag:"🇩🇪",currency:"EUR"},
    FR:{name:"France",flag:"🇫🇷",currency:"EUR"},
    IT:{name:"Italy",flag:"🇮🇹",currency:"EUR"},
    ES:{name:"Spain",flag:"🇪🇸",currency:"EUR"},
    NL:{name:"Netherlands",flag:"🇳🇱",currency:"EUR"},
    BE:{name:"Belgium",flag:"🇧🇪",currency:"EUR"},
    AT:{name:"Austria",flag:"🇦🇹",currency:"EUR"},
    CH:{name:"Switzerland",flag:"🇨🇭",currency:"CHF"},
    NO:{name:"Norway",flag:"🇳🇴",currency:"NOK"},
    SE:{name:"Sweden",flag:"🇸🇪",currency:"SEK"},
    DK:{name:"Denmark",flag:"🇩🇰",currency:"DKK"},
    NZ:{name:"New Zealand",flag:"🇳🇿",currency:"NZD"},
    JP:{name:"Japan",flag:"🇯🇵",currency:"JPY"},
    CN:{name:"China",flag:"🇨🇳",currency:"CNY"},
    KR:{name:"South Korea",flag:"🇰🇷",currency:"KRW"},
    SG:{name:"Singapore",flag:"🇸🇬",currency:"SGD"},
    MY:{name:"Malaysia",flag:"🇲🇾",currency:"MYR"},
    TH:{name:"Thailand",flag:"🇹🇭",currency:"THB"},
    ID:{name:"Indonesia",flag:"🇮🇩",currency:"IDR"},
    PH:{name:"Philippines",flag:"🇵🇭",currency:"PHP"},
    VN:{name:"Vietnam",flag:"🇻🇳",currency:"VND"},
    TR:{name:"Turkey",flag:"🇹🇷",currency:"TRY"},
    BR:{name:"Brazil",flag:"🇧🇷",currency:"BRL"},
    MX:{name:"Mexico",flag:"🇲🇽",currency:"MXN"},
    ZA:{name:"South Africa",flag:"🇿🇦",currency:"ZAR"},
    QA:{name:"Qatar",flag:"🇶🇦",currency:"QAR"},
    KW:{name:"Kuwait",flag:"🇰🇼",currency:"KWD"},
    BH:{name:"Bahrain",flag:"🇧🇭",currency:"BHD"}
};

const POPULAR_COUNTRIES = [
    "US","GB","SA","AE","OM","PK","IN","CA","AU","DE"
];

const CATEGORIES = [
    "all",
    "electronics",
    "home",
    "fashion",
    "beauty",
    "health",
    "gaming",
    "computers",
    "mobile",
    "appliances",
    "tools",
    "sports",
    "automotive",
    "kids",
    "office",
    "grocery",
    "travel",
    "pet",
    "other"
];

let globalDeals = [];
let currentCountry = "";
let currentCategory = "all";
let customer = null;
let authToken = localStorage.getItem("cd_session_token") || "";


/* =========================================================
   BASIC HELPERS
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function savings(oldPrice, newPrice) {
    return Math.max(0, number(oldPrice) - number(newPrice));
}

function discountPercent(oldPrice, newPrice) {
    const oldValue = number(oldPrice);
    const newValue = number(newPrice);

    if (oldValue <= 0) return 0;

    return Math.max(
        0,
        ((oldValue - newValue) / oldValue) * 100
    );
}

function getDealCountry(deal) {
    const code = String(
        deal?.country_code ||
        deal?.countryCode ||
        ""
    ).toUpperCase();

    if (COUNTRIES[code]) return code;

    const currency = String(
        deal?.currency || ""
    ).toUpperCase();

    if (currency === "USD") return "US";
    if (currency === "GBP") return "GB";
    if (currency === "SAR") return "SA";
    if (currency === "AED") return "AE";
    if (currency === "OMR") return "OM";

    return "";
}

function getDealCurrency(deal) {
    const country = getDealCountry(deal);

    if (
        deal?.currency &&
        String(deal.currency).trim()
    ) {
        return String(deal.currency).toUpperCase();
    }

    return COUNTRIES[country]?.currency || "USD";
}

function formatPrice(value, currency = "USD") {
    const amount = number(value);

    try {
        let output = new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                currencyDisplay: "code",
                minimumFractionDigits:
                    ["OMR","KWD","BHD"].includes(currency)
                        ? 3
                        : undefined,
                maximumFractionDigits:
                    ["OMR","KWD","BHD"].includes(currency)
                        ? 3
                        : 2
            }
        ).format(amount);

        return output.replace(/\u00a0/g, " ");
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

function ratingValue(deal) {
    const value = Number(
        deal?.rating ??
        deal?.Rating ??
        deal?.review_rating ??
        deal?.reviewRating ??
        0
    );

    if (!Number.isFinite(value)) return 0;

    return Math.max(0, Math.min(5, value));
}

function ratingHtml(deal) {
    const rating = ratingValue(deal);

    if (!rating) {
        return `
            <span class="cd-rating">
                ☆ No rating
            </span>
        `;
    }

    return `
        <span class="cd-rating">
            ★ ${rating.toFixed(1)}
        </span>
    `;
}

function getDealImage(deal) {
    return (
        deal?.image_url ||
        deal?.imageUrl ||
        deal?.image ||
        ""
    );
}

function getDealUrl(deal) {
    return (
        deal?.url ||
        deal?.affiliate_url ||
        deal?.affiliateUrl ||
        "#"
    );
}

function normalizeDeal(deal) {
    const country = getDealCountry(deal);
    const currency = getDealCurrency(deal);

    const oldPrice = number(
        deal?.old_price ??
        deal?.oldPrice
    );

    const newPrice = number(
        deal?.new_price ??
        deal?.newPrice
    );

    return {
        ...deal,

        id: deal?.id,

        title: deal?.title || "Untitled Deal",

        store: deal?.store || "Retailer",

        old_price: oldPrice,

        new_price: newPrice,

        currency,

        country_code: country,

        category: String(
            deal?.category || "other"
        ).toLowerCase(),

        discount_percent:
            number(deal?.discount_percent) ||
            discountPercent(oldPrice, newPrice),

        rating: ratingValue(deal),

        is_featured:
            Number(deal?.is_featured) === 1 ||
            deal?.is_featured === true ||
            deal?.isFeatured === true,

        image_url: getDealImage(deal),

        url: getDealUrl(deal)
    };
}


/* =========================================================
   API
========================================================= */

async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
        `${API_BASE}${path}`,
        {
            ...options,
            headers
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data?.error ||
            data?.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupBurgerMenu();

    setupSavingsChecker();

    setupCountrySystem();

    setupCustomerSystem();

    await restoreCustomerSession();

    await fetchDealsAndInit();

});


/* =========================================================
   BURGER MENU
========================================================= */

function setupBurgerMenu() {

    const button = $("#menuButton");
    const nav = $("#mainNav");

    if (!button || !nav) return;

    button.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {
            nav.classList.remove("open");
        });

    });
}


/* =========================================================
   COUNTRY SYSTEM
========================================================= */

function setupCountrySystem() {

    const dealsSection = $("#deals");

    if (!dealsSection) return;

    let system = $("#cd-country-system");

    if (!system) {

        system = document.createElement("div");

        system.id = "cd-country-system";

        const heading =
            dealsSection.querySelector(".section-heading");

        if (heading) {
            heading.insertAdjacentElement(
                "afterend",
                system
            );
        } else {
            dealsSection.prepend(system);
        }
    }

    renderCountrySystem();
}

function renderCountrySystem() {

    const system = $("#cd-country-system");

    if (!system) return;

    system.innerHTML = `
        <div class="cd-country-title">
            🌍 Browse Deals by Country
        </div>

        <div class="cd-country-grid">

            <button
                type="button"
                class="cd-country-button ${currentCountry === "" ? "active" : ""}"
                data-country="">
                <span class="cd-country-flag">🌎</span>
                <span class="cd-country-name">All Countries</span>
            </button>

            ${POPULAR_COUNTRIES.map(code => {

                const country = COUNTRIES[code];

                return `
                    <button
                        type="button"
                        class="cd-country-button ${
                            currentCountry === code
                                ? "active"
                                : ""
                        }"
                        data-country="${code}">

                        <span class="cd-country-flag">
                            ${country.flag}
                        </span>

                        <span class="cd-country-name">
                            ${escapeHtml(country.name)}
                        </span>

                    </button>
                `;

            }).join("")}

        </div>

        <div style="
            display:flex;
            justify-content:flex-end;
            margin-top:9px;
        ">
            <button
                type="button"
                id="cdMoreCountries"
                style="
                    border:0;
                    background:transparent;
                    color:#155EEF;
                    font-size:11px;
                    font-weight:700;
                    cursor:pointer;
                ">
                More Countries ▾
            </button>
        </div>

        <div
            id="cdMoreCountryGrid"
            style="
                display:none;
                margin-top:9px;
            ">
        </div>
    `;

    system
        .querySelectorAll("[data-country]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    selectCountry(
                        button.dataset.country || ""
                    );
                }
            );

        });

    const moreButton =
        $("#cdMoreCountries");

    const moreGrid =
        $("#cdMoreCountryGrid");

    if (moreButton && moreGrid) {

        moreButton.addEventListener("click", () => {

            if (
                moreGrid.style.display === "block"
            ) {

                moreGrid.style.display = "none";

                moreButton.textContent =
                    "More Countries ▾";

                return;
            }

            moreGrid.style.display = "block";

            moreButton.textContent =
                "Hide Countries ▴";

            moreGrid.innerHTML = `
                <div class="cd-country-grid">

                    ${Object.keys(COUNTRIES)
                        .filter(
                            code =>
                                !POPULAR_COUNTRIES.includes(code)
                        )
                        .map(code => {

                            const country =
                                COUNTRIES[code];

                            return `
                                <button
                                    type="button"
                                    class="cd-country-button ${
                                        currentCountry === code
                                            ? "active"
                                            : ""
                                    }"
                                    data-country="${code}">

                                    <span class="cd-country-flag">
                                        ${country.flag}
                                    </span>

                                    <span class="cd-country-name">
                                        ${escapeHtml(country.name)}
                                    </span>

                                </button>
                            `;

                        }).join("")}

                </div>
            `;

            moreGrid
                .querySelectorAll("[data-country]")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            selectCountry(
                                button.dataset.country
                            );

                            moreGrid.style.display =
                                "none";

                            moreButton.textContent =
                                "More Countries ▾";
                        }
                    );

                });

        });
    }
}

async function selectCountry(code) {

    currentCountry =
        String(code || "").toUpperCase();

    currentCategory = "all";

    renderCountrySystem();

    renderDeals();

    updateUrlCountry();

    window.scrollTo({
        top:
            ($("#deals")?.offsetTop || 0) - 80,
        behavior: "smooth"
    });
}

function updateUrlCountry() {

    try {

        const url =
            new URL(window.location.href);

        if (currentCountry) {
            url.searchParams.set(
                "country",
                currentCountry
            );
        } else {
            url.searchParams.delete("country");
        }

        window.history.replaceState(
            {},
            "",
            url.toString()
        );

    } catch {}
}


/* =========================================================
   DEAL FETCHING
========================================================= */

async function fetchDealsAndInit() {

    const container =
        $("#discountsContainer");

    if (container) {
        container.innerHTML = `
            <p style="
                color:#667085;
                font-size:13px;
                padding:20px 0;
            ">
                Loading verified deals...
            </p>
        `;
    }

    try {

        const data =
            await apiFetch("/api/deals");

        const deals =
            Array.isArray(data)
                ? data
                : (
                    data?.deals ||
                    data?.results ||
                    []
                );

        globalDeals =
            deals.map(normalizeDeal);

        renderCountrySystem();

        renderSpotlight();

        renderDeals();

        renderCategories();

    } catch (error) {

        console.error(
            "CheckerDiscount deal loading error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div style="
                    padding:25px 5px;
                    text-align:center;
                    color:#667085;
                    font-size:13px;
                ">
                    Unable to load deals right now.
                    Please try again later.
                </div>
            `;
        }
    }
}


/* =========================================================
   FILTERING
========================================================= */

function getVisibleDeals() {

    let deals = [...globalDeals];

    if (currentCountry) {

        deals = deals.filter(
            deal =>
                getDealCountry(deal) ===
                currentCountry
        );

    }

    if (
        currentCategory &&
        currentCategory !== "all"
    ) {

        deals = deals.filter(
            deal =>
                String(
                    deal.category || ""
                ).toLowerCase() ===
                currentCategory.toLowerCase()
        );

    }

    return deals;
}


/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {

    const container =
        $("#discountsContainer");

    if (!container) return;

    const existing =
        $("#cd-category-system");

    if (existing) existing.remove();

    const categories = [
        ...new Set(
            getVisibleDeals()
                .map(deal =>
                    String(
                        deal.category || ""
                    ).toLowerCase()
                )
                .filter(Boolean)
        )
    ];

    if (!categories.length) return;

    const wrapper =
        document.createElement("div");

    wrapper.id = "cd-category-system";

    wrapper.style.cssText = `
        display:flex;
        gap:7px;
        flex-wrap:wrap;
        margin-bottom:15px;
    `;

    const allButton =
        createCategoryButton(
            "all",
            "All",
            currentCategory === "all"
        );

    wrapper.appendChild(allButton);

    categories
        .sort()
        .forEach(category => {

            const button =
                createCategoryButton(
                    category,
                    capitalize(category),
                    currentCategory === category
                );

            wrapper.appendChild(button);

        });

    container.parentElement.insertBefore(
        wrapper,
        container
    );
}

function createCategoryButton(
    value,
    label,
    active
) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.textContent = label;

    button.style.cssText = `
        border:1px solid ${
            active ? "#155EEF" : "#E4EAF2"
        };
        background:${
            active ? "#EEF4FF" : "#FFFFFF"
        };
        color:${
            active ? "#155EEF" : "#475467"
        };
        border-radius:999px;
        padding:7px 11px;
        font-size:11px;
        font-weight:700;
        cursor:pointer;
    `;

    button.addEventListener("click", () => {

        currentCategory = value;

        renderCategories();

        renderDeals();

    });

    return button;
}

function capitalize(value) {

    return String(value)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, c =>
            c.toUpperCase()
        );
}


/* =========================================================
   SPOTLIGHT / FEATURED
========================================================= */

function renderSpotlight() {

    const dealsSection =
        $("#deals");

    if (!dealsSection) return;

    let spotlight =
        $("#cdSpotlight");

    if (!spotlight) {

        spotlight =
            document.createElement("div");

        spotlight.id = "cdSpotlight";

        const countrySystem =
            $("#cd-country-system");

        if (countrySystem) {

            countrySystem.insertAdjacentElement(
                "afterend",
                spotlight
            );

        } else {

            const heading =
                dealsSection.querySelector(
                    ".section-heading"
                );

            if (heading) {
                heading.insertAdjacentElement(
                    "afterend",
                    spotlight
                );
            } else {
                dealsSection.prepend(spotlight);
            }
        }
    }

    /*
       IMPORTANT:
       Only a deal explicitly marked as Featured
       can appear here.

       There is intentionally NO fallback to deals[0].
    */

    const featuredDeal =
        globalDeals.find(
            deal =>
                Number(deal.is_featured) === 1 ||
                deal.is_featured === true
        );

    if (!featuredDeal) {

        spotlight.innerHTML = "";

        spotlight.style.display = "none";

        return;
    }

    spotlight.style.display = "block";

    const country =
        getDealCountry(featuredDeal);

    const countryInfo =
        COUNTRIES[country];

    const currency =
        getDealCurrency(featuredDeal);

    const save =
        savings(
            featuredDeal.old_price,
            featuredDeal.new_price
        );

    const image =
        getDealImage(featuredDeal);

    const imageHtml =
        image
            ? `
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(
                        featuredDeal.title
                    )}"
                    loading="lazy"
                    onerror="this.style.display='none';"
                >
              `
            : `
                <span style="
                    color:#98A2B3;
                    font-size:12px;
                ">
                    No image
                </span>
              `;

    spotlight.innerHTML = `
        <div class="cd-spotlight-card">

            <span class="cd-spotlight-label">
                ⭐ Featured Deal
            </span>

            <div class="cd-spotlight-content">

                <div class="cd-spotlight-image">
                    ${imageHtml}
                </div>

                <div>

                    <div class="cd-spotlight-store">
                        ${
                            countryInfo
                                ? countryInfo.flag
                                : "🌎"
                        }
                        ${
                            countryInfo
                                ? escapeHtml(
                                    countryInfo.name
                                )
                                : ""
                        }
                        •
                        ${escapeHtml(
                            featuredDeal.store
                        )}
                    </div>

                    <h3 class="cd-spotlight-title">
                        ${escapeHtml(
                            featuredDeal.title
                        )}
                    </h3>

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        flex-wrap:wrap;
                    ">
                        ${ratingHtml(featuredDeal)}

                        ${
                            featuredDeal.discount_percent > 0
                                ? `
                                    <span style="
                                        color:#B54708;
                                        background:#FFF7E8;
                                        padding:5px 8px;
                                        border-radius:7px;
                                        font-size:11px;
                                        font-weight:800;
                                    ">
                                        ${Number(
                                            featuredDeal.discount_percent
                                        ).toFixed(0)}% OFF
                                    </span>
                                `
                                : ""
                        }
                    </div>

                    <div class="cd-spotlight-prices">

                        <span class="cd-old-price">
                            ${formatPrice(
                                featuredDeal.old_price,
                                currency
                            )}
                        </span>

                        <span class="cd-new-price">
                            ${formatPrice(
                                featuredDeal.new_price,
                                currency
                            )}
                        </span>

                    </div>

                    <div class="cd-save">
                        You Save ${formatPrice(
                            save,
                            currency
                        )}
                    </div>

                    <div style="margin-top:14px;">

                        <a
                            href="${escapeHtml(
                                getDealUrl(featuredDeal)
                            )}"
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            class="deal-button">
                            Check This Deal →
                        </a>

                    </div>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   NORMAL DEAL CARDS
========================================================= */

function renderDeals() {

    const container =
        $("#discountsContainer");

    if (!container) return;

    const deals =
        getVisibleDeals();

    if (!deals.length) {

        container.innerHTML = `
            <div style="
                text-align:center;
                padding:40px 15px;
                color:#667085;
            ">

                <div style="
                    font-size:32px;
                    margin-bottom:8px;
                ">
                    🔎
                </div>

                <div style="
                    font-size:14px;
                    font-weight:700;
                    color:#344054;
                    margin-bottom:5px;
                ">
                    No verified deals found
                </div>

                <div style="
                    font-size:12px;
                ">
                    Try another country or category.
                </div>

            </div>
        `;

        return;
    }

    container.innerHTML =
        deals.map(
            deal => renderDealCard(deal)
        ).join("");

    attachDealEvents();
}

function renderDealCard(deal) {

    const country =
        getDealCountry(deal);

    const countryInfo =
        COUNTRIES[country];

    const currency =
        getDealCurrency(deal);

    const save =
        savings(
            deal.old_price,
            deal.new_price
        );

    const image =
        getDealImage(deal);

    const imageHtml =
        image
            ? `
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(
                        deal.title
                    )}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.parentElement.innerHTML='<span style=&quot;color:#98A2B3;font-size:12px;&quot;>No image</span>';
                    "
                >
              `
            : `
                <span style="
                    color:#98A2B3;
                    font-size:12px;
                ">
                    No image
                </span>
              `;

    return `
        <article
            class="discount-card"
            data-deal-id="${escapeHtml(
                deal.id
            )}">

            <div class="deal-image">
                ${imageHtml}
            </div>

            <div class="deal-card-content">

                <div class="deal-top-line">

                    <div class="deal-store">

                        ${
                            countryInfo
                                ? countryInfo.flag
                                : "🌎"
                        }

                        ${
                            countryInfo
                                ? escapeHtml(
                                    countryInfo.name
                                )
                                : ""
                        }

                        •

                        <span class="deal-store-check">
                            ✓
                        </span>

                        ${escapeHtml(
                            deal.store
                        )}

                    </div>

                    ${
                        deal.discount_percent > 0
                            ? `
                                <span class="deal-discount">
                                    ${Number(
                                        deal.discount_percent
                                    ).toFixed(0)}% OFF
                                </span>
                            `
                            : ""
                    }

                </div>


                <h3 class="deal-title">
                    ${escapeHtml(
                        deal.title
                    )}
                </h3>


                <div style="
                    display:flex;
                    align-items:center;
                    gap:7px;
                    flex-wrap:wrap;
                    margin-bottom:7px;
                ">

                    ${ratingHtml(deal)}

                </div>


                <div class="deal-prices">

                    <span class="deal-old-price">
                        ${formatPrice(
                            deal.old_price,
                            currency
                        )}
                    </span>

                    <span class="deal-new-price">
                        ${formatPrice(
                            deal.new_price,
                            currency
                        )}
                    </span>

                </div>


                <div class="deal-saving">
                    You Save ${formatPrice(
                        save,
                        currency
                    )}
                </div>


                <div class="deal-message">
                    Verified deal • ${
                        countryInfo
                            ? escapeHtml(
                                countryInfo.name
                            )
                            : "International"
                    }
                </div>


                <div style="
                    display:flex;
                    gap:7px;
                    flex-wrap:wrap;
                ">

                    <a
                        class="deal-button"
                        href="${escapeHtml(
                            getDealUrl(deal)
                        )}"
                        target="_blank"
                        rel="nofollow sponsored noopener">

                        Check Deal →

                    </a>

                    <button
                        type="button"
                        class="cd-save-deal"
                        data-save-id="${escapeHtml(
                            deal.id
                        )}"
                        style="
                            min-height:39px;
                            padding:0 12px;
                            border:1px solid #E4EAF2;
                            border-radius:8px;
                            background:#fff;
                            color:#344054;
                            font-size:12px;
                            font-weight:700;
                            cursor:pointer;
                        ">

                        ♡ Save

                    </button>

                    <button
                        type="button"
                        class="cd-share-deal"
                        data-share-id="${escapeHtml(
                            deal.id
                        )}"
                        style="
                            min-height:39px;
                            padding:0 12px;
                            border:1px solid #E4EAF2;
                            border-radius:8px;
                            background:#fff;
                            color:#344054;
                            font-size:12px;
                            font-weight:700;
                            cursor:pointer;
                        ">

                        Share

                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   DEAL EVENTS
========================================================= */

function attachDealEvents() {

    document
        .querySelectorAll(".cd-save-deal")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.saveId;

                    await saveDealForCustomer(id);

                }
            );

        });

    document
        .querySelectorAll(".cd-share-deal")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.shareId;

                    await shareDeal(id);

                }
            );

        });
}


/* =========================================================
   CUSTOMER UI
========================================================= */

function setupCustomerSystem() {

    if (!document.getElementById("cdAuthOverlay")) {

        const overlay =
            document.createElement("div");

        overlay.id = "cdAuthOverlay";

        overlay.className =
            "cd-auth-overlay";

        overlay.innerHTML = `

            <div class="cd-auth-box">

                <div class="cd-auth-header">

                    <h2 id="cdAuthTitle">
                        My Account
                    </h2>

                    <button
                        type="button"
                        class="cd-close"
                        id="cdCloseAuth">
                        ×
                    </button>

                </div>


                <div id="cdAuthContent">

                    <div class="cd-auth-tabs">

                        <button
                            type="button"
                            class="cd-auth-tab active"
                            id="cdLoginTab">
                            Login
                        </button>

                        <button
                            type="button"
                            class="cd-auth-tab"
                            id="cdRegisterTab">
                            Register
                        </button>

                    </div>


                    <form
                        id="cdLoginForm"
                        class="cd-auth-form">

                        <label>
                            Email

                            <input
                                type="email"
                                id="cdLoginEmail"
                                required
                                autocomplete="email">
                        </label>


                        <label>
                            Password

                            <input
                                type="password"
                                id="cdLoginPassword"
                                required
                                autocomplete="current-password">
                        </label>


                        <div
                            class="cd-auth-message"
                            id="cdLoginMessage">
                        </div>


                        <button
                            type="submit"
                            class="cd-auth-submit">
                            Login
                        </button>

                    </form>


                    <form
                        id="cdRegisterForm"
                        class="cd-auth-form"
                        style="display:none;">

                        <label>
                            Full Name

                            <input
                                type="text"
                                id="cdRegisterName"
                                required
                                minlength="2"
                                maxlength="80"
                                autocomplete="name">
                        </label>


                        <label>
                            Email

                            <input
                                type="email"
                                id="cdRegisterEmail"
                                required
                                autocomplete="email">
                        </label>


                        <label>
                            Password

                            <input
                                type="password"
                                id="cdRegisterPassword"
                                required
                                minlength="8"
                                autocomplete="new-password">
                        </label>


                        <div
                            class="cd-auth-message"
                            id="cdRegisterMessage">
                        </div>


                        <button
                            type="submit"
                            class="cd-auth-submit">
                            Create Account
                        </button>

                    </form>

                </div>


                <div
                    id="cdDashboard"
                    class="cd-dashboard">

                    <div
                        class="cd-dashboard-card"
                        id="cdAccountInfo">
                    </div>

                    <div
                        class="cd-dashboard-card">

                        <h3>
                            ❤️ Saved Deals
                        </h3>

                        <div id="cdSavedDeals">
                        </div>

                    </div>


                    <div
                        class="cd-dashboard-card">

                        <h3>
                            🔔 Price Alerts
                        </h3>

                        <div id="cdAlerts">
                        </div>

                    </div>


                    <button
                        type="button"
                        class="cd-logout"
                        id="cdLogout">
                        Logout
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);
    }


    const accountButton =
        $("#cdAccountButton");

    const overlay =
        $("#cdAuthOverlay");

    const close =
        $("#cdCloseAuth");

    if (accountButton) {

        accountButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openCustomerPanel();

            }
        );

    }

    if (close) {

        close.addEventListener(
            "click",
            closeCustomerPanel
        );

    }

    if (overlay) {

        overlay.addEventListener(
            "click",
            event => {

                if (event.target === overlay) {
                    closeCustomerPanel();
                }

            }
        );

    }

    const loginTab =
        $("#cdLoginTab");

    const registerTab =
        $("#cdRegisterTab");

    if (loginTab) {

        loginTab.addEventListener(
            "click",
            showLoginForm
        );

    }

    if (registerTab) {

        registerTab.addEventListener(
            "click",
            showRegisterForm
        );

    }

    const loginForm =
        $("#cdLoginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }

    const registerForm =
        $("#cdRegisterForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }

    const logout =
        $("#cdLogout");

    if (logout) {

        logout.addEventListener(
            "click",
            logoutCustomer
        );

    }
}

function openCustomerPanel() {

    const overlay =
        $("#cdAuthOverlay");

    if (!overlay) return;

    overlay.classList.add("open");

    if (customer) {
        showDashboard();
    } else {
        showLoginForm();
    }
}

function closeCustomerPanel() {

    const overlay =
        $("#cdAuthOverlay");

    if (overlay) {
        overlay.classList.remove("open");
    }
}

function showLoginForm() {

    $("#cdLoginForm").style.display =
        "grid";

    $("#cdRegisterForm").style.display =
        "none";

    $("#cdDashboard").classList.remove(
        "open"
    );

    $("#cdLoginTab").classList.add("active");

    $("#cdRegisterTab").classList.remove(
        "active"
    );

    $("#cdAuthTitle").textContent =
        "My Account";
}

function showRegisterForm() {

    $("#cdLoginForm").style.display =
        "none";

    $("#cdRegisterForm").style.display =
        "grid";

    $("#cdDashboard").classList.remove(
        "open"
    );

    $("#cdLoginTab").classList.remove(
        "active"
    );

    $("#cdRegisterTab").classList.add(
        "active"
    );

    $("#cdAuthTitle").textContent =
        "Create Account";
}

async function handleLogin(event) {

    event.preventDefault();

    const message =
        $("#cdLoginMessage");

    message.textContent =
        "Signing in...";

    try {

        const email =
            $("#cdLoginEmail").value
                .trim()
                .toLowerCase();

        const password =
            $("#cdLoginPassword").value;

        const data =
            await apiFetch(
                "/api/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        authToken =
            data.token ||
            data.session_token ||
            "";

        if (!authToken) {
            throw new Error(
                "Login succeeded but no session was returned."
            );
        }

        localStorage.setItem(
            "cd_session_token",
            authToken
        );

        customer =
            data.customer ||
            data.user ||
            null;

        message.textContent =
            "Login successful.";

        updateAccountButton();

        await loadCustomerDashboard();

    } catch (error) {

        message.textContent =
            error.message ||
            "Login failed.";

    }
}

async function handleRegister(event) {

    event.preventDefault();

    const message =
        $("#cdRegisterMessage");

    message.textContent =
        "Creating account...";

    try {

        const name =
            $("#cdRegisterName").value
                .trim();

        const email =
            $("#cdRegisterEmail").value
                .trim()
                .toLowerCase();

        const password =
            $("#cdRegisterPassword").value;

        const data =
            await apiFetch(
                "/api/auth/register",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

        authToken =
            data.token ||
            data.session_token ||
            "";

        if (authToken) {

            localStorage.setItem(
                "cd_session_token",
                authToken
            );

        }

        customer =
            data.customer ||
            data.user ||
            null;

        if (customer) {

            message.textContent =
                "Account created successfully.";

            updateAccountButton();

            await loadCustomerDashboard();

        } else {

            message.textContent =
                "Account created. Please login.";

            showLoginForm();

        }

    } catch (error) {

        message.textContent =
            error.message ||
            "Registration failed.";

    }
}


/* =========================================================
   CUSTOMER SESSION
========================================================= */

async function restoreCustomerSession() {

    if (!authToken) {

        updateAccountButton();

        return;
    }

    try {

        const data =
            await apiFetch(
                "/api/auth/me"
            );

        customer =
            data.customer ||
            data.user ||
            data ||
            null;

    } catch {

        authToken = "";

        customer = null;

        localStorage.removeItem(
            "cd_session_token"
        );
    }

    updateAccountButton();
}

function updateAccountButton() {

    const button =
        $("#cdAccountButton");

    if (!button) return;

    button.textContent =
        customer
            ? "My Account"
            : "Account";
}

async function logoutCustomer() {

    try {

        if (authToken) {

            await apiFetch(
                "/api/auth/logout",
                {
                    method: "POST"
                }
            );

        }

    } catch {}

    authToken = "";

    customer = null;

    localStorage.removeItem(
        "cd_session_token"
    );

    updateAccountButton();

    showLoginForm();

    $("#cdLoginMessage").textContent =
        "You have been logged out.";

}


/* =========================================================
   CUSTOMER DASHBOARD
========================================================= */

async function showDashboard() {

    if (!customer) {

        showLoginForm();

        return;
    }

    await loadCustomerDashboard();
}

async function loadCustomerDashboard() {

    if (!customer) return;

    $("#cdLoginForm").style.display =
        "none";

    $("#cdRegisterForm").style.display =
        "none";

    $("#cdDashboard").classList.add(
        "open"
    );

    $("#cdAuthTitle").textContent =
        "My Dashboard";

    const info =
        $("#cdAccountInfo");

    info.innerHTML = `
        <h3>
            Welcome, ${escapeHtml(
                customer.name ||
                customer.full_name ||
                "Customer"
            )}
        </h3>

        <div style="
            color:#667085;
            font-size:12px;
        ">
            ${escapeHtml(
                customer.email || ""
            )}
        </div>
    `;

    const saved =
        $("#cdSavedDeals");

    const alerts =
        $("#cdAlerts");

    saved.innerHTML =
        `<div class="cd-dashboard-empty">
            Loading saved deals...
        </div>`;

    alerts.innerHTML =
        `<div class="cd-dashboard-empty">
            Loading alerts...
        </div>`;

    try {

        const data =
            await apiFetch(
                "/api/customer/dashboard"
            );

        const watchlist =
            data.watchlist ||
            data.saved_deals ||
            [];

        const customerAlerts =
            data.alerts ||
            [];

        renderDashboardWatchlist(
            watchlist
        );

        renderDashboardAlerts(
            customerAlerts
        );

    } catch (error) {

        saved.innerHTML = `
            <div class="cd-dashboard-empty">
                Unable to load saved deals.
            </div>
        `;

        alerts.innerHTML = `
            <div class="cd-dashboard-empty">
                Unable to load alerts.
            </div>
        `;
    }
}

function renderDashboardWatchlist(items) {

    const container =
        $("#cdSavedDeals");

    if (!container) return;

    if (!items.length) {

        container.innerHTML = `
            <div class="cd-dashboard-empty">
                You have no saved deals yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        items.map(item => {

            const deal =
                item.deal ||
                item;

            const currency =
                getDealCurrency(deal);

            return `
                <div class="cd-dashboard-deal">

                    <div>
                        <div class="cd-dashboard-deal-title">
                            ${escapeHtml(
                                deal.title ||
                                "Saved Deal"
                            )}
                        </div>

                        <div class="cd-dashboard-deal-price">
                            ${formatPrice(
                                deal.new_price,
                                currency
                            )}
                        </div>
                    </div>

                    ${
                        deal.url
                            ? `
                                <a
                                    href="${escapeHtml(
                                        deal.url
                                    )}"
                                    target="_blank"
                                    rel="nofollow sponsored noopener"
                                    style="
                                        color:#155EEF;
                                        font-size:11px;
                                        font-weight:700;
                                    ">
                                    View
                                </a>
                              `
                            : ""
                    }

                </div>
            `;

        }).join("");
}

function renderDashboardAlerts(items) {

    const container =
        $("#cdAlerts");

    if (!container) return;

    if (!items.length) {

        container.innerHTML = `
            <div class="cd-dashboard-empty">
                No price alerts yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        items.map(item => {

            const deal =
                item.deal ||
                {};

            return `
                <div class="cd-dashboard-deal">

                    <div>

                        <div class="cd-dashboard-deal-title">
                            ${escapeHtml(
                                deal.title ||
                                item.title ||
                                "Price Alert"
                            )}
                        </div>

                        <div class="cd-dashboard-deal-price">
                            Target:
                            ${escapeHtml(
                                String(
                                    item.target_price ??
                                    item.targetPrice ??
                                    ""
                                )
                            )}
                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   SAVE DEAL
========================================================= */

async function saveDealForCustomer(id) {

    const deal =
        globalDeals.find(
            item =>
                String(item.id) === String(id)
        );

    if (!deal) return;

    if (!customer || !authToken) {

        openCustomerPanel();

        showLoginForm();

        $("#cdLoginMessage").textContent =
            "Please login to save deals.";

        return;
    }

    try {

        await apiFetch(
            "/api/customer/watchlist",
            {
                method: "POST",
                body: JSON.stringify({
                    deal_id: id
                })
            }
        );

        alert(
            "Deal saved to your account."
        );

        await loadCustomerDashboard();

    } catch (error) {

        alert(
            error.message ||
            "Unable to save this deal."
        );
    }
}


/* =========================================================
   SHARE
========================================================= */

async function shareDeal(id) {

    const deal =
        globalDeals.find(
            item =>
                String(item.id) === String(id)
        );

    if (!deal) return;

    const url =
        getDealUrl(deal);

    const shareData = {
        title: deal.title,
        text:
            `${deal.title} - ` +
            `You Save ${formatPrice(
                savings(
                    deal.old_price,
                    deal.new_price
                ),
                getDealCurrency(deal)
            )}`,
        url
    };

    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

            return;
        }

        await navigator.clipboard.writeText(
            url
        );

        alert(
            "Deal link copied."
        );

    } catch {

        try {

            await navigator.clipboard.writeText(
                url
            );

            alert(
                "Deal link copied."
            );

        } catch {

            alert(
                url
            );
        }
    }
}


/* =========================================================
   SAVINGS CHECKER
========================================================= */

function setupSavingsChecker() {

    const form =
        $("#refundForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const purchase =
                number(
                    $("#purchasePrice")?.value
                );

            const current =
                number(
                    $("#currentPrice")?.value
                );

            const retailer =
                $("#retailer")?.value.trim() ||
                "This retailer";

            const result =
                $("#refundResult");

            if (!result) return;

            if (
                purchase <= 0 ||
                current < 0
            ) {

                result.style.display =
                    "block";

                result.innerHTML =
                    "Please enter valid prices.";

                return;
            }

            const difference =
                purchase - current;

            if (difference > 0) {

                const percentage =
                    purchase > 0
                        ? (
                            difference /
                            purchase
                        ) * 100
                        : 0;

                result.style.display =
                    "block";

                result.innerHTML = `
                    You could save
                    <strong>
                        ${formatPrice(
                            difference,
                            "USD"
                        )}
                    </strong>
                    at ${escapeHtml(
                        retailer
                    )}
                    — approximately
                    ${percentage.toFixed(1)}%
                    lower than your purchase price.
                `;

            } else if (difference === 0) {

                result.style.display =
                    "block";

                result.innerHTML =
                    "The current price is the same as your purchase price.";

            } else {

                result.style.display =
                    "block";

                result.innerHTML = `
                    The current price is
                    ${formatPrice(
                        Math.abs(difference),
                        "USD"
                    )}
                    higher than your purchase price.
                `;
            }
        }
    );
}


/* =========================================================
   OPTIONAL PRICE ALERT BUTTON
   Can be called by future deal modal/buttons.
========================================================= */

async function createPriceAlert(
    dealId,
    targetPrice,
    currency
) {

    if (!customer || !authToken) {

        openCustomerPanel();

        showLoginForm();

        $("#cdLoginMessage").textContent =
            "Please login to create a price alert.";

        return false;
    }

    try {

        await apiFetch(
            "/api/customer/alerts",
            {
                method: "POST",
                body: JSON.stringify({
                    deal_id: dealId,
                    target_price: number(
                        targetPrice
                    ),
                    currency:
                        currency || "USD"
                })
            }
        );

        alert(
            "Price alert created successfully."
        );

        await loadCustomerDashboard();

        return true;

    } catch (error) {

        alert(
            error.message ||
            "Unable to create price alert."
        );

        return false;
    }
}


/* =========================================================
   EXPOSE USEFUL FUNCTIONS
========================================================= */

window.CheckerDiscount = {

    getDeals: () =>
        [...globalDeals],

    selectCountry,

    selectCategory: category => {

        currentCategory =
            category || "all";

        renderCategories();
        renderDeals();

    },

    openAccount:
        openCustomerPanel,

    createPriceAlert,

    formatPrice,

    calculateSavings:
        savings
};
