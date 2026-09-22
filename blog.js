// CheckerDiscount - Blog System v1.0
// Works with blog.html and blog-post.html

const BLOG_API = "https://deal-api.hamraahirn32.workers.dev";

// ========== HELPERS (same as app.js) ==========
function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttribute(value) { return escapeHtml(value); }

function showToast(message) {
    const existing = document.getElementById('cd-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'cd-toast';
    toast.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] bg-navy-deep text-white px-5 py-3 rounded-xl shadow-2xl text-[13px] font-semibold transition-all duration-300 opacity-0 pointer-events-none';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(-10px)'; }, 10);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 2200);
    setTimeout(() => { toast.remove(); }, 2600);
}
window.showToast = showToast;

function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr.replace(" ", "T") + "Z");
        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return dateStr; }
}

function readingTime(content) {
    const words = String(content || "").split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
}

// ========== BLOG LIST PAGE ==========
let BLOG_STATE = {
    category: "all",
    query: "",
    posts: [],
    categories: []
};

async function loadBlogCategories() {
    try {
        const res = await fetch(`${BLOG_API}/api/blog/categories`);
        const data = await res.json();
        BLOG_STATE.categories = data.success ? data.categories : [];
    } catch (e) {
        console.warn("Categories failed:", e);
        BLOG_STATE.categories = [];
    }
}

