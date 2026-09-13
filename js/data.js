/* ==========================================================================
   CHECKER DISCOUNT - MOCK DATA ENGINE (MULTI-STORE PRODUCTS)
   ========================================================================== */

const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    basePrice: 399.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    stores: [
      { storeId: "amazon", listedPrice: 328.00, originalPrice: 399.99, shipping: 0.00, inStock: true, link: "https://amazon.com" },
      { storeId: "walmart", listedPrice: 348.00, originalPrice: 399.99, shipping: 0.00, inStock: true, link: "https://walmart.com" },
      { storeId: "ebay", listedPrice: 299.99, originalPrice: 399.99, shipping: 12.50, inStock: true, link: "https://ebay.com" }
    ]
  },
  {
    id: "prod-2",
    name: "Apple iPhone 15 Pro (128GB)",
    category: "Mobiles",
    basePrice: 999.00,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80",
    stores: [
      { storeId: "amazon", listedPrice: 949.00, originalPrice: 999.00, shipping: 0.00, inStock: true, link: "https://amazon.com" },
      { storeId: "ebay", listedPrice: 899.00, originalPrice: 999.00, shipping: 15.00, inStock: true, link: "https://ebay.com" },
      { storeId: "walmart", listedPrice: 979.00, originalPrice: 999.00, shipping: 0.00, inStock: true, link: "https://walmart.com" }
    ]
  },
  {
    id: "prod-3",
    name: "MacBook Air M2 13-inch",
    category: "Laptops",
    basePrice: 1099.00,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    stores: [
      { storeId: "amazon", listedPrice: 899.00, originalPrice: 1099.00, shipping: 0.00, inStock: true, link: "https://amazon.com" },
      { storeId: "walmart", listedPrice: 929.00, originalPrice: 1099.00, shipping: 0.00, inStock: true, link: "https://walmart.com" },
      { storeId: "aliexpress", listedPrice: 850.00, originalPrice: 1099.00, shipping: 45.00, inStock: true, link: "https://aliexpress.com" }
    ]
  }
];
