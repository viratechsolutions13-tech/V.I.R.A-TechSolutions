// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import AdminNavbar from "../components/AdminNavbar";
import * as XLSX from "xlsx";

export default function AdminAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState({ course: "", trainer: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const studentsSnap = await getDocs(collection(db, "students_info"));
      const attendanceSnap = await getDocs(collection(db, "attendance_records"));

      const studentList = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const attendanceList = attendanceSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Match attendance with students
      const merged = studentList.map((s) => {
        const record = attendanceList.find((a) => a.studentEmail === s.email);
        const total = record?.totalClasses || 0;
        const attended = record?.attendedClasses || 0;
        const percent = total ? Math.round((attended / total) * 100) : 0;
        return {
          name: s.name,
          email: s.email,
          course: s.course,
          trainer: s.trainer,
          total,
          attended,
          percent,
        };
      });

      setStudents(studentList);
      setAttendanceData(merged);
      setLoading(false);
    }

    fetchData();
  }, []);

  const uniqueCourses = [...new Set(students.map((s) => s.course))];
  const uniqueTrainers = [...new Set(students.map((s) => s.trainer))];

  const filtered = attendanceData.filter((a) => {
    const byCourse = filters.course ? a.course === filters.course : true;
    const byTrainer = filters.trainer ? a.trainer === filters.trainer : true;
    return byCourse && byTrainer;
  });

  const exportToExcel = () => {
    const sheetData = filtered.map((a) => ({
      Name: a.name,
      Email: a.email,
      Course: a.course,
      Trainer: a.trainer || "—",
      "Total Classes": a.total,
      "Attended Classes": a.attended,
      "Attendance %": a.percent,
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "VIRA_Attendance_Report.xlsx");
  };

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
        Loading attendance records...
      </div>
    );

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
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>📅 Attendance Overview</h1>

      {/* Filters */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "30px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Courses</option>
          {uniqueCourses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.trainer}
          onChange={(e) => setFilters({ ...filters, trainer: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Trainers</option>
          {uniqueTrainers.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <button onClick={exportToExcel} style={exportBtn}>
          ⬇️ Export Excel
        </button>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          marginTop: "30px",
          borderCollapse: "collapse",
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.1)" }}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Course</th>
            <th style={th}>Trainer</th>
            <th style={th}>Attended</th>
            <th style={th}>Total</th>
            <th style={th}>%</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ ...td, textAlign: "center" }}>
                No records found.
              </td>
            </tr>
          ) : (
            filtered.map((a, i) => (
              <tr key={i} style={{ background: "rgba(255,255,255,0.04)" }}>
                <td style={td}>{a.name}</td>
                <td style={td}>{a.email}</td>
                <td style={td}>{a.course}</td>
                <td style={td}>{a.trainer}</td>
                <td style={td}>{a.attended}</td>
                <td style={td}>{a.total}</td>
                <td style={td}>{a.percent}%</td>
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
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.95rem",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "8px",
  padding: "10px",
  flex: 1,
  minWidth: "180px",
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

