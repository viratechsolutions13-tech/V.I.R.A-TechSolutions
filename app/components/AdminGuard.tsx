"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebaseConfig";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  const allowedEmail = "v.i.r.a.techsolutions13@gmail.com"; // your admin email

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        alert("❌ Please log in as admin to continue.");
        router.push("/admin/login");
      } else if (user.email !== allowedEmail) {
        alert("🚫 Unauthorized — only admin can access this page.");
        router.push("/");
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (checking)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#66b3ff",
          fontSize: "1.1rem",
        }}
      >
        Verifying admin access...
      </div>
    );

  return <>{children}</>;
}
