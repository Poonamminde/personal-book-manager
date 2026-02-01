const Book = require("../models/book.model");
const mongoose = require("mongoose");

// Get book statistics
exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await Book.aggregate([
      { $match: { created_by: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      total: 0,
      completed: 0,
      reading: 0,
      "want-to-read": 0,
    };

    // Process aggregation results
    stats.forEach((stat) => {
      counts.total += stat.count;
      if (stat._id in counts) {
        counts[stat._id] = stat.count;
      }
    });

    res.json({
      total: counts.total,
      completed: counts.completed,
      reading: counts.reading,
      "want-to-read": counts["want-to-read"],
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { title, author, tag, status } = req.query;

    if (page < 1) {
      return res.status(400).json({ message: "Page must be greater than 0" });
    }
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ message: "Limit must be between 1 and 100" });
    }

    const filterQuery = { created_by: userId };

    if (title) {
      filterQuery.title = { $regex: title.trim(), $options: "i" };
    }

    if (author) {
      filterQuery.author = { $regex: author.trim(), $options: "i" };
    }

    if (tag) {
      filterQuery.tags = { $in: [new RegExp(tag.trim(), "i")] };
    }

    if (status) {
      filterQuery.status = status.trim();
    }

    const totalBooks = await Book.countDocuments(filterQuery);
    
    const books = await Book.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(totalBooks / limit);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.created_by.toString() !== userId) {
      return res.status(403).json({ message: "You don't have permission to access this book" });
    }

    res.json({ book });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, tags, status } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    const book = await Book.create({
      title,
      author,
      tags: tags || [],
      status: status || "want-to-read",
      created_by: userId,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Create book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, tags, status } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.created_by.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own books" });
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (tags !== undefined) book.tags = tags;
    if (status !== undefined) book.status = status;

    await book.save();

    res.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Update book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.created_by.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own books" });
    }

    await Book.findByIdAndDelete(id);

    res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
