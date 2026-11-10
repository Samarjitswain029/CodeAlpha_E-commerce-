// Product Details Page Logic for product-detail.html

let currentProduct = null;
let currentQuantity = 1;

async function initProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const container = document.getElementById('product-detail-container');
  if (!container) return;

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">No Product Selected</h3>
        <p class="empty-desc">Please choose a product from our catalog.</p>
        <a href="index.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 4rem 0; color: var(--gray-500);">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin: 0 auto 0.75rem; display: block;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Loading product details...
    </div>
  `;

  try {
    const res = await API.getProductById(productId);
    if (res.success && res.product) {
      currentProduct = res.product;
      document.title = `${currentProduct.name} — ShopSphere`;
      renderProductDetail(currentProduct);
      setupDetailEvents();
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <h3 class="empty-title">Product Not Found</h3>
          <p class="empty-desc">The item you are looking for may have been removed or is unavailable.</p>
          <a href="index.html" class="btn btn-primary">Return to Shop</a>
        </div>
      `;
    }
  } catch (err) {
    console.error('Failed to load product details:', err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Error Loading Product</h3>
        <p class="empty-desc">Could not connect to the backend server.</p>
        <a href="index.html" class="btn btn-primary">Go to Home</a>
      </div>
    `;
  }
}

function renderProductDetail(p) {
  const container = document.getElementById('product-detail-container');

  const discountPercent = p.original_price && p.original_price > p.price
    ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
    : 0;

  const discountHtml = discountPercent > 0
    ? `<span class="detail-discount-tag">Save ${discountPercent}%</span>`
    : '';

  const origPriceHtml = p.original_price
    ? `<span class="detail-orig-price">$${p.original_price.toFixed(2)}</span>`
    : '';

  const stockBadgeHtml = p.stock > 0
    ? `<span class="stock-badge in-stock">● In Stock (${p.stock} units left)</span>`
    : `<span class="stock-badge out-of-stock">● Out of Stock</span>`;

  container.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="index.html">${p.category}</a>
      <span>/</span>
      <span style="color: var(--gray-800); font-weight: 500;">${p.name}</span>
    </nav>

    <div class="product-detail-layout">
      <!-- Image Gallery -->
      <div class="detail-gallery">
        <div class="detail-main-img-wrap">
          <img src="${p.image_url}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'" />
        </div>
      </div>

      <!-- Information & Actions -->
      <div class="detail-info">
        <div class="detail-category">${p.category}</div>
        <h1 class="detail-title">${p.name}</h1>

        <div class="detail-meta-row">
          <div class="card-rating">
            <span class="star-icon">★</span>
            <span style="font-weight: 700;">${p.rating}</span>
            <span style="color: var(--gray-500);">(${p.reviews_count} verified customer reviews)</span>
          </div>
          ${stockBadgeHtml}
        </div>

        <div class="detail-price-box">
          <div class="detail-price">$${p.price.toFixed(2)}</div>
          ${origPriceHtml}
          ${discountHtml}
        </div>

        <p class="detail-desc">${p.description}</p>

        <!-- Actions -->
        <div class="detail-actions-row">
          <div class="quantity-stepper">
            <button class="stepper-btn" id="qty-decrement" ${p.stock <= 0 ? 'disabled' : ''}>-</button>
            <input type="number" id="qty-input" class="stepper-input" value="1" min="1" max="${p.stock || 99}" readonly />
            <button class="stepper-btn" id="qty-increment" ${p.stock <= 0 ? 'disabled' : ''}>+</button>
          </div>

          <button class="btn btn-primary" id="add-to-cart-btn" style="flex: 1;" ${p.stock <= 0 ? 'disabled' : ''}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Add to Shopping Cart
          </button>

          <button class="btn btn-secondary" id="buy-now-btn" ${p.stock <= 0 ? 'disabled' : ''}>
            Buy Now
          </button>
        </div>

        <!-- Product Value Highlights -->
        <div class="product-features-list">
          <div class="feature-item">
            <span class="feature-icon">🚚</span>
            <span>Free delivery on orders over $100</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <span>Secure 256-bit encrypted checkout</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔄</span>
            <span>30-day hassle-free money-back guarantee</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🏷️</span>
            <span>100% authentic product warranty</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupDetailEvents() {
  const decBtn = document.getElementById('qty-decrement');
  const incBtn = document.getElementById('qty-increment');
  const qtyInput = document.getElementById('qty-input');
  const addBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.getElementById('buy-now-btn');

  if (decBtn && incBtn && qtyInput) {
    decBtn.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        qtyInput.value = currentQuantity;
      }
    });

    incBtn.addEventListener('click', () => {
      const maxStock = currentProduct ? currentProduct.stock : 99;
      if (currentQuantity < maxStock) {
        currentQuantity++;
        qtyInput.value = currentQuantity;
      } else {
        showToast(`Only ${maxStock} units currently available`, 'info');
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (currentProduct) {
        Cart.addItem(currentProduct, currentQuantity);
      }
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      if (currentProduct) {
        Cart.addItem(currentProduct, currentQuantity);
        window.location.href = 'checkout.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-detail-container')) {
    initProductDetail();
  }
});
