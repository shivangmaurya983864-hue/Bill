const WHATSAPP_NUMBER = "919984824292";
let cart = JSON.parse(localStorage.getItem("cart")) || {};

function renderStore() {
    const store = document.getElementById("store-container");
    if (!store) return;
    store.innerHTML = "";

    Object.entries(inventory).forEach(([category, items], catIdx) => {
        items.forEach((item, idx) => {
            const firstSize = Object.keys(item.sizes)[0];
            const price = item.sizes[firstSize];
            const key = `${item.n} (${firstSize})`;
            const qty = cart[key]?.qty || 0;

            // Bento Grid logic: Some items are larger
            const span = (idx % 5 === 0) ? "md:col-span-6 lg:col-span-4" : "md:col-span-6 lg:col-span-4";
            
            store.innerHTML += `
                <div class="${span} cyber-card group" data-category="cat-${catIdx}">
                    <div class="flex justify-between items-start mb-6">
                        <span class="text-[10px] tracking-widest text-cyan-500 uppercase font-bold">${category.split(" ")[0]}</span>
                        <select onchange="updatePrice(${catIdx}, ${idx})" id="size-${catIdx}-${idx}" class="cyber-select">
                            ${Object.entries(item.sizes).map(([s, p]) => `<option value="${p}">${s} - ₹${p}</option>`).join("")}
                        </select>
                    </div>
                    <div class="img-box mb-8">
                        <img src="${item.img}" class="max-h-full object-contain" onerror="this.src='https://placehold.co/400x400/08080a/22d3ee?text=${item.n}'">
                    </div>
                    <h3 class="text-2xl font-bold tracking-tighter mb-4">${item.n}</h3>
                    <div class="flex items-center justify-between border-t border-white/10 pt-6">
                        <div class="flex items-center gap-4">
                            <button onclick="changeQty(${catIdx}, ${idx}, -1)" class="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-500 transition-colors">-</button>
                            <span id="qty-${catIdx}-${idx}" class="text-xl font-bold">${qty}</span>
                            <button onclick="changeQty(${catIdx}, ${idx}, 1)" class="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-white transition-colors">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
    });
    renderNav();
    updateUI();
}

function changeQty(catIdx, itemIdx, delta) {
    const cat = Object.keys(inventory)[catIdx];
    const item = inventory[cat][itemIdx];
    const sel = document.getElementById(`size-${catIdx}-${itemIdx}`);
    const size = sel.options[sel.selectedIndex].text.split(" - ")[0];
    const key = `${item.n} (${size})`;

    if (!cart[key]) cart[key] = { price: parseInt(sel.value), qty: 0, img: item.img };
    cart[key].qty += delta;
    if (cart[key].qty <= 0) delete cart[key];

    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById(`qty-${catIdx}-${itemIdx}`).innerText = cart[key]?.qty || 0;
    updateUI();
}

function updateUI() {
    const total = Object.values(cart).reduce((s, i) => s + (i.price * i.qty), 0);
    const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    
    document.getElementById("cart-total").innerText = total;
    document.getElementById("cart-count").innerText = count;
    
    const list = document.getElementById("mini-cart-items");
    list.innerHTML = "";
    Object.entries(cart).forEach(([name, data]) => {
        list.innerHTML += `
            <div class="flex gap-6 items-center bg-white/5 p-8 rounded-[30px] border border-white/5">
                <img src="${data.img}" class="w-20 h-20 object-contain">
                <div class="flex-1">
                    <h4 class="text-xl font-bold tracking-tight">${name}</h4>
                    <p class="text-cyan-500 font-bold">${data.qty} UNIT × ₹${data.price}</p>
                </div>
                <p class="text-2xl font-black">₹${data.qty * data.price}</p>
            </div>
        `;
    });
}

function toggleCart() {
    const cart = document.getElementById("mini-cart");
    cart.classList.toggle("translate-y-full");
}

function renderNav() {
    const nav = document.getElementById("cat-nav");
    if(nav.innerHTML !== "") return;
    Object.keys(inventory).forEach((cat, i) => {
        const b = document.createElement("button");
        b.className = "hud-pill";
        b.innerText = cat.toUpperCase();
        b.onclick = () => {
            document.querySelectorAll(".hud-pill").forEach(p => p.classList.remove("active"));
            b.classList.add("active");
            // Unique scroll filter logic
            const firstOfCat = document.querySelector(`[data-category="cat-${i}"]`);
            if(firstOfCat) firstOfCat.scrollIntoView({behavior: "smooth", block: "center"});
        };
        nav.appendChild(b);
    });
}

function checkout() {
    if (Object.keys(cart).length === 0) return;
    let msg = `🛸 *SHIVANG OS - INCOMING ORDER*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    Object.entries(cart).forEach(([k, v]) => msg += `► ${k} [x${v.qty}]\n`);
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💳 *TOTAL CREDIT: ₹${document.getElementById("cart-total").innerText}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
}

document.addEventListener("DOMContentLoaded", renderStore);