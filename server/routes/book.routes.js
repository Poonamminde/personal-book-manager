const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const bookController = require("../controllers/book.controller");

// Book statistics route (must be before /:id route)
router.get("/stats", authenticateToken, bookController.getStats);

// Get all books with pagination
router.get("/", authenticateToken, bookController.getBooks);

// Get a single book by ID
router.get("/:id", authenticateToken, bookController.getBookById);

// Create a new book
router.post("/", authenticateToken, bookController.createBook);

// Update a book
router.put("/:id", authenticateToken, bookController.updateBook);

// Delete a book
router.delete("/:id", authenticateToken, bookController.deleteBook);

module.exports = router;
