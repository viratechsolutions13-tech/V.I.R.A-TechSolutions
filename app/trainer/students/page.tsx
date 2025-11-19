"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function TrainerStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const trainerEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("trainerEmail") || localStorage.getItem("userEmail")
      : null;

  useEffect(() => {
    if (!trainerEmail) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "students_info"), where("trainerEmail", "==", trainerEmail))
        );
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(data);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [trainerEmail]);

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
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>👨‍🎓 My Students</h1>
      <p style={{ textAlign: "center", color: "#aaa" }}>
        Showing students assigned to <b>{trainerEmail}</b>
      </p>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={() => router.push("/trainer/dashboard")}
          style={{
            background: "linear-gradient(90deg,#0b63d0,#007bff)",
            border: "none",
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: 40 }}>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: 40 }}>
          No students assigned yet.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.1)" }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Course</th>
              <th style={th}>Batch</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={i}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <td style={td}>{s.name}</td>
                <td style={td}>{s.email}</td>
                <td style={td}>{s.course}</td>
                <td style={td}>{s.batchName || s.batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: "12px",
  color: "#66b3ff",
  fontSize: 15,
  textAlign: "center" as const,
};

const td = {
  padding: "10px",
  fontSize: 14,
  color: "#fff",
  textAlign: "center" as const,
};
