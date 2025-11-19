"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    alert("🔒 Logged out successfully!");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000814",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
        }}
      >
        Checking session...
      </div>
    );
  }

  return (
    <div>
      {/* 🔹 Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 30px",
          background: "rgba(0, 0, 20, 0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h3 style={{ color: "#66b3ff" }}>🎓 V.I.R.A LMS</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#ccc", fontSize: "0.9rem" }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(90deg, #0b63d0, #007bff)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🔻 Protected Content */}
      <main>{children}</main>
    </div>
  );
}
