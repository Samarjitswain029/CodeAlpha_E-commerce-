// Shopping Cart Page Logic for cart.html

let appliedPromo = null;

function renderCartPage() {
  const container = document.getElementById('cart-page-content');
  if (!container) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); padding: 4rem 2rem;">
        <div class="empty-icon">🛒</div>
        <h2 class="empty-title">Your shopping cart is empty</h2>
        <p class="empty-desc">Explore our top picks and discover amazing deals waiting for you.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Explore Catalog
        </a>
      </div>
    `;
    return;
  }

  const totals = Cart.getTotals();
  let discountAmount = 0;
  if (appliedPromo === 'ALPHA10') {
    discountAmount = Number((totals.subtotal * 0.1).toFixed(2));
  }
  const finalTotal = Math.max(0, Number((totals.total - discountAmount).toFixed(2)));

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Cart Items Section -->
      <div class="cart-table-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200);">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--gray-900);">
            Your Items (${totals.count})
          </h3>
          <button class="btn btn-danger-outline btn-sm" id="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div class="cart-items-list">
          ${items.map(renderCartItemRow).join('')}
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="summary-card">
        <h3 class="summary-title">Order Summary</h3>

        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${totals.subtotal.toFixed(2)}</span>
        </div>

        <div class="summary-row">
          <span>Estimated Shipping</span>
          <span>${totals.shipping === 0 ? '<strong class="free-shipping-tag">FREE</strong>' : `$${totals.shipping.toFixed(2)}`}</span>
        </div>

        <div class="summary-row">
          <span>Estimated Sales Tax (8%)</span>
          <span>$${totals.tax.toFixed(2)}</span>
        </div>

        ${
          appliedPromo
            ? `
            <div class="summary-row" style="color: var(--success); font-weight: 600;">
              <span>Promo Discount (${appliedPromo})</span>
              <span>-$${discountAmount.toFixed(2)}</span>
            </div>
          `
            : ''
        }

        <div class="summary-row summary-total">
          <span>Estimated Total</span>
          <span>$${finalTotal.toFixed(2)}</span>
        </div>

        <!-- Promo Code Input -->
        <div style="margin: 1.5rem 0 1.25rem;">
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="promo-input" class="form-input" placeholder="Promo code (e.g. ALPHA10)" value="${appliedPromo || ''}" style="text-transform: uppercase;" />
            <button class="btn btn-outline" id="apply-promo-btn" style="white-space: nowrap;">Apply</button>
          </div>
          ${appliedPromo ? '<div style="font-size: 0.8rem; color: var(--success); margin-top: 0.4rem;">Promo code ALPHA10 applied! (10% off)</div>' : ''}
        </div>

        <a href="checkout.html" class="btn btn-primary btn-block" style="padding: 0.9rem; font-size: 1rem;">
          Proceed to Checkout
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>

        <a href="index.html" class="btn btn-outline btn-block" style="margin-top: 0.75rem;">
          Continue Shopping
        </a>
      </div>
    </div>
  `;

  attachCartPageEvents();
}

function renderCartItemRow(item) {
  const lineTotal = (item.price * item.quantity).toFixed(2);

  return `
    <div class="cart-item-row" data-id="${item.id}">
      <img src="${item.image_url}" alt="${item.name}" class="cart-thumb" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'" />

      <div class="cart-item-info">
        <h4><a href="product-detail.html?id=${item.id}">${item.name}</a></h4>
        <p>$${item.price.toFixed(2)} each</p>
      </div>

      <div class="quantity-stepper">
        <button class="stepper-btn qty-minus" data-id="${item.id}">-</button>
        <span class="stepper-input" style="display: flex; align-items: center; justify-content: center;">${item.quantity}</span>
        <button class="stepper-btn qty-plus" data-id="${item.id}">+</button>
      </div>

      <div class="cart-item-price">
        $${lineTotal}
      </div>

      <button class="btn-remove-item" data-id="${item.id}" title="Remove item">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>
  `;
}

function attachCartPageEvents() {
  // Steppers
  document.querySelectorAll('.qty-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      Cart.updateQuantity(id, -1);
      renderCartPage();
    });
  });

  document.querySelectorAll('.qty-plus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      Cart.updateQuantity(id, 1);
      renderCartPage();
    });
  });

  // Remove
  document.querySelectorAll('.btn-remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      Cart.removeItem(id);
      renderCartPage();
    });
  });

  // Clear
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to empty your cart?')) {
        Cart.clear();
        renderCartPage();
      }
    });
  }

  // Promo code
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('promo-input');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'ALPHA10') {
        appliedPromo = 'ALPHA10';
        showToast('Promo code ALPHA10 applied! 10% discount', 'success');
        renderCartPage();
      } else if (!code) {
        appliedPromo = null;
        renderCartPage();
      } else {
        showToast('Invalid promo code. Try "ALPHA10"', 'error');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-page-content')) {
    renderCartPage();
  }
});

window.addEventListener('cartUpdated', () => {
  if (document.getElementById('cart-page-content')) {
    renderCartPage();
  }
});
