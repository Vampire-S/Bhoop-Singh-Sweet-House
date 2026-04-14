// ── Application State ──
let allProducts = [];

// ── Default images fallback ──
function getProductFallBackImg(name) {
  name = (name || '').toLowerCase();
  if (name.includes('ladoo')) return 'ladoo_motichoor_1775999772667.png';
  if (name.includes('barfi')) return 'assorted_barfi_1775999808049.png';
  if (name.includes('peda')) return 'kesar_peda_1775999790945.png';
  if (name.includes('gulab')) return 'gulab_jamun_1775999830157.png';
  if (name.includes('rasgulla')) return 'rasgulla_bowl_1775999846520.png';
  return 'gift_box_sweets_1775999865646.png';
}

// ── Load Products from DB ──
async function fetchProductsFromDb() {
  if (typeof supabaseClient === 'undefined') {
    console.error('Supabase client not loaded');
    return [];
  }
  const { data, error } = await supabaseClient.from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  allProducts = data || [];
  return allProducts;
}

// ── Preloader ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) pl.classList.add('done');
  }, 1500);
});

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Scroll-reveal (Intersection Observer) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });
}

// ── Navigation between pages ──
function goProduct(productId) {
  sessionStorage.setItem('currentProductId', productId);
  window.location.href = 'product.html?id=' + productId;
}

// ── Product Page: Load Product Data ──
async function loadProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id') || sessionStorage.getItem('currentProductId');

  if (!id) return; // Wait or show error

  const { data: p, error } = await supabaseClient.from('products').select('*').eq('id', id).single();
  if (error || !p) {
    document.querySelector('.product-hero').innerHTML = '<h2>Product not found</h2>';
    return;
  }

  const titleEl = document.getElementById('product-name');
  const descEl = document.getElementById('product-desc');
  const imgEl = document.getElementById('product-main-img');

  if (titleEl) titleEl.innerHTML = p.name.replace(/\s(\S+)$/, ' <em>$1</em>');
  if (descEl) descEl.textContent = p.description || '';

  if (imgEl) {
    imgEl.src = p.image_url || getProductFallBackImg(p.name);
    imgEl.alt = p.name;
    // ensure image doesn't break
    imgEl.onerror = () => { imgEl.src = getProductFallBackImg(p.name); };
  }

  // Eyebrow
  const eyebrowEl = document.querySelector('.product-eyebrow');
  if (eyebrowEl) eyebrowEl.textContent = p.eyebrow || p.category || '';

  // Quantity options
  const qtyContainer = document.querySelector('.quantity-options');
  if (qtyContainer && Array.isArray(p.prices) && p.prices.length > 0) {
    qtyContainer.innerHTML = '';
    p.prices.forEach((pair, i) => {
      const row = document.createElement('div');
      row.className = 'qty-row' + (i === p.prices.length - 1 ? ' selected' : '');
      row.setAttribute('onclick', `selectQty(this,'${pair.label}','${pair.price}')`);
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      const isLast = i === p.prices.length - 1;
      row.innerHTML = `<span class="qty-label">${pair.label}</span>${isLast ? '<span class="qty-badge">Best Value</span>' : ''}<span class="qty-price">₹ ${pair.price}</span>`;
      qtyContainer.appendChild(row);
    });
  } else if (qtyContainer) {
    qtyContainer.innerHTML = '<p>Price upon request</p>';
  }

  // Info cards
  const infoCards = document.querySelectorAll('.info-card p');
  if (infoCards.length >= 2) {
    infoCards[0].textContent = p.ingredients || 'Secret family recipe';
    infoCards[1].textContent = p.craft || 'Made with love and tradition.';
  }

  // Page title
  document.title = `${p.name} – Bhoop Singh Sweet House`;
}

// ── Quantity Selection ──
function selectQty(el, label, price) {
  document.querySelectorAll('.qty-row').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
}

// ── Add to Cart ──
function addToCart() {
  const btn = document.getElementById('add-cart-btn');
  if (!btn) return;
  const selectedRow = document.querySelector('.qty-row.selected');
  const qty = selectedRow ? selectedRow.querySelector('.qty-label').textContent : '500g';

  btn.textContent = '✓ Added to Cart!';
  btn.style.background = '#4caf50';
  setTimeout(() => {
    btn.innerHTML = 'Add to Cart <span class="arrow">→</span>';
    btn.style.background = '';
  }, 2200);
}

// ── WhatsApp Order ──
function orderWhatsApp() {
  const selected = document.querySelector('.qty-row.selected');
  const qty = selected ? selected.querySelector('.qty-label').textContent : '500g';
  const price = selected ? selected.querySelector('.qty-price').textContent : '';
  const name = document.getElementById('product-name')?.textContent?.replace(/\s+/g, ' ').trim() || 'Sweet';
  const msg = encodeURIComponent(`Hello Bhoop Singh Sweet House! I would like to order:\n\n🍬 *${name}*\n📦 Quantity: ${qty}\n💰 Price: ${price}\n\nPlease confirm availability and delivery options. Thank you!`);
  window.open(`https://wa.me/919840020900?text=${msg}`, '_blank');
}

