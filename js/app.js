const API_URL = "https://checkerdiscount-api.hamraahim32.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();

    const refundForm = document.getElementById("refundForm");
    if (refundForm) {
        refundForm.addEventListener("submit", handleRefundSubmit);
    }
});

async function fetchProducts() {
    const grid = document.getElementById("product-grid");
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        if (data.length === 0) {
            grid.innerHTML = "<p>No discounts logged yet.</p>";
            return;
        }

        grid.innerHTML = data.map(item => `
            <div class="card">
                <h3>${item.title}</h3>
                <p class="store">${item.store_name} • ${item.category || 'General'}</p>
                <p class="price">$${item.current_price} ${item.currency}</p>
            </div>
        `).join("");
    } catch (err) {
        grid.innerHTML = "<p style='color:#f85149;'>Failed to load deals from Cloudflare Worker.</p>";
    }
}

async function handleRefundSubmit(e) {
    e.preventDefault();
    const store = document.getElementById("storeName").value;
    const pPrice = parseFloat(document.getElementById("purchasePrice").value);
    const cPrice = parseFloat(document.getElementById("currentPrice").value);
    const resultDiv = document.getElementById("refundResult");

    const savings = pPrice - cPrice;

    if (savings <= 0) {
        resultDiv.style.color = "#f85149";
        resultDiv.innerText = "No price drop detected for refund.";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/refunds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                store_name: store,
                purchase_price: pPrice,
                current_price: cPrice,
                savings_amount: savings
            })
        });

        if (res.ok) {
            resultDiv.style.color = "#3fb950";
            resultDiv.innerText = `Success! Savings of $${savings.toFixed(2)} tracked in database.`;
            document.getElementById("refundForm").reset();
        }
    } catch (err) {
        resultDiv.style.color = "#f85149";
        resultDiv.innerText = "Error saving refund claim.";
    }
}
