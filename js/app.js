const API_BASE = "https://deal-api.hamraahirn32.workers.dev";
const FEATURED_DEAL_ID = 47;

let allDeals = [];
let searchText = "";
let selectedCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
    addStyles();
    loadDeals();
    setupCalculator();
    setupMobileMenu();
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeShare();
            closeSavings();
        }
    });
});

function addStyles() {
    if (document.getElementById("cdStyles")) return;

    const s = document.createElement("style");
    s.id = "cdStyles";
    s.textContent = `
.cd-save-box{
display:inline-flex;
flex-direction:column;
justify-content:center;
padding:10px 15px;
min-width:120px;
border-radius:12px;
background:linear-gradient(135deg,#10b981,#16a34a);
color:#fff;
box-shadow:0 8px 20px rgba(16,185,129,.22)
}
.cd-save-label{font-size:11px;font-weight:600}
.cd-save-value{font-size:20px;font-weight:800;margin-top:2px}
.cd-limited{
display:inline-flex;
align-items:center;
gap:5px;
margin-top:10px;
padding:6px 10px;
border-radius:7px;
background:#fff7ed;
border:1px solid #fed7aa;
color:#c2410c;
font-size:11px;
font-weight:800
}
.cd-verified{
display:inline-flex;
align-items:center;
gap:5px;
padding:5px 9px;
border-radius:999px;
background:#ecfdf5;
border:1px solid #a7f3d0;
color:#047857;
font-size:11px;
font-weight:700
}
.cd-deal-btn{
display:inline-flex!important;
align-items:center!important;
justify-content:center!important;
gap:8px!important;
min-height:44px!important;
padding:11px 20px!important;
border:0!important;
border-radius:10px!important;
background:linear-gradient(135deg,#2563eb,#4f46e5)!important;
color:#fff!important;
font-size:14px!important;
font-weight:700!important;
text-decoration:none!important;
cursor:pointer!important;
box-shadow:0 5px 15px rgba(37,99,235,.22)!important
}
.cd-deal-btn:hover{transform:translateY(-2px)}
.cd-share-btn{
display:inline-flex!important;
align-items:center!important;
justify-content:center!important;
gap:7px!important;
min-height:44px!important;
padding:10px 17px!important;
border:1px solid #dbe3ef!important;
border-radius:10px!important;
background:#fff!important;
color:#334155!important;
font-size:14px!important;
font-weight:600!important;
cursor:pointer!important
}
.cd-tools{
display:flex;
gap:10px;
flex-wrap:wrap;
margin:0 0 20px
}
.cd-search{
flex:1 1 260px;
min-height:48px;
box-sizing:border-box;
padding:0 15px;
border:1px solid #dbe3ef;
border-radius:12px;
background:#fff;
font-size:14px;
outline:none
}
.cd-category{
flex:0 1 190px;
min-height:48px;
padding:0 14px;
border:1px solid #dbe3ef;
border-radius:12px;
background:#fff;
font-size:14px;
color:#334155
}
.cd-count{
margin:-8px 0 18px;
color:#64748b;
font-size:13px
}
.cd-featured{
position:relative;
overflow:hidden;
padding:24px;
border:1px solid #dbe3ef;
border-radius:18px;
background:#fff;
box-shadow:0 12px 35px rgba(15,23,42,.08)
}
.cd-featured-top{
display:flex;
align-items:center;
justify-content:space-between;
gap:15px;
flex-wrap:wrap
}
.cd-featured-label{
display:inline-flex;
padding:6px 10px;
border-radius:999px;
background:#eff6ff;
color:#2563eb;
font-size:11px;
font-weight:800
}
.cd-featured-title{
margin:14px 0 10px;
color:#0f172a;
font-size:25px;
line-height:1.25
}
.cd-featured-store{
color:#64748b;
font-size:14px
}
.cd-featured-price{
display:flex;
align-items:baseline;
gap:10px;
margin-top:10px
}
.cd-featured-new{
font-size:30px;
font-weight:800;
color:#0f172a
}
.cd-featured-old{
font-size:16px;
color:#94a3b8;
text-decoration:line-through
}
.cd-featured-actions{
display:flex;
gap:10px;
align-items:center;
flex-wrap:wrap;
margin-top:16px
}
.cd-featured-save{position:absolute;right:24px;bottom:24px}
.cd-modal-bg{
position:fixed;
inset:0;
z-index:999999;
display:flex;
align-items:center;
justify-content:center;
padding:20px;
background:rgba(15,23,42,.55);
backdrop-filter:blur(4px)
}
.cd-modal{
position:relative;
width:min(390px,100%);
padding:28px;
box-sizing:border-box;
border-radius:20px;
background:#fff;
text-align:center;
box-shadow:0 25px 80px rgba(0,0,0,.25)
}
.cd-close{
position:absolute;
top:12px;
right:12px;
width:34px;
height:34px;
border:0;
border-radius:50%;
background:#f1f5f9;
font-size:20px;
cursor:pointer
}
.cd-modal-icon{
width:58px;
height:58px;
margin:0 auto 12px;
display:flex;
align-items:center;
justify-content:center;
border-radius:50%;
background:#dcfce7;
color:#16a34a;
font-size:28px
}
.cd-modal-title{
margin:0;
font-size:20px;
font-weight:800;
color:#0f172a
}
.cd-modal-amount{
margin:10px 0 4px;
font-size:36px;
font-weight:900;
color:#16a34a
}
.cd-modal-percent{
color:#047857;
font-size:14px;
font-weight:800
}
.cd-modal-info{
margin-top:18px;
padding:13px;
border-radius:10px;
background:#f8fafc;
color:#64748b;
font-size:13px;
line-height:1.5
}
.cd-done{
width:100%;
margin-top:18px;
min-height:46px;
border:0;
border-radius:10px;
background:#2563eb;
color:#fff;
font-weight:700;
cursor:pointer
}
.cd-share-box{
width:min(440px,100%);
padding:24px;
box-sizing:border-box;
border-radius:18px;
background:#fff;
box-shadow:0 25px 70px rgba(0,0,0,.25)
}
.cd-share-title{
margin:0;
font-size:19px;
color:#0f172a
}
.cd-share-url{
width:100%;
box-sizing:border-box;
margin:15px 0;
padding:10px 12px;
border:1px solid #e2e8f0;
border-radius:9px;
background:#f8fafc
}
.cd-share-options{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:10px
}
.cd-share-option{
display:flex;
align-items:center;
justify-content:center;
min-height:46px;
border:1px solid #e2e8f0;
border-radius:10px;
background:#fff;
color:#334155;
font-size:14px;
font-weight:600;
text-decoration:none;
cursor:pointer
}
.cd-copy{grid-column:1/-1}
@media(max-width:700px){
.cd-featured{padding:20px}
.cd-featured-title{font-size:21px}
.cd-featured-new{font-size:26px}
.cd-featured-save{position:static;margin-top:18px;width:max-content}
}
`;
    document.head.appendChild(s);
}

