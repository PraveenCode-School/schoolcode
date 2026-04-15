const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');

// Hostel Routes
router.use(require('../middleware/authMiddleware').authenticateToken);

router.get('/', hostelController.getAllHostels);
router.post('/', hostelController.createHostel);
router.put('/:id', hostelController.updateHostel);
router.delete('/:id', hostelController.deleteHostel);

// Room Routes
router.get('/:hostelId/rooms', hostelController.getHostelRooms);
router.post('/:hostelId/rooms', hostelController.addRoom);
router.delete('/rooms/:id', hostelController.deleteRoom);

// Allocation Routes
router.post('/rooms/:roomId/allocate', hostelController.allocateRoom);
router.post('/allocations/:id/vacate', hostelController.vacateRoom);
router.get('/:hostelId/allocations', hostelController.getAllocationsByHostel);

// Finance Routes
// Finance Routes
router.get('/finance/stats', hostelController.getHostelStats);
router.post('/finance/bulk-mess-bill', hostelController.generateBulkMessBills);
router.get('/finance/pending-dues', hostelController.getPendingDues);
router.get('/my-details', hostelController.getMyHostelDetails); // Student Self-Service
router.get('/student/:admissionNo/details', hostelController.getStudentHostelDetails);
router.post('/finance/mess-bill', hostelController.addMessBill);
router.post('/finance/payment', hostelController.recordPayment);

module.exports = router;
