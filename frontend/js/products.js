// Products Catalog & Landing Page Interactive Logic for index.html

let currentCategory = 'All';
let currentSearch = '';
let currentSort = '';
let searchDebounceTimer = null;

async function initCatalog() {
  await loadCategories();
  await loadProducts();
  setupEventListeners();
  initCountdownTimer();
  setupCampaignAndPromoHandlers();
}

async function loadCategories() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  try {
    const res = await API.getCategories();
    if (res.success && res.categories) {
      const categories = ['All', ...res.categories];
      container.innerHTML = categories
        .map(
          (cat) => `
          <button class="cat-pill ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
            ${cat}
          </button>
        `
        )
        .join('');

      container.querySelectorAll('.cat-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.getAttribute('data-category');
          loadProducts();
        });
      });
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const countLabel = document.getElementById('product-count-label');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--gray-500);">
      <svg class="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin: 0 auto 0.5rem; display: block;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Loading products...
    </div>
  `;

  try {
    const res = await API.getProducts({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort
    });

    if (res.success && res.products) {
      if (countLabel) {
        countLabel.textContent = `Showing ${res.products.length} product${res.products.length === 1 ? '' : 's'}`;
      }

      if (res.products.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3 class="empty-title">No products found</h3>
            <p class="empty-desc">We couldn't find any products matching your criteria. Try adjusting your search or category filter.</p>
            <button class="btn btn-outline" id="reset-filters-btn">Reset All Filters</button>
          </div>
        `;

        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            currentCategory = 'All';
            currentSearch = '';
            currentSort = '';
            const searchInput = document.getElementById('search-input');
            const sortSelect = document.getElementById('sort-select');
            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = '';
            loadCategories();
            loadProducts();
          });
        }
        return;
      }

      grid.innerHTML = res.products.map(renderProductCard).join('');

      // Attach add-to-cart handlers
      grid.querySelectorAll('.btn-add-cart').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const prodId = parseInt(btn.getAttribute('data-id'), 10);
          const product = res.products.find((p) => p.id === prodId);
          if (product) {
            Cart.addItem(product, 1);
          }
        });
      });
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Failed to load products</h3>
        <p class="empty-desc">Please make sure the backend server is running and try again.</p>
      </div>
    `;
  }
}

function renderProductCard(p) {
  const badgeClass = p.badge
    ? `badge-${p.badge.toLowerCase().replace(/\s+/g, '-')}`
    : 'badge-default';

  const badgeHtml = p.badge
    ? `<span class="card-badge ${badgeClass}">${p.badge}</span>`
    : '';

  const origPriceHtml = p.original_price
    ? `<span class="card-orig-price">$${p.original_price.toFixed(2)}</span>`
    : '';

  return `
    <article class="product-card">
      <div class="card-image-wrap">
        ${badgeHtml}
        <a href="product-detail.html?id=${p.id}">
          <img src="${p.image_url}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'" />
        </a>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3 class="card-title">
          <a href="product-detail.html?id=${p.id}">${p.name}</a>
        </h3>
        <div class="card-rating">
          <span class="star-icon">★</span>
          <span>${p.rating}</span>
          <span style="color: var(--gray-400);">(${p.reviews_count})</span>
        </div>
        <div class="card-pricing">
          <span class="card-price">$${p.price.toFixed(2)}</span>
          ${origPriceHtml}
        </div>
        <div class="card-actions">
          <button class="btn-add-cart" data-id="${p.id}">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Add to Cart
          </button>
          <a href="product-detail.html?id=${p.id}" class="btn-details" title="View details">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadProducts();
      }, 300);
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }
}

// Countdown Clock Timer for Flash Deal and Announcement Bar
function initCountdownTimer() {
  let remainingSeconds = 8 * 3600 + 45 * 60 + 22; // 8 hours, 45 mins, 22 secs

  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const topTimerEl = document.getElementById('top-timer-display');

  function updateDisplay() {
    if (remainingSeconds <= 0) {
      remainingSeconds = 24 * 3600; // Reset for next day
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formattedH = String(hours).padStart(2, '0');
    const formattedM = String(minutes).padStart(2, '0');
    const formattedS = String(seconds).padStart(2, '0');

    if (hoursEl) hoursEl.textContent = formattedH;
    if (minutesEl) minutesEl.textContent = formattedM;
    if (secondsEl) secondsEl.textContent = formattedS;
    if (topTimerEl) topTimerEl.textContent = `${formattedH}h ${formattedM}m ${formattedS}s`;

    remainingSeconds--;
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

// Promotional Advertisements & Actions Handlers
function setupCampaignAndPromoHandlers() {
  // Campaign Filter Action Buttons
  document.querySelectorAll('.btn-ad-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-filter-cat');
      if (targetCat) {
        currentCategory = targetCat;
        const container = document.getElementById('category-pills');
        if (container) {
          container.querySelectorAll('.cat-pill').forEach((pill) => {
            if (pill.getAttribute('data-category') === targetCat) {
              pill.classList.add('active');
            } else {
              pill.classList.remove('active');
            }
          });
        }
        loadProducts();

        const catalogSection = document.getElementById('catalog-section');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Hero Quick Add Button
  const heroAddBtn = document.getElementById('hero-quick-add');
  if (heroAddBtn) {
    heroAddBtn.addEventListener('click', async () => {
      const prod = {
        id: 1,
        name: 'Wireless Noise-Canceling Headphones',
        category: 'Electronics',
        price: 199.99,
        original_price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        stock: 35
      };
      Cart.addItem(prod, 1);
    });
  }

  // Claim Flash Deal Button
  const claimDealBtn = document.getElementById('claim-deal-btn');
  if (claimDealBtn) {
    claimDealBtn.addEventListener('click', () => {
      const dealItem = {
        id: 1,
        name: 'Wireless Noise-Canceling Headphones (Flash Deal)',
        category: 'Electronics',
        price: 199.99,
        original_price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        stock: 35
      };
      Cart.addItem(dealItem, 1);
      showToast('⚡ Flash Deal claimed! Added to your shopping cart.', 'success');
    });
  }

  // VIP Newsletter Subscription Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const emailVal = emailInput ? emailInput.value.trim() : '';

      if (emailVal) {
        showToast(`🎉 Welcome to the VIP Club! Use code ALPHA10 at checkout for your discount.`, 'success');
        if (emailInput) emailInput.value = '';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-grid')) {
    initCatalog();
  }
});