async function loadDeals() {
    const box = document.getElementById("discountsContainer");
    if (!box) return;

    box.innerHTML = `<div style="text-align:center;padding:40px;color:#64748b">Loading today's verified deals...</div>`;

    try {
        const r = await fetch(`${API_BASE}/api/deals`, {
            headers: { Accept: "application/json" },
            cache: "no-store"
        });

        if (!r.ok) throw new Error(`API ${r.status}`);

        const data = await r.json();
        allDeals = Array.isArray(data.deals) ? data.deals : [];

        showFeatured();
        createFilters();
        renderDeals();
    } catch (e) {
        console.error(e);
        box.innerHTML = `
        <div style="text-align:center;padding:40px;color:#dc2626">
            <div style="font-size:38px">⚠️</div>
            <h3>Unable to load deals</h3>
            <p style="color:#64748b">Please refresh the page and try again.</p>
            <button onclick="loadDeals()" style="border:0;background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px;cursor:pointer">Try Again</button>
        </div>`;
    }
}

function showFeatured() {
    let deal = allDeals.find(d => Number(d.id) === FEATURED_DEAL_ID);
    if (!deal && allDeals.length) deal = allDeals[0];
    if (!deal) return;

    let target = findPreview();

    if (!target) {
        const box = document.getElementById("discountsContainer");
        if (!box || !box.parentNode) return;

        target = document.createElement("div");
        box.parentNode.insertBefore(target, box);
    }

    target.innerHTML = featuredHTML(deal);
    target.className = "cd-featured";
}

