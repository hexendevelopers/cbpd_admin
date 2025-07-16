"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/admin/login");
      }
    } catch (error) {
      setIsAuthenticated(false);
      router.push("/admin/login");
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}