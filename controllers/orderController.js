const { db } = require('../config/database');

// Create new order
exports.createOrder = (req, res) => {
  const {
    items,
    customerName,
    customerEmail,
    shippingAddress,
    city,
    postalCode,
    paymentMethod
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart items are required.' });
  }

  if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
    return res.status(400).json({ success: false, message: 'All shipping details are required.' });
  }

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 100 ? 0 : 9.99;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));

  // Generate unique order number (e.g. ORD-20261110-XXXX)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${randomSuffix}`;

  const userId = req.user ? req.user.id : null;

  db.run(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_email,
      shipping_address, city, postal_code, payment_method,
      subtotal, shipping_fee, tax, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      userId,
      customerName.trim(),
      customerEmail.trim(),
      shippingAddress.trim(),
      city.trim(),
      postalCode.trim(),
      paymentMethod || 'Credit Card',
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      'Processing'
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to create order: ' + err.message });
      }

      const orderId = this.lastID;

      // Insert all order items
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item) => {
        insertItemStmt.run(
          orderId,
          item.id || item.product_id,
          item.name,
          item.price,
          item.quantity,
          item.image_url || ''
        );
      });

      insertItemStmt.finalize((stmtErr) => {
        if (stmtErr) {
          console.error('Error inserting order items:', stmtErr.message);
        }

        return res.status(201).json({
          success: true,
          message: 'Order placed successfully!',
          order: {
            id: orderId,
            orderNumber,
            totalAmount,
            status: 'Processing',
            itemsCount: items.length
          }
        });
      });
    }
  );
};

// Get orders for current user or by customer email
exports.getUserOrders = (req, res) => {
  const userId = req.user ? req.user.id : null;
  const email = req.query.email || (req.user ? req.user.email : null);

  if (!userId && !email) {
    return res.status(400).json({ success: false, message: 'User authentication or email required.' });
  }

  let query = 'SELECT * FROM orders WHERE ';
  const params = [];

  if (userId) {
    query += 'user_id = ? OR customer_email = ?';
    params.push(userId, email);
  } else {
    query += 'customer_email = ?';
    params.push(email);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }

    if (orders.length === 0) {
      return res.json({ success: true, orders: [] });
    }

    // Attach items for each order
    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    db.all(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds,
      (itemErr, items) => {
        if (itemErr) {
          return res.status(500).json({ success: false, message: 'Database error: ' + itemErr.message });
        }

        const ordersWithItems = orders.map((order) => ({
          ...order,
          items: items.filter((item) => item.order_id === order.id)
        }));

        return res.json({ success: true, orders: ordersWithItems });
      }
    );
  });
};

// Get single order by order number or id
exports.getOrderDetails = (req, res) => {
  const identifier = req.params.identifier;

  const isNumeric = /^\d+$/.test(identifier);
  const query = isNumeric
    ? 'SELECT * FROM orders WHERE id = ?'
    : 'SELECT * FROM orders WHERE order_number = ?';

  db.get(query, [identifier], (err, order) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (itemErr, items) => {
      if (itemErr) {
        return res.status(500).json({ success: false, message: 'Database error: ' + itemErr.message });
      }
      return res.json({
        success: true,
        order: {
          ...order,
          items
        }
      });
    });
  });
};
