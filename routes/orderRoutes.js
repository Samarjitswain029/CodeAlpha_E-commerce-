const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', optionalAuth, orderController.getUserOrders);
router.get('/:identifier', orderController.getOrderDetails);

module.exports = router;
