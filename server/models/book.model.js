const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [1, "Author name must be at least 1 character"],
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: "Cannot have more than 10 tags",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["want-to-read", "reading", "completed"],
        message: "Status must be one of: want-to-read, reading, completed",
      },
      default: "want-to-read",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ created_by: 1 });

bookSchema.methods.toJSON = function () {
  const bookObject = this.toObject();
  bookObject.id = bookObject._id.toString();
  delete bookObject._id;
  delete bookObject.__v;
  return bookObject;
};

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);

module.exports = Book;
