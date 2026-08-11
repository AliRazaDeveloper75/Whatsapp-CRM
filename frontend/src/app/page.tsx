"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.push(!user ? "/login" : user.role === "admin" ? "/admin" : "/agent");
  }, [user, loading, router]);

  return null;
}
