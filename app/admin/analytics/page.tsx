"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>({});
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    course: "",
    trainer: "",
    type: "All",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const studentsSnap = await getDocs(collection(db, "students_info"));
      const paymentsSnap = await getDocs(collection(db, "payments_pending"));
      let attendanceSnap: any[] = [];
      try {
        const attSnap = await getDocs(collection(db, "attendance"));
        attendanceSnap = attSnap.docs.map((d) => d.data());
      } catch {
        attendanceSnap = [];
      }

      const studentsData = studentsSnap.docs.map((d) => d.data());
      const paymentsData = paymentsSnap.docs.map((d) => d.data());

      const demo = studentsData.filter((s) => s.isDemo).length;
      const full = studentsData.length - demo;

      const approved = paymentsData.filter((p) => p.status === "approved").length;
      const pending = paymentsData.filter((p) => p.status === "pending").length;

      const avgAttendance =
        attendanceSnap.length > 0
          ? Math.round(
              attendanceSnap.reduce((a, b) => a + (b.percentage || 0), 0) /
                attendanceSnap.length
            )
          : 0;

      const coursesCount: Record<string, number> = {};
      studentsData.forEach((s: any) => {
        const c = s.course || "Unknown";
        coursesCount[c] = (coursesCount[c] || 0) + 1;
      });

      const courseData = Object.keys(coursesCount).map((c) => ({
        course: c,
        students: coursesCount[c],
      }));

      setStats({
        totalStudents: studentsData.length,
        demoStudents: demo,
        fullStudents: full,
        approvedPayments: approved,
        pendingPayments: pending,
        attendanceAvg: avgAttendance,
      });

      setCourseStats(courseData);
      setStudents(studentsData);
      setPayments(paymentsData);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchCourse = filters.course ? s.course === filters.course : true;
    const matchTrainer = filters.trainer ? s.trainer === filters.trainer : true;
    const matchType =
      filters.type === "All"
        ? true
        : filters.type === "Demo"
        ? s.isDemo
        : !s.isDemo;
    return matchCourse && matchTrainer && matchType;
  });

  function exportToExcel() {
    const sheetData = filteredStudents.map((s) => ({
      Name: s.name,
      Email: s.email,
      Course: s.course,
      Trainer: s.trainer || "—",
      Type: s.isDemo ? "Demo" : "Full",
      Phone: s.phone || "—",
      College: s.college || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "VIRA_Students_Report.xlsx");
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#66b3ff",
        }}
      >
        Loading analytics...
      </div>
    );

  const uniqueCourses = [...new Set(students.map((s) => s.course))];
  const uniqueTrainers = [...new Set(students.map((s) => s.trainer))];

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

      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        📊 Admin Analytics Dashboard
      </h1>

      {/* --- Top Stats --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <StatCard title="Total Students" value={stats.totalStudents} color="#0b63d0" />
        <StatCard title="Demo Students" value={stats.demoStudents} color="#ffcc00" />
        <StatCard title="Full Students" value={stats.fullStudents} color="#00ff99" />
        <StatCard title="Approved Payments" value={stats.approvedPayments} color="#00ff99" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} color="#ff6b6b" />
        <StatCard title="Avg Attendance" value={`${stats.attendanceAvg}%`} color="#66b3ff" />
      </div>

      {/* --- Filters --- */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "40px",
        }}
      >
        <h2 style={{ color: "#66b3ff" }}>🔍 Filter Data</h2>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <select
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            style={filterInput}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filters.trainer}
            onChange={(e) => setFilters({ ...filters, trainer: e.target.value })}
            style={filterInput}
          >
            <option value="">All Trainers</option>
            {uniqueTrainers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={filterInput}
          >
            <option value="All">All Students</option>
            <option value="Demo">Demo Only</option>
            <option value="Full">Full Only</option>
          </select>

          <button onClick={exportToExcel} style={exportBtn}>
            ⬇️ Export to Excel
          </button>
        </div>
      </div>

      {/* --- Course Chart --- */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "50px",
          boxShadow: "0 0 20px rgba(11,99,208,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#66b3ff" }}>📚 Students Per Course</h2>
        {courseStats.length === 0 ? (
          <p style={{ textAlign: "center", color: "gray" }}>No course data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={courseStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" stroke="#ccc" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#0b63d0" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* --- Reusable Components --- */
function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 0 15px rgba(11,99,208,0.3)",
      }}
    >
      <h3 style={{ color }}>{title}</h3>
      <h1 style={{ color: "white", fontSize: "2rem" }}>{value}</h1>
    </div>
  );
}

const filterInput: React.CSSProperties = {
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
