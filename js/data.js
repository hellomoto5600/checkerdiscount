/**
 * CHECKER DISCOUNT - DATA LAYER
 * Contains initial schema structures and baseline dataset definitions.
 */

const DEMO_PRODUCTS = [
    {
        id: "prod-iphone-17-pro",
        title: "iPhone 17 Pro 256GB",
        category: "Electronics",
        checkedAt: "Just now",
        storesCheckedCount: 12,
        availableStores: [
            {
                storeId: "store-amazon",
                storeName: "Amazon",
                productPrice: 899.00,
                shippingPrice: 0.00,
                isFreeShipping: true,
                inStock: true,
                affiliateUrl: "https://amazon.com",
                sponsored: false
            },
            {
                storeId: "store-ebay",
                storeName: "eBay",
                productPrice: 875.00,
                shippingPrice: 40.00,
                isFreeShipping: false,
                inStock: true,
                affiliateUrl: "https://ebay.com",
                sponsored: false
            },
            {
                storeId: "store-walmart",
                storeName: "Walmart",
                productPrice: 929.00,
                shippingPrice: 0.00,
                isFreeShipping: true,
                inStock: true,
                affiliateUrl: "https://walmart.com",
                sponsored: false
            },
            {
                storeId: "store-target",
                storeName: "Target",
                productPrice: 949.00,
                shippingPrice: 0.00,
                isFreeShipping: true,
                inStock: true,
                affiliateUrl: "https://target.com",
                sponsored: false
            }
        ],
        unavailableStores: [
            { storeName: "Best Buy", reason: "Out of stock" },
            { storeName: "B&H Photo", reason: "Currently unavailable" },
            { storeName: "Adorama", reason: "Out of stock" },
            { storeName: "Newegg", reason: "Not carried" },
            { storeName: "Costco", reason: "Out of stock" },
            { storeName: "Sam's Club", reason: "Not carried" },
            { storeName: "Micro Center", reason: "In-store only" },
            { storeName: "Apple Store Direct", reason: "Out of stock" }
        ]
    }
];

console.log("[Data Layer Loaded] Baseline datasets ready.");
