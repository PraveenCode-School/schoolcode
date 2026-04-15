const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Student Route
router.get('/my-certificates', certificateController.getMyCertificates);

// Admin/Teacher Route
router.post('/issue', authorize('SCHOOL_ADMIN', 'TEACHER'), certificateController.issueCertificate);

module.exports = router;