function findPreview() {
    const els = document.querySelectorAll("section,article,div");

    for (const el of els) {
        const t = (el.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        if (t.startsWith("DEAL PREVIEW") && t.length < 2500) {
            return el;
        }
    }

    return null;
}

function featuredHTML(deal) {
    const title = esc(deal.title || "Featured Deal");
    const store = esc(deal.store || "Store");
    const currency = esc(deal.currency || "USD");
    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);
    const saving = Math.max(oldPrice - newPrice, 0);

    let discount = Number(deal.discount_percent);

    if (!Number.isFinite(discount) && oldPrice > 0) {
        discount = (saving / oldPrice) * 100;
    }

    const url = safeUrl(deal.url);

    return `
    <div class="cd-featured-top">
        <span class="cd-featured-label">⭐ FEATURED DEAL</span>
        <span class="cd-verified">✓ VERIFIED</span>
    </div>

    <div class="cd-featured-store" style="margin-top:14px">
        Available at <strong>${store}</strong>
    </div>

    <h2 class="cd-featured-title">${title}</h2>

    <div class="cd-featured-price">
        <span class="cd-featured-new">${money(newPrice,currency)}</span>
        <span class="cd-featured-old">${money(oldPrice,currency)}</span>
    </div>

    <div style="margin-top:10px;color:#c2410c;font-size:14px;font-weight:800">
        SAVE ${money(saving,currency)} · ${discount.toFixed(2)}% OFF
    </div>

    <div class="cd-limited">🔥 LIMITED TIME OFFER</div>

    ${
        url
        ? `<div class="cd-featured-actions">
            <a class="cd-deal-btn" href="${esc(url)}" target="_blank"
            rel="nofollow sponsored noopener noreferrer">
            Check This Deal →
            </a>
        </div>`
        : ""
    }

    <div class="cd-save-box cd-featured-save">
        <span class="cd-save-label">Potential Savings</span>
        <span class="cd-save-value">${money(saving,currency)}</span>
    </div>`;
}

function createFilters() {
    const box = document.getElementById("discountsContainer");
    if (!box || !box.parentNode) return;

    const old = document.getElementById("cdTools");
    if (old) old.remove();

    const tools = document.createElement("div");
    tools.id = "cdTools";
    tools.className = "cd-tools";

    tools.innerHTML = `
    <input id="cdSearch" class="cd-search"
    type="search" placeholder="Search deals, products or stores...">

    <select id="cdCategory" class="cd-category">
        <option>All</option>
        <option>Electronics</option>
        <option>Home & Kitchen</option>
        <option>Fashion</option>
        <option>Beauty</option>
        <option>Sports</option>
        <option>Toys & Kids</option>
        <option>Automotive</option>
        <option>Other</option>
    </select>`;

    box.parentNode.insertBefore(tools, box);

    document.getElementById("cdSearch").addEventListener("input", e => {
        searchText = e.target.value.toLowerCase().trim();
        renderDeals();
    });

    document.getElementById("cdCategory").addEventListener("change", e => {
        selectedCategory = e.target.value;
        renderDeals();
    });
}

function renderDeals() {
    const box = document.getElementById("discountsContainer");
    if (!box) return;

    let deals = allDeals.filter(d => Number(d.id) !== FEATURED_DEAL_ID);

    if (searchText) {
        deals = deals.filter(d => {
            const text = `${d.title || ""} ${d.store || ""} ${d.asin || ""}`.toLowerCase();
            return text.includes(searchText);
        });
    }

    if (selectedCategory !== "All") {
        deals = deals.filter(d => category(d) === selectedCategory);
    }

    let count = document.getElementById("cdCount");

    if (!count) {
        count = document.createElement("div");
        count.id = "cdCount";
        count.className = "cd-count";
        box.parentNode.insertBefore(count, box);
    }

    count.textContent = `${deals.length} verified deal${deals.length === 1 ? "" : "s"} found`;

    if (!deals.length) {
        box.innerHTML = `
        <div style="text-align:center;padding:45px 20px;color:#64748b">
            <div style="font-size:40px">🔎</div>
            <h3 style="color:#1e293b">No deals found</h3>
            <p>Try another search or category.</p>
        </div>`;
        return;
    }

    box.innerHTML = "";
    deals.forEach(d => renderDeal(d, box));
}