// ── Similar products: click cards ──
function initSimilarCards() {
  document.querySelectorAll('.similar-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });
}

// ── Counter animation for stats ──
function animateCounters() {
  const nums = document.querySelectorAll('.stat-item .number');
  nums.forEach(el => {
    const target = parseFloat(el.textContent);
    const suffix = el.textContent.replace(/[\d.]/g, '');
    const isFloat = el.textContent.includes('.');
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    }, 16);
  });
}

// Trigger counter when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObserver.disconnect(); } });
}, { threshold: 0.5 });
if (document.querySelector('.stats-bar')) {
  statsObserver.observe(document.querySelector('.stats-bar'));
}

// ── Hero text stagger (on first visible) ──
function initHeroAnimations() {
  const heroEls = document.querySelectorAll('.hero .reveal, .hero .reveal-left, .hero .reveal-right');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 300 + i * 160);
  });
}

// ── Render Products on Home Page ──
async function renderHomeProducts() {
  await fetchProductsFromDb();

  const featuredGrid = document.querySelector('.grid-featured');
  const threeGrid = document.querySelector('.grid-three');

  if (!featuredGrid || !threeGrid) return;

  if (allProducts.length === 0) {
    featuredGrid.innerHTML = '<p class="empty-state">Products coming soon...</p>';
    threeGrid.innerHTML = '';
    return;
  }

  // Try to find the signature ladoo
  const signatureProd = allProducts.find(p => p.name.toLowerCase().includes('motichoor')) || allProducts[0];
  const sideProds = allProducts.filter(p => p.id !== signatureProd.id).slice(0, 2);
  const bottomProds = allProducts.filter(p => p.id !== signatureProd.id && !sideProds.find(s => s.id === p.id)).slice(0, 3);

  // 1. Featured Grid (1 large + 2 small)
  let featuredHTML = '';

  if (signatureProd) {
    featuredHTML += `
      <div class="card card-large reveal-left delay-1 visible" onclick="goProduct('${signatureProd.id}')" role="button" tabindex="0">
        <span class="card-label">★ Signature</span>
        <img src="${signatureProd.image_url || getProductFallBackImg(signatureProd.name)}" onerror="this.src='${getProductFallBackImg(signatureProd.name)}'" alt="${signatureProd.name}" loading="lazy" />
        <div class="card-overlay">
          <h3>${signatureProd.name}</h3>
          <p>${signatureProd.eyebrow || 'Made fresh every morning'}</p>
        </div>
        <span class="card-action">🛒</span>
      </div>`;
  }

  sideProds.forEach((p, i) => {
    featuredHTML += `
      <div class="card card-small reveal-right delay-${i + 1} visible" onclick="goProduct('${p.id}')" role="button" tabindex="0">
        <img src="${p.image_url || getProductFallBackImg(p.name)}" onerror="this.src='${getProductFallBackImg(p.name)}'" alt="${p.name}" loading="lazy" />
        <div class="card-overlay">
          <h3>${p.name}</h3>
          <p>${p.eyebrow || ''}</p>
        </div>
        <span class="card-action">🛒</span>
      </div>`;
  });
  featuredGrid.innerHTML = featuredHTML;

  // 2. Three Grid
  let threeHTML = '';
  bottomProds.forEach((p, i) => {
    threeHTML += `
      <div class="reveal visible delay-${i + 1}">
        <div class="card" onclick="goProduct('${p.id}')" role="button" tabindex="0">
          <img src="${p.image_url || getProductFallBackImg(p.name)}" onerror="this.src='${getProductFallBackImg(p.name)}'" alt="${p.name}" loading="lazy" />
        </div>
        <div class="card-info">
          <h4>${p.name}</h4>
          <p>${p.eyebrow || ''}</p>
        </div>
      </div>`;
  });
  threeGrid.innerHTML = threeHTML;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  if (document.querySelector('.product-hero')) {
    await loadProductPage();
  }

  if (document.querySelector('.grid-featured')) {
    await renderHomeProducts();
  }

  initReveal();

  if (document.querySelector('.hero')) {
    initHeroAnimations();
  }

  initSimilarCards();

  // Keyboard navigation for cards
  document.querySelectorAll('[role="button"]').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
});

// ── Mobile Navigation ──
function toggleMobileNav() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  
  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.onclick = toggleMobileNav;
    document.body.appendChild(backdrop);
  }
  
  const isOpen = navLinks.classList.toggle('open');
  if (isOpen) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}
