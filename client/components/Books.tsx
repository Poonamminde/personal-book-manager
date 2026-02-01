"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import CreateEditBook from "./CreateEditBook";
import DeleteBookModal from "./DeleteBookModal";
import BookCardList from "./BookCardList";
import BookTableView from "./BookTableView";

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



type PaginatedBooksResponse = {
  books: Book[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBooks: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const fetchBooks = async (page: number = 1, limit: number = 5): Promise<PaginatedBooksResponse> => {
  const response = await api.get(`/books?page=${page}&limit=${limit}`);
  return response.data;
};


const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};

const BookTable: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["books", currentPage],
    queryFn: () => fetchBooks(currentPage, pageSize),
  });

  const books = data?.books || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books-stats"] });
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
      // If current page becomes empty after deletion, go to previous page
      if (books.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
  });

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (book: Book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete.id);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingBook(null);
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="md:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="md:text-2xl font-bold text-gray-800">My Books</h2>
          <button
            onClick={handleAddBook}
            className="flex cursor-pointer items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Add Book
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No books yet. Start adding books to your collection!
            </p>
          </div>
        ) : (
          <>
            {/* Card View for Small Screens */}
            <BookCardList
              books={books}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Table View for Medium and Larger Screens */}
            <BookTableView
              books={books}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalBooks > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (pagination.hasPreviousPage) {
                  setCurrentPage((prev) => prev - 1);
                }
              }}
              disabled={!pagination.hasPreviousPage}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              onClick={() => {
                if (pagination.hasNextPage) {
                  setCurrentPage((prev) => prev + 1);
                }
              }}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isCreateModalOpen && (
          <CreateEditBook editingBook={editingBook} onClose={handleCloseModal} />
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <DeleteBookModal
            book={bookToDelete}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default BookTable;
