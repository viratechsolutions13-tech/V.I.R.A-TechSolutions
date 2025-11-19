"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "active_students", u.uid));
      if (snap.exists()) {
        setHasAccess(true);
      } else {
        router.push("/student/payment");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!hasAccess) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #000814, #001f3f, #0b63d0)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        padding: "60px 20px",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: 10 }}>
        Welcome, {user?.email}
      </h1>
      <p style={{ textAlign: "center", opacity: 0.8 }}>
        Access your learning dashboard below
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        {[
          { title: "📘 My Courses", color: "#0b63d0", path: "/student/classes" },
          { title: "🧠 Take Exam", color: "#007bff", path: "/exams/student" },
          { title: "📅 Attendance", color: "#003366", path: "/attendance" },
          { title: "🎓 Certificate", color: "#0a58ca", path: "/certificates" },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => router.push(item.path)}
            style={{
              background: `linear-gradient(135deg, ${item.color}, #001f3f)`,
              borderRadius: "16px",
              padding: "30px 20px",
              textAlign: "center",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 10px 30px rgba(11,99,208,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 6px 20px rgba(0,0,0,0.3)";
            }}
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
