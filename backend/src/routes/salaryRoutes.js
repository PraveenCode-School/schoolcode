const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Get Salary Overview (Monthly calculation)
router.get('/overview', salaryController.getSalaryOverview);

// Mark Salary as Paid
router.post('/mark-paid', salaryController.markSalaryPaid);

// Get My Salary Details
router.get('/my-salary', salaryController.getMySalaryDetails);

// Get Payment History
router.get('/payment-history', salaryController.getPaymentHistory);

module.exports = router;
