"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import CreateEditBook from "./CreateEditBook";
import DeleteBookModal from "./DeleteBookModal";
import BookCardList from "./BookCardList";
import BookTableView from "./BookTableView";
import BookFilterModal, { BookFilters } from "./BookFilterModal";

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

const fetchBooks = async (
  page: number = 1,
  limit: number = 5,
  filters: BookFilters = { title: "", author: "", tag: "", status: "" }
): Promise<PaginatedBooksResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.title) params.append("title", filters.title);
  if (filters.author) params.append("author", filters.author);
  if (filters.tag) params.append("tag", filters.tag);
  if (filters.status) params.append("status", filters.status);

  const response = await api.get(`/books?${params.toString()}`);
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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<BookFilters>({
    title: "",
    author: "",
    tag: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["books", currentPage, filters],
    queryFn: () => fetchBooks(currentPage, pageSize, filters),
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

  const handleApplyFilters = (newFilters: BookFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.title ||
      filters.author ||
      filters.tag ||
      filters.status
    );
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
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
          <h2 className="md:text-2xl font-bold text-gray-800">My Books</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                hasActiveFilters()
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Filter books"
            >
              <Filter size={18} />
              {hasActiveFilters() && (
                <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                  Active
                </span>
              )}
            </button>
            <button
              onClick={handleAddBook}
              className="flex cursor-pointer text-xs sm:text-sm items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              Add Book
            </button>
          </div>
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

        {/* Filter Modal */}
        <BookFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      </div>
    </div>
  );
};

export default BookTable;
