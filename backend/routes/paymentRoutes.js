const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/checkout', paymentController.renderCheckout);

// Students routes
router.post('/create-order', auth(['Student']), paymentController.createOrder);
router.post('/verify', auth(['Student']), paymentController.verifyPayment);
router.get('/history', auth(['Student', 'Admin']), paymentController.getPaymentHistory);
router.get('/receipt/:paymentId', auth(['Student', 'Admin']), paymentController.downloadReceipt);

// Admin-only routes
// router.get('/admin/all', auth(['Admin']), paymentController.getAllPayments); // We just use /history
// router.post('/admin/refund', auth(['Admin']), paymentController.refundPayment); // Future

// Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
