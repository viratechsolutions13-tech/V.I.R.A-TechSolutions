// app/trainer/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export default function TrainerAttendancePage() {
  const [trainerEmail, setTrainerEmail] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const e = localStorage.getItem("trainerEmail") || localStorage.getItem("userEmail") || "";
      setTrainerEmail(e);
    }
  }, []);

  useEffect(() => {
    if (!trainerEmail) return;
    async function loadStudents() {
      setLoading(true);
      try {
        const studentsSnap = await getDocs(query(collection(db, "students_info"), where("trainerEmail", "==", trainerEmail)));
        setStudents(studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [trainerEmail]);

  const mark = async (status: "present" | "absent", studentEmail: string, studentName: string) => {
    try {
      const todayISO = new Date().toISOString();
      // Create an attendance record per day (trainerEmail, presentStudents array will contain emails)
      if (status === "present") {
        await addDoc(collection(db, "attendance"), {
          trainerEmail,
          createdAt: todayISO,
          presentStudents: [studentEmail],
          percentage: 100,
          note: `Marked present for ${studentName}`,
        });
      } else {
        await addDoc(collection(db, "attendance"), {
          trainerEmail,
          createdAt: todayISO,
          presentStudents: [],
          percentage: 0,
          note: `Marked absent for ${studentName}`,
        });
      }
      alert(`Marked ${studentName} as ${status}`);
    } catch (err) {
      console.error(err);
      alert("Failed to mark attendance — see console.");
    }
  };

  if (!trainerEmail) {
    return <div style={{ padding: 40, color: "orange" }}>Trainer not logged in. Please login.</div>;
  }

  return (
    <div style={{ minHeight: "100vh", padding: 40, background: "linear-gradient(180deg,#001133,#000814)", color: "white" }}>
      <h2 style={{ color: "#66b3ff", textAlign: "center", marginBottom: 20 }}>📋 Trainer Attendance Panel</h2>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading students...</p>
      ) : (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <thead style={{ background: "rgba(255,255,255,0.04)", color: "#66b3ff" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                <th style={{ padding: 12, textAlign: "left" }}>Course</th>
                <th style={{ padding: 12, textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: 12 }}>{s.name}</td>
                  <td style={{ padding: 12 }}>{s.email}</td>
                  <td style={{ padding: 12 }}>{s.course}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => mark("present", s.email, s.name)} style={{ background: "#2ecc71", border: "none", padding: "8px 12px", borderRadius: 6, marginRight: 8, color: "white" }}>
                      Present
                    </button>
                    <button onClick={() => mark("absent", s.email, s.name)} style={{ background: "#e74c3c", border: "none", padding: "8px 12px", borderRadius: 6, color: "white" }}>
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 18, color: "gray" }}>
                    No students found for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
