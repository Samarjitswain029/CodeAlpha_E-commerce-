// Order History Page Logic for orders.html

async function initOrdersPage() {
  const container = document.getElementById('orders-page-content');
  if (!container) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    await fetchAndRenderOrders(Auth.getToken(), user.email);
  } else {
    // Show guest email lookup prompt
    container.innerHTML = `
      <div style="max-width: 540px; margin: 2rem auto; background: #ffffff; padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">📦</div>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--gray-900);">Track Your Orders</h2>
        <p style="color: var(--gray-600); font-size: 0.95rem; margin-bottom: 1.5rem;">
          Sign in to view your complete order history, or enter the email address used during checkout.
        </p>

        <form id="guest-lookup-form" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <input type="email" id="lookup-email" class="form-input" placeholder="Enter your checkout email" required style="flex: 1;" />
          <button type="submit" class="btn btn-primary" style="white-space: nowrap;">Find Orders</button>
        </form>

        <div style="border-top: 1px solid var(--gray-200); padding-top: 1.25rem;">
          <span style="color: var(--gray-500); font-size: 0.9rem;">Have an account?</span>
          <a href="auth.html" style="color: var(--primary); font-weight: 700; font-size: 0.9rem; margin-left: 0.35rem;">Sign In Here</a>
        </div>
      </div>
    `;

    const form = document.getElementById('guest-lookup-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('lookup-email').value.trim();
        if (email) {
          await fetchAndRenderOrders(null, email);
        }
      });
    }
  }
}

async function fetchAndRenderOrders(token, email) {
  const container = document.getElementById('orders-page-content');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 4rem 0; color: var(--gray-500);">
      <svg class="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; margin: 0 auto 0.5rem; display: block;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Loading orders...
    </div>
  `;

  try {
    const res = await API.getUserOrders(token, email);

    if (res.success && res.orders) {
      if (res.orders.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); padding: 4rem 2rem;">
            <div class="empty-icon">📦</div>
            <h2 class="empty-title">No orders found</h2>
            <p class="empty-desc">You haven't placed any orders with this account yet.</p>
            <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Start Shopping</a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="orders-list">
          ${res.orders.map(renderOrderCard).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Could not load orders</h3>
          <p class="empty-desc">${res.message || 'Please try again later.'}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Connection Error</h3>
        <p class="empty-desc">Failed to connect to backend server.</p>
      </div>
    `;
  }
}

function renderOrderCard(order) {
  const statusClass = `badge-${(order.status || 'processing').toLowerCase()}`;
  const dateFormatted = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <div class="order-item-mini">
      <img src="${item.image_url}" alt="${item.product_name}" class="order-thumb-mini" onerror="this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'" />
      <div style="flex: 1;">
        <div style="font-weight: 600; color: var(--gray-800);">${item.product_name}</div>
        <div style="font-size: 0.85rem; color: var(--gray-500);">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
      </div>
      <div style="font-weight: 700; color: var(--gray-900);">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `
    )
    .join('');

  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <span style="font-size: 0.85rem; color: var(--gray-500);">Order Number</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--gray-900);">${order.order_number}</h3>
          <span style="font-size: 0.82rem; color: var(--gray-400);">${dateFormatted}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <span class="order-badge ${statusClass}">${order.status}</span>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--gray-500);">Total Paid</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">$${order.total_amount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- Order Items List -->
      <div style="border-bottom: 1px solid var(--gray-100); padding-bottom: 1rem; margin-bottom: 1rem;">
        ${itemsHtml}
      </div>

      <!-- Shipping & Payment Details Footer -->
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; color: var(--gray-600);">
        <div>
          <strong>Shipping to:</strong> ${order.customer_name}, ${order.shipping_address}, ${order.city} (${order.postal_code})
        </div>
        <div>
          <strong>Payment Method:</strong> ${order.payment_method}
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('orders-page-content')) {
    initOrdersPage();
  }
});
