"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";

export default function AuthenticatedAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
