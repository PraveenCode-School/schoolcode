const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/expenditures', financeController.getExpenditures);
router.post('/expenditures', financeController.addExpenditure);
router.delete('/expenditures/:id', financeController.deleteExpenditure);
router.get('/expenditures/stats', financeController.getExpenditureStats);

module.exports = router;