function renderDeal(deal, box) {
    const title = esc(deal.title || "Untitled Product");
    const store = esc(deal.store || "Store");
    const currency = esc(deal.currency || "USD");
    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);
    const saving = Math.max(oldPrice - newPrice, 0);
    const url = safeUrl(deal.url);

    let discount = Number(deal.discount_percent);

    if (!Number.isFinite(discount) && oldPrice > 0) {
        discount = saving / oldPrice * 100;
    }

    const verified =
        String(deal.verification_status || "").toUpperCase() === "VERIFIED";

    const image = safeUrl(deal.image_url);

    const card = document.createElement("article");
    card.className = "discount-card";

    card.innerHTML = `
    ${
        image
        ? `<div class="deal-image">
            <img src="${esc(image)}" alt="${title}" loading="lazy"
            style="width:100%;height:100%;object-fit:cover"
            onerror="this.style.display='none'">
           </div>`
        : `<div class="deal-image">
            <div style="min-height:160px;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-size:42px">🛍️</div>
           </div>`
    }

    <div class="deal-card-content">

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="deal-store">${store}</div>
            <div class="deal-discount">${discount.toFixed(0)}% OFF</div>
            ${verified ? `<span class="cd-verified">✓ VERIFIED</span>` : ""}
        </div>

        <h3 class="deal-title">${title}</h3>

        <div class="deal-price-row">
            <div class="deal-price">${money(newPrice,currency)}</div>
            <div class="deal-old-price">${money(oldPrice,currency)}</div>
        </div>

        <div class="deal-savings">
            SAVE ${money(saving,currency)} · ${discount.toFixed(2)}% OFF
        </div>

        <div class="cd-limited">🔥 LIMITED TIME OFFER</div>

        <div style="margin-top:14px">
            <div class="cd-save-box">
                <span class="cd-save-label">Potential Savings</span>
                <span class="cd-save-value">${money(saving,currency)}</span>
            </div>
        </div>

        <div style="margin-top:10px;color:#64748b;font-size:13px">
            Verified deal checked by CheckerDiscount.
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px">
            ${
                url
                ? `<a class="cd-deal-btn" href="${esc(url)}" target="_blank"
                    rel="nofollow sponsored noopener noreferrer">
                    Check This Deal ↗
                   </a>`
                : `<button class="cd-deal-btn" disabled style="opacity:.5">
                    Deal Link Unavailable
                   </button>`
            }

            <button class="cd-share-btn cd-share"
                data-title="${esc(deal.title || "")}"
                data-url="${esc(url)}">
                ↗ Share
            </button>
        </div>
    </div>`;

    const share = card.querySelector(".cd-share");

    if (share) {
        share.addEventListener("click", () => {
            shareDeal(
                share.dataset.title || "CheckerDiscount Deal",
                share.dataset.url || location.href
            );
        });
    }

    box.appendChild(card);
}

function category(deal) {
    if (deal.category) return String(deal.category);

    const t = `${deal.title || ""} ${deal.store || ""}`.toLowerCase();

    if (/iphone|ipad|phone|mobile|laptop|computer|tablet|tv|headphone|earbuds|speaker|camera|monitor|keyboard|mouse|charger|usb|gaming|console/.test(t))
        return "Electronics";

    if (/mixer|blender|kitchen|cook|coffee|vacuum|home|furniture|chair|desk|pan|pot|oven|air fryer|appliance|bed|lamp/.test(t))
        return "Home & Kitchen";

    if (/shirt|shoe|shoes|dress|jeans|jacket|clothing|fashion|bag|handbag|watch|sneaker/.test(t))
        return "Fashion";

    if (/beauty|makeup|skin|skincare|hair|shampoo|perfume|cosmetic|lotion|cream/.test(t))
        return "Beauty";

    if (/sport|fitness|gym|football|soccer|basketball|tennis|running|bike|bicycle|exercise|yoga/.test(t))
        return "Sports";

    if (/toy|toys|kids|baby|children|lego|doll|game/.test(t))
        return "Toys & Kids";

    if (/car|auto|automotive|vehicle|truck|motorcycle|tire|tyre|dash cam/.test(t))
        return "Automotive";

    return "Other";
}

async function shareDeal(title, url) {
    const data = {
        title: title || "CheckerDiscount Deal",
        text: `Check this deal on CheckerDiscount: ${title || ""}`,
        url: url || location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(data);
            return;
        } catch (e) {
            if (e.name === "AbortError") return;
        }
    }

    showShare(title, url);
}

function showShare(title, url) {
    closeShare();

    const u = encodeURIComponent(url);
    const text = encodeURIComponent(`Check this deal on CheckerDiscount: ${title}`);

    const bg = document.createElement("div");
    bg.id = "cdShare";
    bg.className = "cd-modal-bg";

    bg.innerHTML = `
    <div class="cd-share-box">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h3 class="cd-share-title">Share this deal</h3>
            <button class="cd-close" data-close>×</button>
        </div>

        <input class="cd-share-url" value="${esc(url)}" readonly>

        <div class="cd-share-options">
            <a class="cd-share-option" target="_blank"
            href="https://wa.me/?text=${text}%20${u}">💬 WhatsApp</a>

            <a class="cd-share-option" target="_blank"
            href="https://www.facebook.com/sharer/sharer.php?u=${u}">f Facebook</a>

            <a class="cd-share-option" target="_blank"
            href="https://twitter.com/intent/tweet?text=${text}&url=${u}">𝕏 X</a>

            <a class="cd-share-option"
            href="mailto:?subject=${encodeURIComponent(title)}&body=${text}%0A%0A${u}">✉ Email</a>

            <button class="cd-share-option cd-copy">🔗 Copy Link</button>
        </div>
    </div>`;

    document.body.appendChild(bg);

    bg.querySelector("[data-close]").onclick = closeShare;

    bg.addEventListener("click", e => {
        if (e.target === bg) closeShare();
    });

    bg.querySelector(".cd-copy").onclick = async e => {
        const btn = e.currentTarget;

        try {
            await navigator.clipboard.writeText(url);
            btn.textContent = "✓ Link Copied!";
        } catch {
            const input = bg.querySelector(".cd-share-url");
            input.select();
            try { document.execCommand("copy"); } catch {}
            btn.textContent = "✓ Link Copied!";
        }

        setTimeout(() => {
            if (document.body.contains(btn))
                btn.textContent = "🔗 Copy Link";
        }, 1800);
    };
}

