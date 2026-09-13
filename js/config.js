/**
 * CHECKER DISCOUNT - CONFIGURATION ENGINE
 * Central system configuration for application settings, flags, and endpoints.
 */

const CONFIG = {
    APP_NAME: "CHECKER DISCOUNT",
    SLOGAN: "Is It Really a Deal?",
    VERSION: "1.0.0-stage1",
    CURRENCY: "$",
    IS_DEMO_MODE: true,
    
    // UI Settings
    ENABLE_ANIMATIONS: true,
    
    // Future API Endpoint Configuration Shells
    API_ENDPOINTS: {
        SEARCH_PRODUCTS: null,
        PRICE_HISTORY: null,
        AFFILIATE_CLICK: null
    }
};

// Freeze configuration to prevent runtime corruption
Object.freeze(CONFIG);
console.log(`[Config Loaded] ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
