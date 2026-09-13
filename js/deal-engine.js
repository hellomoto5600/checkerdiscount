/* ==========================================================================
   CHECKER DISCOUNT - REAL TOTAL PRICE & DEAL SCORE ENGINE
   ========================================================================== */

const DealEngine = {
  // Calculate Real Total Cost (Price + Shipping)
  calculateTotalCost(listedPrice, shippingCost = 0) {
    return parseFloat((listedPrice + shippingCost).toFixed(2));
  },

  // Determine Real Discount Percentage vs Inflated Fake Discounts
  calculateRealSavings(originalPrice, totalCost) {
    if (originalPrice <= totalCost) return 0;
    const diff = originalPrice - totalCost;
    return Math.round((diff / originalPrice) * 100);
  },

  // Score the Genuine Deal Quality (0 to 100)
  evaluateDeal(product, storeOffer) {
    const totalCost = this.calculateTotalCost(storeOffer.listedPrice, storeOffer.shipping);
    const savingsPercent = this.calculateRealSavings(storeOffer.originalPrice, totalCost);
    
    let score = savingsPercent * 1.5;
    if (storeOffer.shipping === 0) score += 10; // Free shipping bonus

    // Cap Score between 0 and 100
    score = Math.min(100, Math.max(10, Math.round(score)));

    let badge = "FAIR DEAL";
    let badgeClass = "badge-fair";

    if (score >= APP_CONFIG.dealThresholds.great) {
      badge = "GENUINE GREAT DEAL";
      badgeClass = "badge-great";
    } else if (score >= APP_CONFIG.dealThresholds.good) {
      badge = "GOOD SAVINGS";
      badgeClass = "badge-good";
    }

    return {
      totalCost,
      savingsPercent,
      score,
      badge,
      badgeClass
    };
  },

  // Rank Stores from Lowest Real Price to Highest
  rankStoreOffers(stores) {
    return stores.map(store => {
      const total = this.calculateTotalCost(store.listedPrice, store.shipping);
      return { ...store, calculatedTotal: total };
    }).sort((a, b) => a.calculatedTotal - b.calculatedTotal);
  }
};
