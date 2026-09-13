/* ==========================================================================
   CHECKER DISCOUNT - APP CONTROLLER & UI RENDERER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.querySelector(".search-input");
  const huntForm = document.querySelector(".hunt-form-grid");

  // Search Submit Handler
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;

      performSearch(query);
    });
  }

  // Price Hunt Form Handler
  if (huntForm) {
    huntForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const prodName = document.getElementById("prod-name").value;
      const targetPrice = document.getElementById("target-price").value;

      if (prodName && targetPrice) {
        alert(`Price Hunt Activated for "${prodName}" at $${targetPrice}! We will track real prices for you.`);
        huntForm.reset();
      }
    });
  }
});

function performSearch(query) {
  const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  renderSearchResults(results, query);
}

function renderSearchResults(products, query) {
  let resultsContainer = document.getElementById("search-results-section");

  if (!resultsContainer) {
    resultsContainer = document.createElement("section");
    resultsContainer.id = "search-results-section";
    resultsContainer.className = "container";
    resultsContainer.style.margin = "40px auto";
    const heroSection = document.querySelector(".hero-section");
    heroSection.after(resultsContainer);
  }

  if (products.length === 0) {
    resultsContainer.innerHTML = `
      <div style="background:#fff; padding:40px; text-align:center; border-radius:12px; border:1px solid #e2e8f0;">
        <h3>No products found for "${query}"</h3>
        <p style="color:#64748b; margin-top:8px;">Try searching for <strong>iPhone</strong>, <strong>Sony</strong>, or <strong>MacBook</strong>.</p>
      </div>
    `;
    return;
  }

  let html = `<h2 style="font-size:1.5rem; font-weight:800; margin-bottom:24px; color:#0f172a;">Search Results for "${query}"</h2>`;

  products.forEach(prod => {
    const sortedStores = DealEngine.rankStoreOffers(prod.stores);
    const bestOffer = sortedStores[0];
    const evaluation = DealEngine.evaluateDeal(prod, bestOffer);

    html += `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin-bottom:24px; display:flex; gap:24px; flex-wrap:wrap; align-items:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <img src="${prod.image}" alt="${prod.name}" style="width:120px; height:120px; object-fit:cover; border-radius:12px;">
        <div style="flex:1; min-width:250px;">
          <span style="background:#eff6ff; color:#2563eb; font-weight:700; font-size:0.75rem; padding:4px 8px; border-radius:6px; text-transform:uppercase;">${evaluation.badge}</span>
          <h3 style="font-size:1.2rem; font-weight:700; margin:8px 0 4px; color:#0f172a;">${prod.name}</h3>
          <p style="color:#64748b; font-size:0.9rem;">Lowest Real Price across stores (incl. shipping)</p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.75rem; font-weight:800; color:#2563eb;">$${evaluation.totalCost}</div>
          <div style="font-size:0.85rem; color:#64748b; text-decoration:line-through;">Original: $${prod.basePrice}</div>
          <a href="${bestOffer.link}" target="_blank" style="display:inline-block; margin-top:10px; background:#2563eb; color:#fff; text-decoration:none; padding:10px 20px; font-weight:700; border-radius:8px; font-size:0.9rem;">View Deal (${APP_CONFIG.stores[bestOffer.storeId].name})</a>
        </div>
      </div>
    `;
  });

  resultsContainer.innerHTML = html;
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}
// ==========================================
// PRICE HUNT FUNCTIONALITY
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const huntBtn = document.querySelector(".price-hunt-section button");
  const inputs = document.querySelectorAll(".price-hunt-section input");

  if (huntBtn) {
    huntBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const productName = inputs[0]?.value.trim();
      const targetPrice = inputs[1]?.value.trim();

      if (!productName || !targetPrice) {
        alert("Please enter both product name and target price.");
        return;
      }

      // Save Alert to LocalStorage
      const huntAlert = {
        product: productName,
        targetPrice: parseFloat(targetPrice),
        date: new Date().toLocaleDateString()
      };

      let existingHunts = JSON.parse(localStorage.getItem("checker_hunts") || "[]");
      existingHunts.push(huntAlert);
      localStorage.setItem("checker_hunts", JSON.stringify(existingHunts));

      // Visual Confirmation Message
      alert(`Price Hunt set! We will track "${productName}" and alert you when the price hits $${targetPrice}.`);
      
      // Clear inputs
      inputs[0].value = "";
      inputs[1].value = "";
    });
  }
});
