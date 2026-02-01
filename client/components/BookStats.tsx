"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { BookOpen, CheckCircle, BookMarked, Clock } from "lucide-react";

type BookStats = {
  total: number;
  completed: number;
  reading: number;
  "want-to-read": number;
  "on-hold": number;
};

// Fetch book statistics
const fetchBookStats = async (): Promise<BookStats> => {
  const response = await api.get("/books/stats");
  return response.data;
};

export default function BookStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["books-stats"],
    queryFn: fetchBookStats,
  });

  const totalBooks = statsData?.total || 0;
  const completedBooks = statsData?.completed || 0;
  const readingBooks = statsData?.reading || 0;
  const wantToReadBooks = statsData?.["want-to-read"] || 0;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
    },
    {
      label: "Completed",
      value: completedBooks,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "Reading",
      value: readingBooks,
      icon: BookMarked,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Want to Read",
      value: wantToReadBooks,
      icon: Clock,
      color: "bg-gray-500",
      textColor: "text-gray-600",
    },
  ];

  return (
    <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl shadow-lg p-4 border border-gray-100 flex gap-2 hover:shadow-xl transition-shadow bg-white"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