async function loadBlogPosts() {
    const container = document.getElementById("blogListContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant">
            <span class="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
            <div class="mt-2 text-[13px]">Loading posts...</div>
        </div>`;

    try {
        const params = new URLSearchParams();
        if (BLOG_STATE.category && BLOG_STATE.category !== "all") params.set("category", BLOG_STATE.category);
        if (BLOG_STATE.query) params.set("q", BLOG_STATE.query);
        params.set("limit", "50");

        const res = await fetch(`${BLOG_API}/api/blog?${params.toString()}`);
        const data = await res.json();
        BLOG_STATE.posts = data.success && Array.isArray(data.posts) ? data.posts : [];
        renderBlogPosts();
    } catch (e) {
        console.error("Blog fetch failed:", e);
        container.innerHTML = `
            <div class="p-6 text-center bg-surface-container-lowest rounded-2xl border border-surface-container">
                <div class="text-3xl mb-2">⚠️</div>
                <div class="font-semibold text-on-surface mb-1">Could not load posts</div>
                <div class="text-[12px] text-on-surface-variant">Please try again later.</div>
            </div>`;
    }
}

function renderBlogPosts() {
    const container = document.getElementById("blogListContainer");
    if (!container) return;

    if (!BLOG_STATE.posts.length) {
        container.innerHTML = `
            <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-container">
                <span class="material-symbols-outlined text-[48px] text-outline mb-2 block">article</span>
                <div class="font-semibold text-on-surface mb-1">No posts found</div>
                <div class="text-[12px] text-on-surface-variant">Check back soon for new content.</div>
            </div>`;
        return;
    }

    container.innerHTML = BLOG_STATE.posts.map(post => {
        const img = post.cover_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800";
        const cat = post.category || "General";
        const rt = readingTime(post.excerpt || post.content || "");
        return `
        <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="cd-card block no-underline group">
            <div class="w-full h-44 rounded-2xl overflow-hidden bg-surface-subtle border border-surface-container -mb-1">
                <img src="${escapeAttribute(img)}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'"
                     alt="${escapeAttribute(post.title)}">
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <span class="material-symbols-outlined text-[12px]">label</span>
                    ${escapeHtml(cat)}
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-[13px]">schedule</span>
                    ${rt}
                </span>
            </div>
            <h3 class="text-[17px] font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                ${escapeHtml(post.title)}
            </h3>
            <p class="text-[13px] text-on-surface-variant leading-relaxed line-clamp-3">
                ${escapeHtml(post.excerpt || "Read the full article to learn more...")}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-surface-container mt-auto">
                <div class="flex items-center gap-2 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-[15px]">person</span>
                    <span class="font-semibold text-on-surface">${escapeHtml(post.author || "CheckerDiscount Team")}</span>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span class="inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">visibility</span>
                        ${post.views || 0}
                    </span>
                    <span class="inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                        ${formatDate(post.published_at)}
                    </span>
                </div>
            </div>
        </a>`;
    }).join("");
}

function renderBlogCategories() {
    const container = document.getElementById("blogCategoryFilter");
    if (!container) return;

    let html = `<button type="button" data-cat="all" class="cd-cat-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl ${BLOG_STATE.category === 'all' ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'} font-label-md text-[13px]">All</button>`;

    BLOG_STATE.categories.forEach(cat => {
        const isActive = BLOG_STATE.category === cat.category;
        html += `<button type="button" data-cat="${escapeAttribute(cat.category)}" class="cd-cat-btn flex-shrink-0 px-3.5 py-1.5 rounded-xl ${isActive ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'} font-label-md text-[13px]">${escapeHtml(cat.category)} (${cat.post_count})</button>`;
    });

    container.innerHTML = html;

    container.querySelectorAll(".cd-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            BLOG_STATE.category = btn.dataset.cat;
            renderBlogCategories();
            loadBlogPosts();
        });
    });
}

function setupBlogSearch() {
    const input = document.getElementById("blogSearchInput");
    if (!input) return;
    let timer;
    input.addEventListener("input", (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            BLOG_STATE.query = e.target.value.trim();
            loadBlogPosts();
        }, 400);
    });
}

async function initBlogList() {
    await loadBlogCategories();
    renderBlogCategories();
    setupBlogSearch();
    await loadBlogPosts();
}

// ========== BLOG POST PAGE ==========
async function loadBlogPost() {
    const container = document.getElementById("blogPostContainer");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        container.innerHTML = `<div class="p-8 text-center text-on-surface-variant"><div class="text-3xl mb-2">📄</div><div>No post specified.</div></div>`;
        return;
    }

    container.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant">
            <span class="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
            <div class="mt-2 text-[13px]">Loading article...</div>
        </div>`;

    try {
        const res = await fetch(`${BLOG_API}/api/blog/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();

        if (!data.success || !data.post) {
            container.innerHTML = `<div class="p-8 text-center"><div class="text-4xl mb-2">🔍</div><div class="font-semibold text-on-surface">Post not found</div></div>`;
            return;
        }

        const post = data.post;
        document.title = `${post.title} | CheckerDiscount Blog`;

        // SEO meta update
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", post.excerpt || post.title);

        const img = post.cover_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200";
        const cat = post.category || "General";
        const rt = readingTime(post.content);
        const tags = post.tags ? post.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

        container.innerHTML = `
            <article class="w-full">
                <!-- Hero image -->
                <div class="w-full h-56 sm:h-80 rounded-2xl overflow-hidden bg-surface-subtle border border-surface-container mb-5">
                    <img src="${escapeAttribute(img)}" 
                         class="w-full h-full object-cover"
                         onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'"
                         alt="${escapeAttribute(post.title)}">
                </div>

                <!-- Category & meta -->
                <div class="flex items-center gap-2 flex-wrap mb-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        <span class="material-symbols-outlined text-[12px]">label</span>
                        ${escapeHtml(cat)}
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <span class="material-symbols-outlined text-[13px]">schedule</span>
                        ${rt}
                    </span>
                    <span class="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <span class="material-symbols-outlined text-[13px]">visibility</span>
                        ${post.views || 0} views
                    </span>
                </div>

                <!-- Title -->
                <h1 class="text-[26px] sm:text-[34px] font-extrabold text-on-surface leading-tight tracking-tight mb-3">
                    ${escapeHtml(post.title)}
                </h1>

                <!-- Excerpt -->
                ${post.excerpt ? `<p class="text-[16px] text-on-surface-variant leading-relaxed mb-4 pb-4 border-b border-surface-container">${escapeHtml(post.excerpt)}</p>` : ""}

                <!-- Author row -->
                <div class="flex items-center gap-3 mb-6 pb-4 border-b border-surface-container">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary text-white flex items-center justify-center font-bold text-[14px]">
                        ${escapeHtml((post.author || "C")[0].toUpperCase())}
                    </div>
                    <div>
                        <div class="text-[13px] font-semibold text-on-surface">${escapeHtml(post.author || "CheckerDiscount Team")}</div>
                        <div class="text-[11px] text-on-surface-variant">${formatDate(post.published_at || post.created_at)}</div>
                    </div>
                </div>

                <!-- Content -->
                <div class="cd-blog-content text-[15px] text-on-surface leading-relaxed">
                    ${renderMarkdown(post.content)}
                </div>

                <!-- Tags -->
                ${tags.length ? `
                <div class="flex flex-wrap gap-2 mt-6 pt-4 border-t border-surface-container">
                    ${tags.map(t => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                        <span class="material-symbols-outlined text-[12px]">tag</span>${escapeHtml(t)}
                    </span>`).join("")}
                </div>` : ""}

                <!-- Share + Back -->
                <div class="flex items-center gap-2 mt-6 pt-4 border-t border-surface-container flex-wrap">
                    <a href="blog.html" class="cd-btn bg-surface-container-lowest border border-surface-container text-on-surface">
                        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>All Posts</span>
                    </a>
                    <button onclick="shareBlogPost('${encodeURIComponent(post.title)}', '${escapeAttribute(window.location.href)}')" 
                            class="cd-btn bg-primary-container text-on-primary flex-1">
                        <span class="material-symbols-outlined text-[16px]">share</span>
                        <span>Share Article</span>
                    </button>
                </div>
            </article>
        `;
    } catch (e) {
        console.error("Post load failed:", e);
        container.innerHTML = `
            <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-container">
                <div class="text-4xl mb-2">⚠️</div>
                <div class="font-semibold text-on-surface mb-1">Could not load article</div>
                <div class="text-[12px] text-on-surface-variant">Please try again.</div>
            </div>`;
    }
}

// Simple markdown-like renderer (paragraphs, bold, links, headings)
function renderMarkdown(text) {
    if (!text) return "";
    let html = escapeHtml(text);

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-[18px] font-bold text-on-surface mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-[22px] font-bold text-on-surface mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-[26px] font-bold text-on-surface mt-6 mb-3">$1</h1>');

    // Bold & italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-primary underline">$1</a>');

    // Bullet lists
    html = html.replace(/^\* (.+)$/gm, '<li class="ml-5 list-disc">$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>');

    // Line breaks → paragraphs
    const blocks = html.split(/\n\n+/);
    html = blocks.map(b => {
        if (b.match(/^<(h[1-6]|li|ul|ol)/)) return b;
        if (b.trim().startsWith("<li")) return `<ul class="my-3">${b}</ul>`;
        return `<p class="mb-4">${b.replace(/\n/g, "<br>")}</p>`;
    }).join("");

    return html;
}

function shareBlogPost(title, url) {
    const decodedTitle = decodeURIComponent(title);
    if (navigator.share) {
        navigator.share({ title: decodedTitle, url }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!')).catch(() => alert(url));
    } else { alert(url); }
}
window.shareBlogPost = shareBlogPost;

// ========== BURGER MENU (same as app.js, with Blog link added) ==========
function initBlogBurgerMenu() {
    const btn = document.getElementById("burgerMenuBtn");
    if (!btn) return;
    if (document.getElementById("customBurgerMenu")) return;

    const menuOverlay = document.createElement("div");
    menuOverlay.id = "customBurgerMenu";
    menuOverlay.className = "fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm hidden transition-opacity duration-300";

    menuOverlay.innerHTML = `
        <div class="absolute right-0 top-0 h-full w-[320px] bg-surface-container-lowest shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300">
            <div class="bg-gradient-to-br from-primary-container via-primary to-primary-dark p-5 pb-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div class="relative flex items-center justify-between">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none" class="h-11 w-auto">
                        <defs>
                            <linearGradient id="cdMenuGreen2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#70FDA7" />
                                <stop offset="100%" stop-color="#12B76A" />
                            </linearGradient>
                        </defs>
                        <g>
                            <path d="M26 4C14 4 6 8 6 8C6 24 10 42 26 56C42 42 46 24 46 8C46 8 38 4 26 4Z" fill="#FFFFFF" opacity="0.95" />
                            <path d="M18 28L23 33L34 20" stroke="url(#cdMenuGreen2)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="36" cy="14" r="4" fill="url(#cdMenuGreen2)" />
                        </g>
                        <text x="60" y="39" font-family="'Inter', system-ui" font-size="20" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">Checker<tspan font-weight="500" fill="#70FDA7">Discount</tspan></text>
                    </svg>
                    <button id="closeBurgerMenu" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white" type="button">
                        <span class="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <p class="relative text-white/80 text-[11px] mt-3 font-medium tracking-wide uppercase">Smart Shopping Made Easy</p>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
                <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-3 mt-2">Main Menu</div>
                <a href="index.html" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">home</span></span>
                    <span class="flex-1">Home</span>
                </a>
                <a href="blog.html" class="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary-container/10 text-primary font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">article</span></span>
                    <span class="flex-1">Blog</span>
                    <span class="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">NEW</span>
                </a>
                <a href="customer.html" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">person</span></span>
                    <span class="flex-1">My Account</span>
                </a>
                <a href="index.html#market-deals" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-savings-green-subtle text-savings-green flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">local_offer</span></span>
                    <span class="flex-1">Top Deals</span>
                </a>
                <a href="index.html#smart-tools" class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary-container/10 text-on-surface font-semibold text-[14px]">
                    <span class="w-9 h-9 rounded-lg bg-warning-amber/10 text-warning-amber flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">construction</span></span>
                    <span class="flex-1">Smart Tools</span>
                </a>
            </div>
            <div class="p-4 border-t border-surface-container bg-surface-container-low/50">
                <div class="flex items-center justify-center gap-2 text-[11px] text-on-surface-variant">
                    <span class="material-symbols-outlined text-savings-green text-[14px]">verified</span>
                    <span class="font-semibold">Verified Deals Worldwide</span>
                </div>
                <div class="text-center text-[10px] text-outline mt-1">© 2025 CheckerDiscount</div>
            </div>
        </div>
    `;

    document.body.appendChild(menuOverlay);
    const drawer = menuOverlay.querySelector("div > div");

    btn.addEventListener("click", () => {
        menuOverlay.classList.remove("hidden");
        setTimeout(() => drawer.classList.remove("translate-x-full"), 10);
    });

    document.getElementById("closeBurgerMenu").addEventListener("click", () => {
        drawer.classList.add("translate-x-full");
        setTimeout(() => menuOverlay.classList.add("hidden"), 300);
    });
    menuOverlay.addEventListener("click", e => {
        if (e.target === menuOverlay) {
            drawer.classList.add("translate-x-full");
            setTimeout(() => menuOverlay.classList.add("hidden"), 300);
        }
    });
}

// ========== AUTO INIT ==========
document.addEventListener("DOMContentLoaded", () => {
    initBlogBurgerMenu();
    if (document.getElementById("blogListContainer")) initBlogList();
    if (document.getElementById("blogPostContainer")) loadBlogPost();
});
