"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookTable from "@/components/Books";
import BookStats from "@/components/BookStats";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div>
        <div className="md:px-8">
          <BookStats />
        </div>
        <BookTable />
      </div>
    </ProtectedRoute>
  );
}