function closeShare() {
    const x = document.getElementById("cdShare");
    if (x) x.remove();
}

function setupCalculator() {
    const form = document.getElementById("refundForm");
    if (!form) return;

    const purchase = document.getElementById("purchasePrice");
    const current = document.getElementById("currentPrice");
    const retailer = document.getElementById("retailer");
    const result = document.getElementById("refundResult");

    if (!purchase || !current) return;

    form.onsubmit = e => {
        e.preventDefault();
        e.stopPropagation();

        const oldPrice = Number(String(purchase.value).replace(/[$,\s]/g,""));
        const newPrice = Number(String(current.value).replace(/[$,\s]/g,""));
        const store = retailer && retailer.value.trim()
            ? retailer.value.trim()
            : "the retailer";

        if (!Number.isFinite(oldPrice) || !Number.isFinite(newPrice) ||
            oldPrice <= 0 || newPrice < 0) {
            if (result) {
                result.style.display = "block";
                result.innerHTML = `<div style="padding:14px;border-radius:10px;background:#fff7ed;color:#c2410c">Please enter valid prices.</div>`;
            }
            return false;
        }

        if (newPrice >= oldPrice) {
            if (result) {
                result.style.display = "block";
                result.innerHTML = `<div style="padding:14px;border-radius:10px;background:#f8fafc;color:#475569">There is no saving at this price.</div>`;
            }
            return false;
        }

        const saving = oldPrice - newPrice;
        const percent = saving / oldPrice * 100;

        showSavings(store, oldPrice, newPrice, saving, percent);
        return false;
    };
}

function showSavings(store, oldPrice, newPrice, saving, percent) {
    closeSavings();

    const bg = document.createElement("div");
    bg.id = "cdSavings";
    bg.className = "cd-modal-bg";

    bg.innerHTML = `
    <div class="cd-modal">
        <button class="cd-close" data-close>×</button>

        <div class="cd-modal-icon">✓</div>

        <h3 class="cd-modal-title">Potential Savings</h3>

        <div class="cd-modal-amount">${money(saving,"USD")}</div>

        <div class="cd-modal-percent">${percent.toFixed(1)}% OFF</div>

        <div class="cd-modal-info">
            If the price dropped from
            <strong>${money(oldPrice,"USD")}</strong>
            to
            <strong>${money(newPrice,"USD")}</strong>
            at
            <strong>${esc(store)}</strong>,
            your potential saving is
            <strong>${money(saving,"USD")}</strong>.
        </div>

        <button class="cd-done" data-close>Done</button>
    </div>`;

    document.body.appendChild(bg);

    bg.addEventListener("click", e => {
        if (e.target === bg || e.target.closest("[data-close]"))
            closeSavings();
    });
}

function closeSavings() {
    const x = document.getElementById("cdSavings");
    if (x) x.remove();
}

function setupMobileMenu() {
    const btn = document.querySelector(".mobile-menu-btn");
    const menu = document.querySelector(".mobile-menu");

    if (!btn || !menu) return;

    if (btn.dataset.cdReady === "1") return;
    btn.dataset.cdReady = "1";

    btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle("active");
        btn.classList.toggle("active");
    });

    menu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            menu.classList.remove("active");
            btn.classList.remove("active");
        });
    });
}

function money(value, currency) {
    if (!Number.isFinite(Number(value))) return "—";

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            maximumFractionDigits: 2
        }).format(Number(value));
    } catch {
        return `${currency || "USD"} ${Number(value).toFixed(2)}`;
    }
}

function safeUrl(value) {
    if (!value) return "";

    try {
        const u = new URL(value);

        if (u.protocol === "http:" || u.protocol === "https:")
            return u.href;

        return "";
    } catch {
        return "";
    }
}

function esc(value) {
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

window.refreshCheckerDiscountDeals = loadDeals;
