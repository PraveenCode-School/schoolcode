const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Fee Structures
router.get('/structures', feeController.getFeeStructures);
router.post('/structures', feeController.createFeeStructure);
router.post('/student-structure', feeController.createStudentFeeStructure);
router.delete('/structures/:id', feeController.deleteFeeStructure);

// Allocations
router.get('/structures/:id/allocations', feeController.getFeeAllocations);
router.post('/structures/:id/allocations', feeController.updateFeeAllocations);

// Fee Collection
router.get('/overview', feeController.getClassSectionFullOverview); // New endpoint
router.get('/my-status', feeController.getMyFeeStatus);
router.get('/student/:student_id', feeController.getStudentFeeDetails);
router.get('/student/:student_id/history', feeController.getPaymentHistory);
router.post('/pay', feeController.recordPayment);
// Update
router.put('/structures/:id', feeController.updateFeeStructure);
router.put('/payment/:id', feeController.updateFeePayment);
router.delete('/payment/:id', feeController.deleteFeePayment);

module.exports = router;
