const { db } = require('../config/database');

// Get all products with search, category filtering, and sorting
exports.getAllProducts = (req, res) => {
  const { category, search, sort } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search && search.trim() !== '') {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  // Sorting
  if (sort === 'price-asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price-desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC';
  } else if (sort === 'name') {
    query += ' ORDER BY name ASC';
  } else {
    query += ' ORDER BY id ASC';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    return res.json({ success: true, count: rows.length, products: rows });
  });
};

// Get single product by ID
exports.getProductById = (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, product });
  });
};

// Get list of distinct categories
exports.getCategories = (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    const categories = rows.map((r) => r.category);
    return res.json({ success: true, categories });
  });
};
