"use client";

import { X, AlertTriangle } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  status: "want-to-read" | "reading" | "completed" | "on-hold";
  created_by: string;
  createdAt: string;
  updatedAt: string;
};

interface DeleteBookModalProps {
  book: Book | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteBookModal({
  book,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteBookModalProps) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Delete Book</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Are you sure you want to delete this book?
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Title:</span> {book.title}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Author:</span> {book.author}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
