"use client";

import BookCard from "./BookCard";

type Book = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  status: "want-to-read" | "reading" | "completed";
  created_by: string;
  createdAt: string;
  updatedAt: string;
};

interface BookCardListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookCardList({
  books,
  onEdit,
  onDelete,
}: BookCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
