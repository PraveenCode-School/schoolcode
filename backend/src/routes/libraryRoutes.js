const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all library routes

router.get('/books', libraryController.getBooks);
router.post('/books', libraryController.addBook);
router.put('/books/:id', libraryController.updateBook);
router.delete('/books/:id', libraryController.deleteBook);
router.post('/issue', libraryController.issueBook);
router.post('/return', libraryController.returnBook);
router.get('/transactions', libraryController.getTransactions);

router.get('/my-books', libraryController.getMyIssuedBooks);
router.get('/search', libraryController.searchBooks);
router.get('/verify-patron', libraryController.verifyPatron);
router.get('/verify-book', libraryController.verifyBook);

module.exports = router;
