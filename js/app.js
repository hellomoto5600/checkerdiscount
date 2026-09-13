/**
 * CHECKER DISCOUNT - MAIN APPLICATION CONTROLLER
 * Controls UI interaction, event bindings, and lifecycle execution.
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("[App Init] Initializing Checker Discount...");

    // UI Element References
    const menuBtn = document.getElementById("menuBtn");
    const mobileNav = document.getElementById("mobileNav");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const huntForm = document.getElementById("huntForm");

    // 1. Mobile Menu Toggle Logic
    if (menuBtn && mobileNav) {
        menuBtn.addEventListener("click", () => {
            const isVisible = mobileNav.style.display === "flex";
            mobileNav.style.display = isVisible ? "none" : "flex";
        });
    }

    // 2. Search Form Submission Handler
    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                console.log(`[Search Submitted] Query: "${query}"`);
                alert(`Search initiated for: "${query}". Stage 3 will handle full results render.`);
            }
        });
    }

    // 3. Price Hunt Demo Submission Handler
    if (huntForm) {
        huntForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const product = document.getElementById("huntProduct").value;
            const target = document.getElementById("targetPrice").value;
            const messageEl = document.getElementById("huntMessage");
            
            if (messageEl) {
                messageEl.textContent = `Price Hunt active for "${product}" at target price $${target}.`;
                messageEl.style.color = "var(--color-success)";
                messageEl.style.marginTop = "var(--space-2)";
            }
        });
    }
});
