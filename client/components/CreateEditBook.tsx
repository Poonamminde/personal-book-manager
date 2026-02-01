"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X } from "lucide-react";

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

type BookFormData = {
  title: string;
  author: string;
  tags: string;
  status: "want-to-read" | "reading" | "completed";
};

interface CreateEditBookProps {
  editingBook: Book | null;
  onClose: () => void;
}

const createBook = async (data: BookFormData): Promise<Book> => {
  const tagsArray = data.tags
    ? data.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
    : [];
  const response = await api.post("/books", {
    ...data,
    tags: tagsArray,
  });
  return response.data.book;
};

const updateBook = async ({id,data}: {
  id: string;
  data: BookFormData;
}): Promise<Book> => {
  const tagsArray = data.tags
    ? data.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
    : [];
  const response = await api.put(`/books/${id}`, {
    ...data,
    tags: tagsArray,
  });
  return response.data.book;
};

export default function CreateEditBook({
  editingBook,
  onClose,
}: CreateEditBookProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    defaultValues: {
      title: "",
      author: "",
      tags: "",
      status: "want-to-read",
    },
  });

  useEffect(() => {
    if (editingBook) {
      setValue("title", editingBook.title);
      setValue("author", editingBook.author);
      setValue("tags", editingBook.tags.join(", "));
      setValue("status", editingBook.status);
    } else {
      reset({
        title: "",
        author: "",
        tags: "",
        status: "want-to-read",
      });
    }
  }, [editingBook, setValue, reset]);

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books-stats"] });
      onClose();
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books-stats"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: BookFormData) => {
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter book title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              {...register("author", { required: "Author is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter author name"
            />
            {errors.author && (
              <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              {...register("tags")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              {...register("status", { required: "Status is required" })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingBook
                ? "Update"
                : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
