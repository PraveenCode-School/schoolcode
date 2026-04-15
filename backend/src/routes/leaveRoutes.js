const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getLeaves, createLeave, updateLeaveStatus, deleteLeave, getMyLeaves, applyLeave } = require('../controllers/leaveController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), getLeaves);
router.post('/', authorize('SCHOOL_ADMIN'), createLeave);

// User Routes
router.get('/my-leaves', getMyLeaves);
router.post('/my-leaves', applyLeave);

router.put('/:id', authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), updateLeaveStatus);
router.delete('/:id', authorize('SCHOOL_ADMIN'), deleteLeave);

module.exports = router;
