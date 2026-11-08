// script.js
// ---------- Product data ----------
const products = [
    { id: 1, name: "Wireless Headphones", description: "Noise cancelling, 30h battery", price: 8999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" },
    { id: 2, name: "Smart Watch", description: "Fitness tracker, AMOLED display", price: 14999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" },
    { id: 3, name: "Bluetooth Speaker", description: "Waterproof, deep bass", price: 5999, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80" },
    { id: 4, name: "Gaming Mouse", description: "RGB, 16000 DPI sensor", price: 3999, image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80" },
    { id: 5, name: "Mechanical Keyboard", description: "Cherry MX switches, backlit", price: 10999, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80" },
    { id: 6, name: "4K Webcam", description: "Auto-focus, dual microphone", price: 7999, image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80" },
    { id: 7, name: "USB-C Hub", description: "7-in-1 with 4K HDMI", price: 2999, image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80" },
    { id: 8, name: "Portable Charger", description: "20000mAh, fast charging", price: 4999, image: "https://images.unsplash.com/photo-1609592424824-9d3c6d5b1b8f?w=600&q=80" }
];

// ---------- Cart state ----------
let cart = [];

// ---------- API base (auto-detect local vs Vercel) ----------
const API_BASE =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : window.location.origin; // e.g. https://mumboelectronics.vercel.app

// ---------- DOM ----------
const productGrid = document.getElementById('productGrid');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const mpesaPhoneInput = document.getElementById('mpesaPhone');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const toggleIcon = document.getElementById('toggleIcon');

// ---------- Theme ----------
const THEME_KEY = 'mumbo-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}

function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'dark' || saved === 'light') return applyTheme(saved);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ---------- Toast ----------
let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}

// ---------- Products ----------
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" />
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-desc">${product.description}</div>
            <div class="product-price">${product.price.toLocaleString()}</div>
            <button class="btn-add" data-id="${product.id}">
                <i>🛒</i> Add to cart
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => addToCart(Number(e.currentTarget.dataset.id)));
    });
}

// ---------- Cart ops ----------
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    updateCartUI();
    showToast(`${product.name} added — KSH ${product.price.toLocaleString()}`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) removeFromCart(productId);
    else { item.quantity = newQty; updateCartUI(); }
}

function cartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `<li class="empty-cart">Your cart is empty</li>`;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <li class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-meta">KSH ${item.price.toLocaleString()} each</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn dec" data-id="${item.id}">−</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn inc" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}">✕</button>
                </div>
                <div class="cart-item-price">KSH ${(item.price * item.quantity).toLocaleString()}</div>
            </li>
        `).join('');
    }

    cartTotalEl.textContent = `KSH ${cartTotal().toLocaleString()}`;
    checkoutBtn.disabled = cart.length === 0 || checkoutBtn.dataset.busy === '1';

    document.querySelectorAll('.qty-btn.dec').forEach(btn =>
        btn.addEventListener('click', e => changeQuantity(Number(e.currentTarget.dataset.id), -1)));
    document.querySelectorAll('.qty-btn.inc').forEach(btn =>
        btn.addEventListener('click', e => changeQuantity(Number(e.currentTarget.dataset.id), 1)));
    document.querySelectorAll('.remove-item').forEach(btn =>
        btn.addEventListener('click', e => {
            removeFromCart(Number(e.currentTarget.dataset.id));
            showToast('Item removed');
        }));
}

// ---------- Phone normalization ----------
function normalizePhone(raw) {
    if (!raw) return null;
    let cleaned = String(raw).replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    if (cleaned.startsWith('7') && cleaned.length === 9) cleaned = '254' + cleaned;
    if (cleaned.startsWith('1') && cleaned.length === 9) cleaned = '254' + cleaned; // Safaricom 01…
    return /^254(7|1)\d{8}$/.test(cleaned) ? cleaned : null;
}

// ---------- STK Push API ----------
async function initiateMpesaPayment(phone, amount) {
    const res = await fetch(`${API_BASE}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: Number(amount) })
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || `Server error (${res.status})`);
    }
    return data; // { success, CheckoutRequestID, data }
}

async function pollPaymentStatus(checkoutRequestId, { timeoutMs = 90000, intervalMs = 3000 } = {}) {
    const started = Date.now();
    let lastMessage = 'Awaiting customer PIN entry…';

    while (Date.now() - started < timeoutMs) {
        try {
            const res = await fetch(`${API_BASE}/api/status/${encodeURIComponent(checkoutRequestId)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') return data;
                if (data.status === 'failed') throw new Error(data.message || 'Payment failed');
                if (data.status === 'cancelled') throw new Error(data.message || 'Payment cancelled by user');
                if (data.message) lastMessage = data.message;
            }
        } catch (err) {
            // Only rethrow business errors, ignore transient network hiccups
            if (err.message && !/fetch|network|Failed to fetch/i.test(err.message)) throw err;
        }
        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('Payment timed out — ' + lastMessage);
}

// ---------- Checkout ----------
let checkoutInProgress = false;

async function handleCheckout() {
    if (checkoutInProgress) return;
    if (cart.length === 0) return showToast('Your cart is empty');

    const phone = normalizePhone(mpesaPhoneInput.value.trim());
    if (!phone) {
        showToast('Enter a valid Kenyan M-Pesa number (e.g. 0712345678)');
        mpesaPhoneInput.focus();
        return;
    }

    const amount = cartTotal();
    if (!Number.isInteger(amount) || amount < 1) {
        return showToast('Invalid amount');
    }

    checkoutInProgress = true;
    checkoutBtn.dataset.busy = '1';
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i>⏳</i> Sending STK Push…';

    try {
        const result = await initiateMpesaPayment(phone, amount);
        const checkoutRequestId = result.CheckoutRequestID || result.data?.CheckoutRequestID;
        if (!checkoutRequestId) throw new Error('No CheckoutRequestID returned');

        showToast(`M-Pesa prompt sent to ${phone}. Enter your PIN.`);
        checkoutBtn.innerHTML = '<i>⏳</i> Waiting for confirmation…';

        const status = await pollPaymentStatus(checkoutRequestId);

        showToast(`✅ Payment received! Receipt: ${status.receipt || 'N/A'}`);
        cart = [];
        mpesaPhoneInput.value = '';
        updateCartUI();
    } catch (error) {
        console.error('Checkout error:', error);
        showToast(`❌ ${error.message}`);
    } finally {
        checkoutInProgress = false;
        checkoutBtn.dataset.busy = '0';
        checkoutBtn.innerHTML = '<i>🛒</i> Checkout with M-Pesa';
        checkoutBtn.disabled = cart.length === 0;
    }
}

// ---------- Init ----------
document.getElementById('cartIcon')?.addEventListener('click', () => {
    document.getElementById('cartPanel').scrollIntoView({ behavior: 'smooth' });
});

checkoutBtn.addEventListener('click', handleCheckout);

// Enable/disable checkout based on phone input
mpesaPhoneInput?.addEventListener('input', () => {
    if (cart.length > 0 && !checkoutInProgress) checkoutBtn.disabled = false;
});

initTheme();
renderProducts();
updateCartUI();

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
        if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    });
}