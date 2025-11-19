// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrainerPerformancePage() {
  const [trainerEmail] = useState<string>("trainer.python@vira.com");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    totalStudents: 0,
    totalExams: 0,
    avgScore: 0,
    topPerformer: null,
  });

  useEffect(() => {
    async function loadPerformance() {
      setLoading(true);
      try {
        // 🔹 Step 1: Load all exam submissions for this trainer
        const q1 = query(
          collection(db, "exam_submissions"),
          where("trainerEmail", "==", trainerEmail)
        );
        const snap = await getDocs(q1);
        const allSubs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (allSubs.length === 0) {
          setSubmissions([]);
          setLoading(false);
          return;
        }

        // 🔹 Step 2: Load all student info for this trainer's course
        const allStudents = await getDocs(collection(db, "students_info"));
        const studentMap: Record<string, any> = {};
        allStudents.forEach((doc) => {
          const data = doc.data();
          studentMap[data.email] = data;
        });

        // 🔹 Step 3: Group exam data by student
        const grouped: Record<string, any> = {};
        allSubs.forEach((sub) => {
          const email = sub.studentEmail;
          const studentInfo = studentMap[email] || {};
          if (!grouped[email]) {
            grouped[email] = {
              studentName: sub.studentName,
              studentEmail: email,
              course: sub.course || studentInfo.course || "—",
              batch:
                sub.batch ||
                studentInfo.batchName ||
                studentInfo.batch ||
                "—",
              exams: [],
            };
          }
          grouped[email].exams.push(sub);
        });

        // 🔹 Step 4: Calculate averages
        const list = Object.values(grouped).map((s: any) => {
          const avg =
            s.exams.reduce(
              (sum: number, e: any) => sum + (e.mcqPercentage || 0),
              0
            ) / s.exams.length;
          return { ...s, avgScore: Math.round(avg) };
        });

        // 🔹 Step 5: Summary stats
        const totalStudents = list.length;
        const totalExams = allSubs.length;
        const avgScore =
          list.reduce((sum, s: any) => sum + s.avgScore, 0) / totalStudents;
        const topPerformer = list.reduce(
          (top: any, s: any) =>
            s.avgScore > (top?.avgScore || 0) ? s : top,
          null
        );

        setSubmissions(list);
        setSummary({
          totalStudents,
          totalExams,
          avgScore: Math.round(avgScore),
          topPerformer,
        });
      } catch (err) {
        console.error("Error loading performance:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPerformance();
  }, [trainerEmail]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: "40px 30px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h2 style={{ color: "#66b3ff", marginBottom: 20 }}>
        📊 Student Performance
      </h2>

      {/* 🔹 SUMMARY CARDS */}
      <div style={summaryGrid}>
        <div style={card}>
          <h3 style={metric}>{summary.totalStudents}</h3>
          <p>Total Students</p>
        </div>
        <div style={card}>
          <h3 style={metric}>{summary.totalExams}</h3>
          <p>Total Exams Submitted</p>
        </div>
        <div style={card}>
          <h3 style={metric}>{summary.avgScore}%</h3>
          <p>Average Score</p>
        </div>
        <div style={card}>
          <h3 style={metric}>
            {summary.topPerformer
              ? summary.topPerformer.studentName
              : "—"}
          </h3>
          <p>Top Performer</p>
        </div>
      </div>

      {/* 🔹 MAIN CONTENT */}
      {loading ? (
        <p style={{ marginTop: 40, textAlign: "center" }}>Loading data...</p>
      ) : submissions.length === 0 ? (
        <p style={{ marginTop: 40, textAlign: "center" }}>
          No performance data found.
        </p>
      ) : (
        <>
          {/* 📈 CHART */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ color: "#66b3ff", marginBottom: 10 }}>
              📈 Average MCQ Performance
            </h3>
            <div
              style={{
                width: "100%",
                height: 300,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 10,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="studentName" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "none",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#0b63d0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🧾 DETAILED REPORT */}
          <div style={{ marginTop: 50 }}>
            <h3 style={{ color: "#66b3ff", marginBottom: 10 }}>
              🧾 Detailed Student Report
            </h3>
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Avg MCQ %</th>
                  <th>Exam Attempts</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.studentEmail} style={tbodyRow}>
                    <td>{s.studentName}</td>
                    <td>{s.studentEmail}</td>
                    <td>{s.course}</td>
                    <td>{s.batch}</td>
                    <td>{s.avgScore}%</td>
                    <td>{s.exams.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================
   🔹 STYLES
========================= */
const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const card = {
  background: "rgba(255,255,255,0.08)",
  padding: 20,
  borderRadius: 12,
  textAlign: "center" as const,
  boxShadow: "0 0 20px rgba(11,99,208,0.2)",
};

const metric = {
  fontSize: 26,
  fontWeight: 700,
  color: "#66b3ff",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "rgba(255,255,255,0.05)",
  borderRadius: 10,
  overflow: "hidden",
};

const theadRow = {
  background: "rgba(255,255,255,0.15)",
  color: "#66b3ff",
};

const tbodyRow = {
  textAlign: "center" as const,
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

