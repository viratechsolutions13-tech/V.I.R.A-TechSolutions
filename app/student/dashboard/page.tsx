"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load email safely after hydration
  useEffect(() => {
    const stored = localStorage.getItem("studentEmail");
    if (stored) setEmail(stored);
  }, []);

  // ✅ Load student info
  useEffect(() => {
    if (!email) return;
    (async () => {
      setLoading(true);
      const snap = await getDocs(
        query(collection(db, "students_info"), where("email", "==", email))
      );
      if (!snap.empty) setStudent(snap.docs[0].data());
      setLoading(false);
    })();
  }, [email]);

  // ✅ Load exam results
  useEffect(() => {
    if (!email) return;
    (async () => {
      const snap = await getDocs(
        query(collection(db, "exam_results"), where("email", "==", email))
      );
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setExamHistory(data);
    })();
  }, [email]);

  // ✅ Safe date formatting
  const formatDate = (date: any) => {
    if (!date) return "—";
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return "—";
  };

  if (loading)
    return (
      <div style={center}>
        <p style={{ color: "#66b3ff" }}>Loading dashboard…</p>
      </div>
    );

  if (!student)
    return (
      <div style={center}>
        <h3>No student data found</h3>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: 30,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#66b3ff", marginBottom: 30 }}>
        🎓 Student Dashboard
      </h1>

      {/* Profile */}
      <div style={box}>
        <h2 style={{ color: "#66b3ff" }}>Profile</h2>
        <p><b>Name:</b> {student.name}</p>
        <p><b>Course:</b> {student.course}</p>
        <p><b>Batch:</b> {student.batchName || student.batch}</p>
        <p><b>Trainer:</b> {student.trainerName || "Not Assigned"}</p>
      </div>

      {/* Live Classes */}
      <div style={box}>
        <h2 style={{ color: "#66b3ff" }}>📚 Live Classes</h2>
        <button onClick={() => router.push("/student/classes")} style={button}>
          Go to Classes
        </button>
      </div>

      {/* Exams */}
      <div style={box}>
        <h2 style={{ color: "#66b3ff" }}>🧩 Exams</h2>
        <button onClick={() => router.push("/student/exams")} style={button}>
          Start Exam
        </button>
      </div>

      {/* Exam History */}
      <div style={box}>
        <h2 style={{ color: "#66b3ff" }}>📜 Exam History</h2>

        {examHistory.length === 0 ? (
          <p>No exams attempted yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam Title</th>
                <th>Percent</th>
                <th>Score</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {examHistory.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.submittedAt)}</td>
                  <td>{e.title}</td>
                  <td>{e.percent}%</td>
                  <td>{e.score || 0} /—</td>
                  <td>
                    <button
                      onClick={() => router.push(`/student/results/${e.id}`)}
                      style={resultBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ========================
   🔹 Styles
======================== */
const center = {
  display: "flex",
  minHeight: "100vh",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  flexDirection: "column",
};

const button = {
  padding: "10px 20px",
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const resultBtn = {
  background: "#007bff",
  border: "none",
  color: "white",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const box = {
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  boxShadow: "0 0 12px rgba(0,0,0,0.2)",
};

const table = {
  width: "100%",
  marginTop: 10,
  borderCollapse: "collapse" as const,
  background: "rgba(255,255,255,0.05)",
};
