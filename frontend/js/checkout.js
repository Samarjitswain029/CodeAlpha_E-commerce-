// Checkout & Order Processing Logic for checkout.html

let selectedPayment = 'Credit Card';

function initCheckout() {
  const items = Cart.getItems();
  if (items.length === 0) {
    showToast('Your cart is empty. Add items before checking out.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
    return;
  }

  renderCheckoutSummary();
  prefillUserInfo();
  setupCheckoutEvents();
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items-summary');
  const totals = Cart.getTotals();
  const items = Cart.getItems();

  if (!container) return;

  container.innerHTML = `
    <div style="max-height: 240px; overflow-y: auto; margin-bottom: 1.25rem; padding-right: 0.5rem;">
      ${items
        .map(
          (item) => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.85rem; font-size: 0.9rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <img src="${item.image_url}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'" />
            <div>
              <div style="font-weight: 600; color: var(--gray-800); max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
              <div style="color: var(--gray-500); font-size: 0.8rem;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
            </div>
          </div>
          <div style="font-weight: 700; color: var(--gray-900);">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="summary-row">
      <span>Subtotal</span>
      <span>$${totals.subtotal.toFixed(2)}</span>
    </div>

    <div class="summary-row">
      <span>Shipping</span>
      <span>${totals.shipping === 0 ? '<strong class="free-shipping-tag">FREE</strong>' : `$${totals.shipping.toFixed(2)}`}</span>
    </div>

    <div class="summary-row">
      <span>Tax (8%)</span>
      <span>$${totals.tax.toFixed(2)}</span>
    </div>

    <div class="summary-row summary-total">
      <span>Total to Pay</span>
      <span>$${totals.total.toFixed(2)}</span>
    </div>
  `;
}

function prefillUserInfo() {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    const nameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('customer-email');

    if (nameInput && !nameInput.value) nameInput.value = user.name || '';
    if (emailInput && !emailInput.value) emailInput.value = user.email || '';
  }
}

function setupCheckoutEvents() {
  // Payment Options Toggle
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        selectedPayment = radio.value;
      }
    });
  });

  // Checkout Form Submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const customerName = document.getElementById('customer-name').value.trim();
      const customerEmail = document.getElementById('customer-email').value.trim();
      const shippingAddress = document.getElementById('shipping-address').value.trim();
      const city = document.getElementById('city').value.trim();
      const postalCode = document.getElementById('postal-code').value.trim();

      if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
        showToast('Please fill out all required shipping details.', 'error');
        return;
      }

      const submitBtn = document.getElementById('place-order-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Processing Order...
        `;
      }

      try {
        const items = Cart.getItems();
        const token = Auth.getToken();

        const orderData = {
          items,
          customerName,
          customerEmail,
          shippingAddress,
          city,
          postalCode,
          paymentMethod: selectedPayment
        };

        const res = await API.createOrder(orderData, token);

        if (res.success && res.order) {
          // Clear cart
          Cart.clear();

          // Show confirmation modal
          showOrderSuccessModal(res.order);
        } else {
          showToast(res.message || 'Failed to process order.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Order';
          }
        }
      } catch (err) {
        console.error('Checkout error:', err);
        showToast('Server error while creating order. Please try again.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Complete Order';
        }
      }
    });
  }
}

function showOrderSuccessModal(order) {
  const modalOverlay = document.getElementById('order-modal-overlay');
  const modalOrderNumber = document.getElementById('modal-order-number');
  const modalOrderTotal = document.getElementById('modal-order-total');

  if (modalOverlay) {
    if (modalOrderNumber) modalOrderNumber.textContent = order.orderNumber;
    if (modalOrderTotal) modalOrderTotal.textContent = `$${order.totalAmount.toFixed(2)}`;
    modalOverlay.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-form')) {
    initCheckout();
  }
});
