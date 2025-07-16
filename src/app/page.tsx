"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { userAgentFromString } from "next/server";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/admin/login");
  }, []);

  return <div className="">
    
  </div>;
}
