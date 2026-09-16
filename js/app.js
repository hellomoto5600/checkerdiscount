function dealCard(deal) {
    const oldPrice = Number(deal.old_price);
    const newPrice = Number(deal.new_price);
    const saving = Math.max(0, oldPrice - newPrice);
    const discount = Number(deal.discount_percent || 0);
    const imageUrl = deal.image_url ? esc(deal.image_url) : "";

    return `
      <article class="discount-card" style="display:flex;gap:16px;align-items:flex-start;background:#ffffff;border:1px solid #eaecf0;border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 2px 6px rgba(16,24,40,0.04);">
        
        ${imageUrl ? `
          <div style="flex-shrink:0;width:110px;height:110px;background:#f8f9fa;border-radius:10px;overflow:hidden;border:1px solid #eeF2f6;display:flex;align-items:center;justify-content:center;">
            <img src="${imageUrl}" alt="${esc(deal.title)}" style="max-width:100%;max-height:100%;object-fit:contain;" loading="lazy">
          </div>
        ` : ""}

        <div class="deal-content" style="flex-grow:1;width:100%;">

          <div class="deal-top-line" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:#475467;text-transform:uppercase;">${esc(deal.store)}</span>
            <span style="background:#ecfdf3;color:#027a48;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">${discount.toFixed(0)}% OFF</span>
          </div>

          <h3 class="deal-title" style="font-size:15px;font-weight:600;color:#1d2939;line-height:1.4;margin:0 0 8px 0;">
            ${esc(deal.title)}
          </h3>

          <div class="deal-price-row" style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;">
            <strong style="font-size:18px;font-weight:700;color:#101828;">${money(newPrice, deal.currency)}</strong>
            ${oldPrice > 0 ? `<del style="font-size:13px;color:#98a2b3;">${money(oldPrice, deal.currency)}</del>` : ""}
          </div>

          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px;">
            <a
              href="${esc(deal.url)}"
              target="_blank"
              rel="noopener noreferrer sponsored"
              style="background:#026aa2;color:#ffffff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;"
            >
              Get Deal →
            </a>

            <button
              class="share-deal"
              data-id="${deal.id}"
              type="button"
              style="background:#f8f9fa;color:#344054;border:1px solid #d0d5dd;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;"
            >
              📤 Share
            </button>

            <button
              class="watch-deal"
              data-title="${esc(deal.title)}"
              data-price="${newPrice}"
              type="button"
              style="background:#f8f9fa;color:#344054;border:1px solid #d0d5dd;padding:7px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;"
            >
              🔔 Watch
            </button>
          </div>

          <div style="font-size:11px;color:#98a2b3;margin-top:10px;">
            ✓ Verified ${esc(deal.last_verified_at || "")}
          </div>

        </div>
      </article>
    `;
  }
