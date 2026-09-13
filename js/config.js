/* ==========================================================================
   CHECKER DISCOUNT - CONFIGURATION & CONSTANTS
   ========================================================================== */

const APP_CONFIG = {
  appName: "CheckerDiscount",
  currencySymbol: "$",
  defaultShippingEstimate: 4.99,
  
  // Supported Stores Setup
  stores: {
    amazon: { name: "Amazon", color: "#FF9900", trustScore: 9.8 },
    ebay: { name: "eBay", color: "#E53238", trustScore: 9.2 },
    walmart: { name: "Walmart", color: "#0071DC", trustScore: 9.5 },
    aliexpress: { name: "AliExpress", color: "#FF4747", trustScore: 8.5 }
  },

  // Deal Scoring Criteria
  dealThresholds: {
    great: 75, // Score >= 75 means Genuine High-Value Deal
    good: 50,  // Score >= 50 means Decent Savings
    fair: 30   // Score < 30 means Fake / Inflated Price
  }
};
