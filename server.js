const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { seedProductsIfEmpty } = require('./data/seedProducts');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB and Seed Data
initDatabase();
setTimeout(() => {
  seedProductsIfEmpty();
}, 500);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Frontend catch-all for direct access to root
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛍️  Simple E-Commerce Store Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  console.log(`===============================================`);
});
