const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const {
    getEnquiries,
    addEnquiry,
    updateStatus,
    convertToStudent,
    deleteEnquiry
} = require('../controllers/admissionsController');

router.use(authenticateToken);
router.use(authorize('SCHOOL_ADMIN'));

router.get('/', getEnquiries);
router.post('/', addEnquiry);
router.put('/:id/status', updateStatus);
router.post('/:id/convert', convertToStudent); // Special action
router.delete('/:id', deleteEnquiry);

module.exports = router;
