/**
 * CHECKER DISCOUNT - DEAL CALCULATION ENGINE
 * Evaluates real total price calculations (Product Price + Shipping) and identifies best deals.
 */

const DealEngine = {
    /**
     * Calculates the real total price for a store entry.
     * @param {Object} store 
     * @returns {number} Real Total Price
     */
    calculateTotalPrice(store) {
        const productPrice = Number(store.productPrice) || 0;
        const shippingPrice = Number(store.shippingPrice) || 0;
        return productPrice + shippingPrice;
    },

    /**
     * Ranks available store offers by true total cost (lowest total price first).
     * @param {Array} stores 
     * @returns {Array} Sorted stores array with computed total price.
     */
    rankStoresByBestPrice(stores) {
        if (!Array.isArray(stores)) return [];

        return stores.map(store => {
            const totalPrice = this.calculateTotalPrice(store);
            return {
                ...store,
                computedTotalPrice: totalPrice
            };
        }).sort((a, b) => a.computedTotalPrice - b.computedTotalPrice);
    }
};

console.log("[Deal Engine Loaded] Calculation logic operational.");
