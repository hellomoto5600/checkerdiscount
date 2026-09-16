 const API_BASE = "https://deal-api.hamraahirn32.workers.dev";
  const $ = id => document.getElementById(id);
  let allDeals = [];
  let watchlist = JSON.parse(localStorage.getItem("cd_watchlist_v9") || "[]");

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = (n,c="USD") => { const x=Number(n); if(!Number.isFinite(x)) return "—"; try{return new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:2}).format(x)}catch{return `${c} ${x.toFixed(2)}`;} };
  const save = () => localStorage.setItem("cd_watchlist_v9", JSON.stringify(watchlist));
  async function get(path){const r=await fetch(API_BASE+path,{headers:{Accept:"application/json"}});const j=await r.json();if(!r.ok)throw Error(j.error||"Request failed");return j;}

  function dealCard(d){
    const saveAmt=Math.max(0,Number(d.old_price)-Number(d.new_price));
    return `<article class="discount-card"><div class="deal-content" style="width:100%"><div class="deal-top-line"><span>${esc(d.store)}</span><span>${Number(d.discount_percent||0).toFixed(0)}% OFF</span></div><h3 class="deal-title">${esc(d.title)}</h3><div class="deal-price-row"><strong>${money(d.new_price,d.currency)}</strong>${Number(d.old_price)>0?`<del>${money(d.old_price,d.currency)}</del>`:""}</div><div class="deal-save">SAVE ${money(saveAmt,d.currency)} · ${Number(d.discount_percent||0).toFixed(2)}% OFF</div><div class="floating-saving" style="position:static;display:inline-block;margin-top:12px"><small>Potential Savings</small><strong>${money(saveAmt,d.currency)}</strong></div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px"><a class="preview-button" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer sponsored">Check This Deal →</a><button class="share-deal" data-id="${d.id}">Share</button><button class="watch-deal" data-title="${esc(d.title)}" data-price="${d.new_price}">♡ Watch</button></div><p style="font-size:11px;color:#667085;margin-top:10px">✓ Verified ${esc(d.last_verified_at||"")}</p></div></article>`;
  }

  function renderDeals(){
    const box=$("discountsContainer"); if(!box)return;
    const featured=allDeals.find(d=>Number(d.is_featured)===1);
    const regular=allDeals.filter(d=>Number(d.is_featured)!==1);
    let html="";
    if(featured) html += `<div class="featured-v9" style="border:2px solid #12B76A;background:#F7FFF9;border-radius:16px;padding:18px;margin-bottom:18px"><div style="font-size:11px;font-weight:800;color:#087443;letter-spacing:.5px">⭐ FEATURED VERIFIED DEAL</div>${dealCard(featured)}</div>`;
    html += regular.length ? regular.map(dealCard).join("") : `<div class="tool-empty">No additional verified deals yet.</div>`;
    box.innerHTML=html;
    box.querySelectorAll(".share-deal").forEach(b=>b.onclick=()=>shareDeal(Number(b.dataset.id)));
    box.querySelectorAll(".watch-deal").forEach(b=>b.onclick=()=>addWatch(b.dataset.title,Number(b.dataset.price)));
  }

  async function loadDeals(){
    try{const j=await get("/api/deals");allDeals=Array.isArray(j.deals)?j.deals:[];renderDeals();updateWatchlist();}
    catch(e){const box=$("discountsContainer");if(box)box.innerHTML=`<div class="tool-empty">Deals could not be loaded right now. Please try again.</div>`;}
  }

  async function shareDeal(id){
    const d=allDeals.find(x=>Number(x.id)===id);if(!d)return;
    const data={title:d.title,text:`${d.title} — ${money(d.new_price,d.currency)} at ${d.store}`,url:d.url};
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(d.url);alert("Deal link copied.");}}catch(e){}
  }

  function compare(query){
    const q=query.toLowerCase(); const matches=allDeals.filter(d=>(d.title||"").toLowerCase().includes(q)||(d.store||"").toLowerCase().includes(q)||(d.asin||"").toLowerCase()===q);
    const out=$("compareResult");
    if(!matches.length){out.innerHTML=`<div class="tool-empty">No matching verified offers found yet. Try a shorter product name.</div>`;return;}
    const best=Math.min(...matches.map(d=>Number(d.new_price)));
    out.innerHTML=`<table class="compare-table"><tr><th>Store</th><th>Current</th><th>Discount</th><th></th></tr>${matches.sort((a,b)=>a.new_price-b.new_price).map(d=>`<tr><td>${esc(d.store)}${Number(d.new_price)===best?` <span class="compare-best">BEST</span>`:""}</td><td>${money(d.new_price,d.currency)}</td><td>${Number(d.discount_percent||0).toFixed(0)}%</td><td><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer sponsored">Check →</a></td></tr>`).join("")}</table><div class="tool-note">${matches.length} verified offer(s) matched your search.</div>`;
  }

  async function priceHistory(query){
    const d=allDeals.find(x=>(x.title||"").toLowerCase().includes(query.toLowerCase())||(x.asin||"").toLowerCase()===query.toLowerCase());
    const out=$("historyResult"); if(!d){out.innerHTML=`<div class="tool-empty">No verified product matched that search.</div>`;return;}
    try{const j=await get(`/api/deals/${d.id}/history`);const h=j.history||[];if(!h.length){out.innerHTML=`<div class="tool-empty">No recorded history yet. Re-verify this deal from Admin Panel to create the first snapshot.</div>`;return;}out.innerHTML=`<div class="history-list">${h.slice(-12).reverse().map(x=>`<div class="history-row"><span>${esc(x.checked_at)}</span><strong>${money(x.price,d.currency)}</strong></div>`).join("")}</div><div class="tool-note">Latest recorded price: ${money(h[h.length-1].price,d.currency)}.</div>`}catch(e){out.innerHTML=`<div class="tool-empty">Price history is temporarily unavailable.</div>`;}
  }

  async function coupons(){
    const store=$("couponStore").value.trim(),q=$("couponQuery").value.trim(); const out=$("couponResult");
    if(!store&&!q){out.innerHTML=`<div class="tool-empty">Enter a store or keyword.</div>`;return;}
    try{const p=new URLSearchParams();if(store)p.set("store",store);if(q)p.set("q",q);const j=await get(`/api/coupons?${p}`);const c=j.coupons||[];if(!c.length){out.innerHTML=`<div class="tool-empty">No verified coupons found for this search.</div>`;return;}out.innerHTML=c.map(x=>`<div class="coupon-card"><strong>${esc(x.title)}</strong><div style="margin:7px 0">${x.code?`<span class="coupon-code">${esc(x.code)}</span>`:""} ${esc(x.discount_text||"")}</div><div style="font-size:12px;color:#667085">${esc(x.description||"")}</div>${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">View offer →</a>`:""}</div>`).join("");}catch(e){out.innerHTML=`<div class="tool-empty">Coupon checker is temporarily unavailable.</div>`;}
  }

  function finalPrice(){const p=Number($("fpPrice").value)||0,c=Number($("fpCoupon").value)||0,s=Number($("fpShipping").value)||0,t=Number($("fpTax").value)||0;const total=Math.max(0,p-c)+s+t;$("finalPriceResult").innerHTML=`<div style="background:var(--green-soft);border:1px solid #b7ebce;border-radius:12px;padding:16px"><small style="color:var(--green-dark)">ESTIMATED FINAL COST</small><div style="font-size:30px;font-weight:800;color:var(--green-dark)">${money(total)}</div><div style="font-size:12px;color:#667085">${money(p)} price − ${money(c)} coupon + ${money(s)} shipping + ${money(t)} tax</div></div>`;}

  function addWatch(title,target){if(!title||!Number.isFinite(target)||target<=0)return;if(!watchlist.some(x=>x.title.toLowerCase()===title.toLowerCase()))watchlist.push({title,target,createdAt:new Date().toISOString()});save();updateWatchlist();}
  function updateWatchlist(){const out=$("watchResult");if(!out)return;if(!watchlist.length){out.innerHTML=`<div class="tool-empty">Your watchlist is empty.</div>`;return;}out.innerHTML=`<div class="watch-list">${watchlist.map((x,i)=>{const d=allDeals.find(y=>(y.title||"").toLowerCase().includes(x.title.toLowerCase())||(x.title.toLowerCase().includes((y.title||"").toLowerCase())));const price=d?Number(d.new_price):null;const hit=price!==null&&price<=Number(x.target);return `<div class="watch-item"><div><strong>${esc(x.title)}</strong><div style="font-size:12px;color:#667085">Target: ${money(x.target)} ${price!==null?`· Current: ${money(price,d.currency)} ${hit?"· 🔔 Target reached":""}`:"· Waiting for a matching verified deal"}</div></div><button data-remove-watch="${i}">Remove</button></div>`}).join("")}</div>`;out.querySelectorAll("[data-remove-watch]").forEach(b=>b.onclick=()=>{watchlist.splice(Number(b.dataset.removeWatch),1);save();updateWatchlist();});}

  function setup(){
    $("compareForm")?.addEventListener("submit",e=>{e.preventDefault();compare($("compareQuery").value.trim());});
    $("historyForm")?.addEventListener("submit",e=>{e.preventDefault();priceHistory($("historyQuery").value.trim());});
    $("couponForm")?.addEventListener("submit",e=>{e.preventDefault();coupons();});
    $("finalPriceForm")?.addEventListener("submit",e=>{e.preventDefault();finalPrice();});
    $("watchForm")?.addEventListener("submit",e=>{e.preventDefault();addWatch($("watchProduct").value.trim(),Number($("watchTarget").value));e.target.reset();});
    document.querySelectorAll("[data-tool-tab]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-tool-tab]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");const name=btn.dataset.toolTab;document.querySelectorAll("[data-tool-panel]").forEach(p=>p.style.display=p.dataset.toolPanel===name?"block":"none");}));
    document.querySelectorAll("[data-tool-panel]").forEach((p,i)=>{p.style.display=i===0?"block":"none";});
    updateWatchlist();
  }
  document.addEventListener("DOMContentLoaded",()=>{setup();loadDeals();});
  window.refreshCheckerDiscountDeals=loadDeals;
})();
