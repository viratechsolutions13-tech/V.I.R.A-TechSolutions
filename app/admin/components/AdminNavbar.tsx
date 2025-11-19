"use client";

import { useRouter, usePathname } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../../firebaseConfig";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  const links = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Results", path: "/admin/results" },
    { name: "Attendance", path: "/admin/attendance" },

    // ✅ NEW BUTTON ADDED HERE
    { name: "Add Trainer", path: "/admin/add-trainer" },
  ];

  async function handleLogout() {
    try {
      await signOut(auth);
      alert("✅ Logged out successfully!");
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("❌ Logout failed");
    }
  }

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.7)",
        padding: "15px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        boxShadow: "0 3px 15px rgba(11,99,208,0.3)",
      }}
    >
      <div
        onClick={() => router.push("/admin/dashboard")}
        style={{
          color: "#66b3ff",
          fontWeight: 700,
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        ⚙️ VIRA Admin Panel
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => router.push(link.path)}
            style={{
              background:
                pathname === link.path
                  ? "linear-gradient(90deg,#0b63d0,#007bff)"
                  : "transparent",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.3s",
            }}
          >
            {link.name}
          </button>
        ))}

        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,0,0,0.3)",
            border: "1px solid rgba(255,0,0,0.4)",
            color: "#ff7777",
            padding: "8px 14px",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
