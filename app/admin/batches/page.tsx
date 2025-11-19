"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import * as XLSX from "xlsx";

export default function AdminBatchAnalyticsPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    trainer: "",
    course: "",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const batchSnap = await getDocs(collection(db, "trainer_batches"));
        const studentSnap = await getDocs(collection(db, "students_info"));
        const attSnap = await getDocs(collection(db, "attendance"));
        const examSnap = await getDocs(collection(db, "exam_submissions"));

        const batchList = batchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const studentsList = studentSnap.docs.map((d) => d.data());
        const attList = attSnap.docs.map((d) => d.data());
        const examList = examSnap.docs.map((d) => d.data());

        setBatches(batchList);
        setStudents(studentsList);
        setAttendance(attList);
        setExams(examList);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredBatches = batches.filter(
    (b) =>
      (filter.trainer ? b.trainerEmail === filter.trainer : true) &&
      (filter.course ? b.course === filter.course : true)
  );

  // Compute batch performance
  const batchPerformance = filteredBatches.map((b) => {
    const batchStudents = students.filter((s) => s.batchName === b.batchName);
    const studentEmails = batchStudents.map((s) => s.email);

    const attRecords = attendance.filter((a) =>
      a.presentStudents?.some((email: string) => studentEmails.includes(email))
    );

    const avgAttendance =
      attRecords.length > 0
        ? Math.round(
            attRecords.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              attRecords.length
          )
        : 0;

    const batchExams = exams.filter((e) => studentEmails.includes(e.studentEmail));
    const avgScore =
      batchExams.length > 0
        ? Math.round(
            batchExams.reduce((sum, e) => sum + (e.score || 0), 0) /
              batchExams.length
          )
        : 0;

    const eligibleCount = batchStudents.filter((s) => {
      const att = avgAttendance;
      const studentExams = exams.filter((e) => e.studentEmail === s.email);
      const avg = studentExams.length
        ? Math.round(
            studentExams.reduce((sum, e) => sum + (e.score || 0), 0) /
              studentExams.length
          )
        : 0;
      return att >= 80 && avg >= 50;
    }).length;

    return {
      trainer: b.trainerName,
      trainerEmail: b.trainerEmail,
      batch: b.batchName,
      course: b.course,
      totalStudents: batchStudents.length,
      avgAttendance,
      avgScore,
      eligibleCount,
    };
  });

  function exportToExcel() {
    const sheetData = batchPerformance.map((b) => ({
      Trainer: b.trainer,
      TrainerEmail: b.trainerEmail,
      Batch: b.batch,
      Course: b.course,
      Students: b.totalStudents,
      "Avg Attendance %": b.avgAttendance,
      "Avg Score %": b.avgScore,
      "Eligible Count": b.eligibleCount,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Batch Analytics");
    XLSX.writeFile(wb, "VIRA_Batch_Analytics.xlsx");
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#66b3ff",
        }}
      >
        Loading Batch Analytics...
      </div>
    );

  const trainers = [...new Set(batches.map((b) => b.trainerEmail))];
  const courses = [...new Set(batches.map((b) => b.course))];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: "40px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        📅 Admin Batch Analytics
      </h1>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "30px" }}>
        Overview of all trainer batches, attendance, scores, and eligibility.
      </p>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <select
          value={filter.trainer}
          onChange={(e) => setFilter({ ...filter, trainer: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Trainers</option>
          {trainers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filter.course}
          onChange={(e) => setFilter({ ...filter, course: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button onClick={exportToExcel} style={exportBtn}>
          ⬇️ Export Excel
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 0 20px rgba(11,99,208,0.3)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.1)" }}>
              <th style={th}>Trainer</th>
              <th style={th}>Batch</th>
              <th style={th}>Course</th>
              <th style={th}>Students</th>
              <th style={th}>Avg Attendance</th>
              <th style={th}>Avg Score</th>
              <th style={th}>Eligible</th>
            </tr>
          </thead>
          <tbody>
            {batchPerformance.map((b, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <td style={td}>
                  {b.trainer} <br />
                  <span style={{ color: "#aaa", fontSize: "0.8rem" }}>
                    {b.trainerEmail}
                  </span>
                </td>
                <td style={td}>{b.batch}</td>
                <td style={td}>{b.course}</td>
                <td style={td}>{b.totalStudents}</td>
                <td style={td}>{b.avgAttendance}%</td>
                <td style={td}>{b.avgScore}%</td>
                <td style={td}>{b.eligibleCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const th: React.CSSProperties = {
  padding: "12px",
  color: "#66b3ff",
  textAlign: "left",
  borderBottom: "2px solid rgba(255,255,255,0.2)",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.95rem",
  color: "white",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "8px",
  padding: "10px",
  minWidth: "200px",
};

const exportBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};
