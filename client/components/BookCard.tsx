"use client";

import { Pencil, Trash2 } from "lucide-react";

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

const statusLabels: Record<Book["status"], string> = {
  "want-to-read": "Want to Read",
  reading: "Reading",
  completed: "Completed",
};

const statusColors: Record<Book["status"], string> = {
  "want-to-read": "bg-gray-100 text-gray-800",
  reading: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[book.status]}`}
        >
          {statusLabels[book.status]}
        </span>
      </div>

      {book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(book)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={() => onDelete(book)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
