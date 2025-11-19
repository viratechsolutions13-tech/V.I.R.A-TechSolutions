"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminResults() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadResults() {
      const snap = await getDocs(collection(db, "exam_submissions"));
      setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadResults();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: "40px",
      }}
    >
      <AdminNavbar />

      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>📊 Exam Results</h1>

      <table
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "30px auto",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.1)" }}>
            <th style={th}>Student</th>
            <th style={th}>Exam ID</th>
            <th style={th}>Score</th>
            <th style={th}>Total</th>
            <th style={th}>Code Submitted?</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td style={td} colSpan={5} align="center">
                No exam submissions found.
              </td>
            </tr>
          ) : (
            results.map((r) => (
              <tr key={r.id} style={{ background: "rgba(255,255,255,0.04)" }}>
                <td style={td}>{r.studentEmail}</td>
                <td style={td}>{r.examId}</td>
                <td style={td}>{r.score}</td>
                <td style={td}>{r.totalMarks}</td>
                <td style={td}>{r.codeAnswers ? "✅" : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "12px",
  color: "#66b3ff",
  borderBottom: "2px solid rgba(255,255,255,0.2)",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.95rem",
};
