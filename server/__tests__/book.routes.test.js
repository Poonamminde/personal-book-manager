const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/book.model");
const bookRoutes = require("../routes/book.routes");
const { authenticateToken } = require("../middleware/auth.middleware");

jest.mock("../middleware/auth.middleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "507f1f77bcf86cd799439011" }; // Mock user ID
    next();
  },
}));

jest.mock("../models/book.model");

describe("Book Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/books", bookRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/books/stats", () => {
    it("should return book statistics successfully", async () => {
      Book.aggregate = jest.fn().mockResolvedValue([
        { _id: "completed", count: 5 },
        { _id: "reading", count: 3 },
        { _id: "want-to-read", count: 4 },
      ]);

      const response = await request(app)
        .get("/api/books/stats")
        .expect(200);

      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("completed");
      expect(response.body).toHaveProperty("reading");
      expect(response.body).toHaveProperty("want-to-read");
      expect(response.body.total).toBe(12);
      expect(response.body.completed).toBe(5);
    });

    it("should handle errors when getting stats", async () => {
      Book.aggregate = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/books/stats")
        .expect(500);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/books", () => {
    it("should return paginated books successfully", async () => {
      const mockBooks = [
        { id: "1", title: "Book 1", author: "Author 1", status: "reading" },
        { id: "2", title: "Book 2", author: "Author 2", status: "completed" },
      ];

      Book.countDocuments = jest.fn().mockResolvedValue(10);
      Book.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockBooks),
      });

      const response = await request(app)
        .get("/api/books?page=1&limit=5")
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.books).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe("GET /api/books/:id", () => {
    it("should return a single book successfully", async () => {
      const mockBook = {
        id: "507f1f77bcf86cd799439012",
        title: "Test Book",
        author: "Test Author",
        status: "reading",
        created_by: { toString: () => "507f1f77bcf86cd799439011" },
        toJSON: jest.fn().mockReturnValue({
          id: "507f1f77bcf86cd799439012",
          title: "Test Book",
          author: "Test Author",
        }),
      };

      Book.findById = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .get("/api/books/507f1f77bcf86cd799439012")
        .expect(200);

      expect(response.body).toHaveProperty("book");
      expect(response.body.book.title).toBe("Test Book");
    });

    it("should return 404 when book not found", async () => {
      Book.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get("/api/books/507f1f77bcf86cd799439012")
        .expect(404);

      expect(response.body.message).toBe("Book not found");
    });
  });

  describe("POST /api/books", () => {
    it("should create a book successfully", async () => {
      const bookData = {
        title: "New Book",
        author: "New Author",
        tags: ["fiction", "adventure"],
        status: "want-to-read",
      };

      const mockBook = {
        id: "507f1f77bcf86cd799439013",
        ...bookData,
        created_by: "507f1f77bcf86cd799439011",
      };

      Book.create = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .post("/api/books")
        .send(bookData)
        .expect(201);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("book");
      expect(response.body.message).toBe("Book created successfully");
      expect(response.body.book.title).toBe("New Book");
    });

    it("should return 400 when title or author is missing", async () => {
      const bookData = {
        title: "",
        author: "Author",
      };

      const response = await request(app)
        .post("/api/books")
        .send(bookData)
        .expect(400);

      expect(response.body.message).toContain("required");
    });
  });

  describe("PUT /api/books/:id", () => {
    it("should update a book successfully", async () => {
      const updateData = {
        title: "Updated Book",
        status: "completed",
      };

      const mockBook = {
        id: "507f1f77bcf86cd799439012",
        title: "Original Book",
        author: "Author",
        status: "reading",
        tags: [],
        created_by: { toString: () => "507f1f77bcf86cd799439011" },
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: "507f1f77bcf86cd799439012",
          ...updateData,
        }),
      };

      Book.findById = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .put("/api/books/507f1f77bcf86cd799439012")
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Book updated successfully");
      expect(mockBook.save).toHaveBeenCalled();
    });

    it("should return 403 when user tries to update another user's book", async () => {
      const mockBook = {
        id: "507f1f77bcf86cd799439012",
        created_by: { toString: () => "507f1f77bcf86cd799439099" }, // Different user
      };

      Book.findById = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .put("/api/books/507f1f77bcf86cd799439012")
        .send({ title: "Updated" })
        .expect(403);

      expect(response.body.message).toContain("only update your own books");
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("should delete a book successfully", async () => {
      const mockBook = {
        id: "507f1f77bcf86cd799439012",
        created_by: { toString: () => "507f1f77bcf86cd799439011" },
      };

      Book.findById = jest.fn().mockResolvedValue(mockBook);
      Book.findByIdAndDelete = jest.fn().mockResolvedValue(mockBook);

      const response = await request(app)
        .delete("/api/books/507f1f77bcf86cd799439012")
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Book deleted successfully");
      expect(Book.findByIdAndDelete).toHaveBeenCalled();
    });

    it("should return 404 when book not found for deletion", async () => {
      Book.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/books/507f1f77bcf86cd799439012")
        .expect(404);

      expect(response.body.message).toBe("Book not found");
    });
  });
});
