"use client";

import { useRouter, usePathname } from "next/navigation";

export default function TrainerNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    alert("👋 Logged out successfully!");
    router.push("/trainer/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/trainer/dashboard" },
    { name: "Classes", path: "/trainer/classes" },
    { name: "Attendance", path: "/trainer/attendance" },
    { name: "Exams", path: "/trainer/exams" },
    { name: "Performance", path: "/trainer/performance" },
  ];

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.3)",
        padding: "12px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "#66b3ff",
          cursor: "pointer",
        }}
        onClick={() => router.push("/trainer/dashboard")}
      >
        🧑‍🏫 Trainer Portal
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              background: "transparent",
              border: "none",
              color:
                pathname === item.path ? "#66b3ff" : "rgba(255,255,255,0.8)",
              fontWeight: pathname === item.path ? "600" : "400",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "0.2s",
            }}
          >
            {item.name}
          </button>
        ))}

        <button
          onClick={logout}
          style={{
            background: "linear-gradient(90deg,#0b63d0,#007bff)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
