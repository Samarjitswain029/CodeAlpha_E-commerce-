// Cart State and Management
const CART_STORAGE_KEY = 'alphastore_cart';

const Cart = {
  getItems() {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.error('Failed to parse cart items:', e);
      return [];
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      this.updateCartBadge();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    } catch (e) {
      console.error('Failed to save cart items:', e);
    }
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex((i) => i.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
      // Cap at product stock if available
      if (product.stock && items[existingIndex].quantity > product.stock) {
        items[existingIndex].quantity = product.stock;
        showToast(`Stock limit reached for ${product.name}`, 'info');
      } else {
        showToast(`Updated quantity for ${product.name}`, 'success');
      }
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
        quantity: quantity
      });
      showToast(`Added "${product.name}" to your cart!`, 'success');
    }

    this.saveItems(items);
  },

  removeItem(productId) {
    let items = this.getItems();
    const removedItem = items.find((i) => i.id === productId);
    items = items.filter((i) => i.id !== productId);
    this.saveItems(items);
    if (removedItem) {
      showToast(`Removed "${removedItem.name}" from cart`, 'info');
    }
  },

  updateQuantity(productId, delta) {
    const items = this.getItems();
    const item = items.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    if (item.stock && item.quantity > item.stock) {
      item.quantity = item.stock;
      showToast(`Maximum available stock reached (${item.stock})`, 'info');
    }

    this.saveItems(items);
  },

  setQuantity(productId, qty) {
    const items = this.getItems();
    const item = items.find((i) => i.id === productId);
    if (!item) return;

    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }

    item.quantity = qty;
    if (item.stock && item.quantity > item.stock) {
      item.quantity = item.stock;
      showToast(`Maximum available stock is ${item.stock}`, 'info');
    }

    this.saveItems(items);
  },

  clear() {
    localStorage.removeItem(CART_STORAGE_KEY);
    this.updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
  },

  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax,
      total,
      count: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const totals = this.getTotals();
    badge.textContent = totals.count;
    if (totals.count > 0) {
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
};

// Global Toast System
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : type === 'error'
    ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
    : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  toast.innerHTML = `
    <div>${iconSvg}</div>
    <div style="flex: 1;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// Automatically update cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartBadge();
});
