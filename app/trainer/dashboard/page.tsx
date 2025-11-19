// app/trainer/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function TrainerDashboard() {
  const router = useRouter();
  const [trainerEmail, setTrainerEmail] = useState<string>("");
  const [courseLabel, setCourseLabel] = useState<string>("");
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    demoStudents: 0,
    fullStudents: 0,
    avgAttendance: 0,
    avgScore: 0,
    eligibleCount: 0,
  });

  useEffect(() => {
    // read trainer email from localStorage (set by login)
    if (typeof window !== "undefined") {
      const email =
        localStorage.getItem("trainerEmail") ||
        localStorage.getItem("userEmail") ||
        "";
      setTrainerEmail(email);
    }
  }, []);

  useEffect(() => {
    if (!trainerEmail) return;
    async function loadStats() {
      try {
        const studentsSnap = await getDocs(
          query(collection(db, "students_info"), where("trainerEmail", "==", trainerEmail))
        );
        const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const attendanceSnap = await getDocs(collection(db, "attendance"));
        const submissionsSnap = await getDocs(collection(db, "exam_submissions"));

        const totalStudents = students.length;
        const demoStudents = students.filter((s) => s.isDemo).length;
        const fullStudents = totalStudents - demoStudents;

        const trainerAttendance = attendanceSnap.docs
          .map((d) => d.data())
          .filter((a) => a.trainerEmail === trainerEmail);

        const avgAttendance =
          trainerAttendance.length > 0
            ? Math.round(
                trainerAttendance.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                  trainerAttendance.length
              )
            : 0;

        const trainerSubmissions = submissionsSnap.docs
          .map((d) => d.data())
          .filter((s) => s.trainerEmail === trainerEmail);

        const avgScore =
          trainerSubmissions.length > 0
            ? Math.round(
                trainerSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                  trainerSubmissions.length
              )
            : 0;

        const eligibleCount = students.filter((s) => s.accessGranted === true).length;

        setStats({
          totalStudents,
          demoStudents,
          fullStudents,
          avgAttendance,
          avgScore,
          eligibleCount,
        });

        // show course of the trainer by picking most common student's course or trainer_auth later
        const mostCommonCourse = students[0]?.course || "";
        setCourseLabel(mostCommonCourse);
      } catch (err) {
        console.error("Error loading trainer stats:", err);
      }
    }
    loadStats();
  }, [trainerEmail]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("trainerEmail");
      localStorage.removeItem("userEmail");
    }
    alert("👋 Logged out successfully!");
    router.push("/trainer/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #001133, #000814)",
        color: "white",
        padding: "40px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#66b3ff",
          marginBottom: "20px",
        }}
      >
        🧑‍🏫 Trainer Dashboard
      </h1>

      {trainerEmail ? (
        <>
          <p
            style={{
              textAlign: "center",
              color: "#aaa",
              marginBottom: "10px",
            }}
          >
            Welcome, <span style={{ color: "#66b3ff" }}>{trainerEmail}</span>
          </p>
          <p
            style={{
              textAlign: "center",
              color: "#66b3ff",
              marginBottom: "28px",
            }}
          >
            Course: {courseLabel || "—"}
          </p>
        </>
      ) : (
        <p style={{ textAlign: "center", color: "orange" }}>
          No trainer logged in. Please login to proceed.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          color="#0b63d0"
          onClick={() => router.push("/trainer/students")}
        />
        <StatCard title="Demo Students" value={stats.demoStudents} color="#ffcc00" />
        <StatCard title="Full Students" value={stats.fullStudents} color="#00ff99" />
        <StatCard
          title="Avg Attendance"
          value={`${stats.avgAttendance}%`}
          color="#66b3ff"
        />
        <StatCard title="Avg Exam Score" value={`${stats.avgScore}%`} color="#00ff99" />
        <StatCard
          title="Eligible for Certificate"
          value={stats.eligibleCount}
          color="#b366ff"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <MenuCard
          title="📚 Manage Classes"
          desc="View and manage your classes."
          onClick={() => router.push("/trainer/classes")}
        />
        <MenuCard
          title="🗓️ Attendance"
          desc="Mark attendance and view student presence."
          onClick={() => router.push("/trainer/attendance")}
        />
        <MenuCard
          title="🧩 Exams"
          desc="Create and review exams."
          onClick={() => router.push("/trainer/exams")}
        />
        <MenuCard
          title="📈 Performance"
          desc="View students’ performance and analytics."
          onClick={() => router.push("/trainer/performance")}
        />
        <MenuCard
          title="📅 Manage Batches"
          desc="Create and manage student batches."
          onClick={() => router.push("/trainer/batches")}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <button
          onClick={logout}
          style={{
            background: "linear-gradient(90deg,#0b63d0,#007bff)",
            border: "none",
            color: "white",
            borderRadius: "10px",
            padding: "12px 24px",
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

/* Helpers */
function MenuCard({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 0 20px rgba(11,99,208,0.3)",
        cursor: "pointer",
        transition: "0.3s",
      }}
    >
      <h2 style={{ color: "#66b3ff", marginBottom: "10px" }}>{title}</h2>
      <p style={{ color: "#ccc", fontSize: "0.95rem" }}>{desc}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  onClick,
}: {
  title: string;
  value: any;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.05)",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 0 15px rgba(11,99,208,0.3)",
        cursor: onClick ? "pointer" : "default",
        transition: "0.3s",
      }}
      onMouseEnter={(e) => {
        if (onClick)
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      }}
      onMouseLeave={(e) => {
        if (onClick)
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
    >
      <h3 style={{ color }}>{title}</h3>
      <h1 style={{ color: "white", fontSize: "2rem" }}>{value}</h1>
    </div>
  );
}
