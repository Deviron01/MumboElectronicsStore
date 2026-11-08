// script.js
// ---------- Product data (prices in KSH, images from Unsplash) ----------
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Noise cancelling, 30h battery",
        price: 8999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
    },
    {
        id: 2,
        name: "Smart Watch",
        description: "Fitness tracker, AMOLED display",
        price: 14999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        description: "Waterproof, deep bass",
        price: 5999,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"
    },
    {
        id: 4,
        name: "Gaming Mouse",
        description: "RGB, 16000 DPI sensor",
        price: 3999,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80"
    },
    {
        id: 5,
        name: "Mechanical Keyboard",
        description: "Cherry MX switches, backlit",
        price: 10999,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"
    },
    {
        id: 6,
        name: "4K Webcam",
        description: "Auto-focus, dual microphone",
        price: 7999,
        image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80"
    },
    {
        id: 7,
        name: "USB-C Hub",
        description: "7-in-1 with 4K HDMI",
        price: 2999,
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80"
    },
    {
        id: 8,
        name: "Portable Charger",
        description: "20000mAh, fast charging",
        price: 4999,
        image: "https://images.unsplash.com/photo-1609592424824-9d3c6d5b1b8f?w=600&q=80"
    }
];

// ---------- Cart state ----------
let cart = [];

// DOM
const productGrid = document.getElementById('productGrid');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const mpesaPhoneInput = document.getElementById('mpesaPhone');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const toggleIcon = document.getElementById('toggleIcon');

// ---------- Theme handling ----------
const THEME_KEY = 'mumbo-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        // localStorage may be unavailable in some contexts
    }
}

function initTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
    } catch (e) {}

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
        return;
    }

    // Fall back to system preference
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
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- Render products ----------
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
        btn.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.dataset.id);
            addToCart(id);
        });
    });
}

// ---------- Cart operations ----------
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
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
    if (newQty <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = newQty;
        updateCartUI();
    }
}

// ---------- Update cart UI ----------
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

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalEl.textContent = `KSH ${totalPrice.toLocaleString()}`;
    checkoutBtn.disabled = cart.length === 0;

    // Attach listeners
    document.querySelectorAll('.qty-btn.dec').forEach(btn => {
        btn.addEventListener('click', (e) => changeQuantity(Number(e.currentTarget.dataset.id), -1));
    });
    document.querySelectorAll('.qty-btn.inc').forEach(btn => {
        btn.addEventListener('click', (e) => changeQuantity(Number(e.currentTarget.dataset.id), 1));
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromCart(Number(e.currentTarget.dataset.id));
            showToast('Item removed');
        });
    });
}

// ---------- Validate Kenyan phone number ----------
function normalizePhone(raw) {
    let cleaned = raw.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+254')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    if (!cleaned.startsWith('254') && cleaned.length === 9) cleaned = '254' + cleaned;
    return /^254[17]\d{8}$/.test(cleaned) ? cleaned : null;
}

// ---------- Simulated M-Pesa STK Push (demo only) ----------
// In production, POST to your backend which calls the Safaricom Daraja API.
// Never expose Daraja credentials in client-side code.
function simulateMpesaPayment(phone, amount) {
    return new Promise((resolve, reject) => {
        console.log(`[M-Pesa simulation] Sending STK Push to ${phone} for KSH ${amount}`);
        showToast(`M-Pesa prompt sent to ${phone}. Enter PIN to confirm.`);

        setTimeout(() => {
            if (Math.random() < 0.9) {
                resolve({ success: true, receipt: 'SIM' + Date.now().toString().slice(-8) });
            } else {
                reject(new Error('Payment cancelled by user (simulated)'));
            }
        }, 2500);
    });
}

// ---------- Checkout handler ----------
async function handleCheckout() {
    if (cart.length === 0) return;

    const phoneRaw = mpesaPhoneInput.value.trim();
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
        showToast('Please enter a valid Kenyan M-Pesa number (e.g. 254712345678)');
        mpesaPhoneInput.focus();
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i>⏳</i> Sending STK Push...';

    try {
        const result = await simulateMpesaPayment(phone, total);
        cart = [];
        updateCartUI();
        showToast(`✅ M-Pesa payment received! Receipt: ${result.receipt} — KSH ${total.toLocaleString()} paid.`);
    } catch (err) {
        showToast(`❌ ${err.message}. Please try again.`);
    } finally {
        checkoutBtn.innerHTML = '<i>💳</i> Pay with M-Pesa';
        checkoutBtn.disabled = cart.length === 0;
    }
}

// ---------- Init ----------
document.getElementById('cartIcon').addEventListener('click', () => {
    document.getElementById('cartPanel').scrollIntoView({ behavior: 'smooth' });
});

checkoutBtn.addEventListener('click', handleCheckout);

// Run on load
initTheme();
renderProducts();
updateCartUI();

// Listen for system theme changes if user hasn't set a preference
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let saved = null;
        try {
            saved = localStorage.getItem(THEME_KEY);
        } catch (err) {}
        if (!saved) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}