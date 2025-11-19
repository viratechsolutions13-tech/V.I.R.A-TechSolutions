"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../../components/AdminGuard";
import AdminNavbar from "../components/AdminNavbar";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import * as XLSX from "xlsx";

/**
 * Admin Dashboard
 * Path: app/admin/dashboard/page.tsx
 *
 * - Approve payment -> sets student doc, assigns trainerEmail/trainerName/batchName
 * - Uses collections:
 *    - payments_pending
 *    - students_info
 *    - trainer_batches
 *    - trainer_auth
 */

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminNavbar />
      <AdminDashboardInner />
    </AdminGuard>
  );
}

function AdminDashboardInner() {
  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState("");

  // 🔹 Fix: Added states for batch modal
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);


  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [
          studentsSnap,
          paymentsSnap,
          attendanceSnap,
          batchesSnap,
          examsSnap,
          trainersSnap,
        ] = await Promise.all([
          getDocs(collection(db, "students_info")),
          getDocs(query(collection(db, "payments_pending"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "attendance")),
          getDocs(collection(db, "trainer_batches")),
          getDocs(collection(db, "exams")),
          getDocs(collection(db, "trainer_auth")),
        ]);

        setStudents(studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setPayments(paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setAttendance(attendanceSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setBatches(batchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setExams(examsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTrainers(trainersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        setNotif("✅ Data loaded from Firestore");
        setTimeout(() => setNotif(""), 2500);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setNotif("❌ Failed to load data (check console)");
        setTimeout(() => setNotif(""), 3500);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // --- Approve Payment (core logic) ---
  const approvePayment = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return alert("Payment not found");

    try {
      // 1) mark payment approved
      await updateDoc(doc(db, "payments_pending", paymentId), { status: "approved" });

      // 2) find existing student by email
      let studentRecord = students.find((s) => s.email === payment.email);

      // 3) if not exists, create student doc (id = paymentId for trace)
      if (!studentRecord) {
        const newStudent = {
          name: payment.name || payment.fullName || "Student",
          email: payment.email,
          phone: payment.phone || "",
          course: payment.courseTitle || payment.course || "Unknown",
          isDemo: !!payment.isDemo,
          accessGranted: true,
          trainerName: "",
          trainerEmail: "",
          batchName: "",
          createdAt: new Date().toISOString(),
          accessGrantedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "students_info", paymentId), newStudent);
        studentRecord = { id: paymentId, ...newStudent };
      }

      // 4) Admin assigns trainer & batch (change these values or select UI in your admin later)
      // For now: choose the first trainer that matches the course if available; otherwise default
      const matchingTrainer = trainers.find((t) => {
        const tcourse = (t.course || "").toString().toLowerCase();
        const pcourse = (payment.courseTitle || payment.course || "").toString().toLowerCase();
        // treat "py" ~ "python" by simple includes
        return tcourse && pcourse && (tcourse === pcourse || tcourse.includes(pcourse) || pcourse.includes(tcourse));
      });

      const trainerName = matchingTrainer?.name || "Trainer Name";
      const trainerEmail = matchingTrainer?.email || "trainer.python@vira.com";

      const batchName =
        (payment.courseTitle || payment.course || "course").toString().replace(/\s+/g, "-") +
        "-Batch-" +
        Math.floor(Math.random() * 1000);

      // 5) update student doc
      await updateDoc(doc(db, "students_info", studentRecord.id), {
        accessGranted: true,
        trainerName,
        trainerEmail,
        batchName,
        accessGrantedAt: new Date().toISOString(),
      });

      // 6) create a trainer_batches entry
      await addDoc(collection(db, "trainer_batches"), {
        batchName,
        trainerName,
        trainerEmail,
        course: payment.courseTitle || payment.course || "Unknown",
        createdAt: new Date().toISOString(),
      });

      alert("✅ Payment approved & student activated.");
      // refresh payments & students
      const paymentsSnap = await getDocs(query(collection(db, "payments_pending"), orderBy("createdAt", "desc")));
      setPayments(paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      const studentsSnap = await getDocs(collection(db, "students_info"));
      setStudents(studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Approve payment error:", err);
      alert("❌ Approval failed (see console).");
    }
  };

  // --- Reject Payment ---
  const rejectPayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "payments_pending", id));
      alert("❌ Payment rejected & removed.");
      const paymentsSnap = await getDocs(query(collection(db, "payments_pending"), orderBy("createdAt", "desc")));
      setPayments(paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Reject payment error:", err);
      alert("❌ Reject failed (see console).");
    }
  };

  // Mark certificate eligible (admin action)
  const markEligible = async (student: any) => {
    try {
      await setDoc(doc(db, "certificates_eligible", student.email), {
        ...student,
        eligible: true,
        markedAt: new Date().toISOString(),
      });
      alert(`✅ ${student.name} marked eligible for certificate.`);
    } catch (err) {
      console.error("Mark eligible error:", err);
      alert("❌ Failed to mark eligible.");
    }
  };

  const exportExcel = (data: any[], name: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "30vh", color: "#66b3ff" }}>
        Loading Admin Dashboard...
      </div>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.toLowerCase().includes(search.toLowerCase())
  );

  // Build trainer list from trainer_auth + student references
  const trainerEmailsFromStudents = [...new Set(students.map((s) => s.trainerEmail).filter(Boolean))];
  const trainerEmailsExplicit = trainers.map((t) => t.email).filter(Boolean);
  const allTrainerEmails = Array.from(new Set([...trainerEmailsExplicit, ...trainerEmailsFromStudents]));

  const trainerStats = allTrainerEmails.map((email) => {
    const trainerStudents = students.filter((s) => s.trainerEmail === email);
    const foundTrainer = trainers.find((t) => t.email === email);
    const trainerName = foundTrainer?.name || trainerStudents[0]?.trainerName || "N/A";

    const total = trainerStudents.length;
    const demo = trainerStudents.filter((s) => s.isDemo).length;
    const full = total - demo;

    const attRecords = attendance.filter((a) => a.trainerEmail === email);
    const avgAttendance =
      attRecords.length > 0
        ? Math.round(attRecords.reduce((sum, a) => sum + (a.percentage || 0), 0) / attRecords.length)
        : 0;

    const trainerExams = exams.filter((e) => e.trainerEmail === email);
    const avgScore =
      trainerExams.length > 0 ? Math.round(trainerExams.reduce((sum, e) => sum + (e.avgScore || 0), 0) / trainerExams.length) : 0;

    const eligibleCount = trainerStudents.filter((s) => s.accessGranted === true).length;

    return {
      trainerName,
      trainerEmail: email,
      total,
      demo,
      full,
      avgAttendance,
      avgScore,
      eligibleCount,
    };
  });

  const batchPerformance = batches.map((b) => {
    const batchStudents = students.filter((s) => s.batchName === b.batchName);
    const studentEmails = batchStudents.map((s) => s.email);

    const attRecords = attendance.filter((a) =>
      a.presentStudents?.some((mail: string) => studentEmails.includes(mail))
    );

    const avgAttendance =
      attRecords.length > 0
        ? Math.round(attRecords.reduce((sum, a) => sum + (a.percentage || 0), 0) / attRecords.length)
        : 0;

    const batchExams = exams.filter((e) => studentEmails.includes(e.studentEmail));
    const avgScore =
      batchExams.length > 0 ? Math.round(batchExams.reduce((sum, e) => sum + (e.score || 0), 0) / batchExams.length) : 0;

    const eligibleCount = batchStudents.filter(() => avgAttendance >= 80 && avgScore >= 50).length;

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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#001133,#000814)", color: "white", padding: 30 }}>
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>👨‍💼 Admin Dashboard</h1>

      {notif && (
        <div style={{ textAlign: "center", background: "#0b63d0", padding: 10, borderRadius: 8, margin: "12px auto", maxWidth: 900 }}>
          {notif}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 15, margin: "18px 0", flexWrap: "wrap" }}>
        {["students", "payments", "certificates", "trainerAnalytics", "batchAnalytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "linear-gradient(90deg,#0b63d0,#007bff)" : "rgba(255,255,255,0.08)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {tab === "trainerAnalytics" ? "Trainer Analytics" : tab === "batchAnalytics" ? "Batch Analytics" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ maxWidth: 1100, margin: "10px auto 0 auto" }}>
        <input
          placeholder="Search students by name, email or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.25)",
            color: "white",
            marginBottom: 18,
          }}
        />
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div style={panelStyle}>
          <h2 style={{ color: "#66b3ff", marginBottom: 12 }}>👥 Students</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Course</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Trainer</th>
                  <th style={th}>Batch</th>
                  <th style={th}>Access</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td style={td}>{s.name}</td>
                    <td style={td}>{s.email}</td>
                    <td style={td}>{s.course}</td>
                    <td style={td}>{s.phone || "-"}</td>
                    <td style={td}>{s.trainerName || "-"}</td>
                    <td style={td}>{s.batchName || "-"}</td>
                    <td style={td}>{s.accessGranted ? "Granted" : "Pending"}</td>
                    <td style={td}>
                      <button
                        onClick={() => markEligible(s)}
                        style={{ background: "#0b63d0", color: "white", padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer" }}
                      >
                        Mark Eligible
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 18, color: "gray" }}>
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={() => exportExcel(students, "students")} style={exportBtn}>
              Export Students
            </button>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div style={panelStyle}>
          <h2 style={{ color: "#66b3ff", marginBottom: 12 }}>💳 Payment Management</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Course</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Type</th>
                  <th style={th}>Status</th>
                  <th style={th}>Payment Proof</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td style={td}>{p.name}</td>
                    <td style={td}>{p.email}</td>
                    <td style={td}>{p.courseTitle || p.course}</td>
                    <td style={td}>₹{p.amount}</td>
                    <td style={td}>{p.isDemo ? "Demo" : "Full"}</td>
                    <td style={{ ...td, color: p.status === "approved" ? "#66ff99" : "#ffd166" }}>{p.status || "pending"}</td>
                   <td style={td}>
  {p.paymentProof ? (
    <button
      onClick={() => {
        try {
          if (p.paymentProof.startsWith("http")) {
            // ✅ Normal link, open in new tab
            window.open(p.paymentProof, "_blank", "noopener,noreferrer");
          } else if (p.paymentProof.startsWith("data:image")) {
            // 🖼 Base64 image – open it in a new tab safely
            const newWindow = window.open();
            newWindow!.document.write(`
              <html>
                <head><title>Payment Proof</title></head>
                <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
                  <img src="${p.paymentProof}" style="max-width:100%;max-height:100vh;border-radius:10px;" />
                </body>
              </html>
            `);
          } else {
            alert("⚠️ Invalid or missing payment proof format!");
          }
        } catch (err) {
          alert("⚠️ Error opening payment proof!");
          console.error("Payment Proof Error:", err);
        }
      }}
      style={{
        background: "rgba(102,179,255,0.15)",
        border: "1px solid #66b3ff",
        borderRadius: 6,
        padding: "6px 10px",
        cursor: "pointer",
        color: "#66b3ff",
        fontWeight: 600,
      }}
    >
      👁 View Proof
    </button>
  ) : (
    <span style={{ color: "#aaa" }}>No Proof</span>
  )}
</td>
                    <td style={td}>
                      {p.status === "pending" ? (
                        <>
                          <button onClick={() => approvePayment(p.id)} style={{ ...actionBtn, background: "#28a745" }}>
                            Approve
                          </button>
                          <button onClick={() => rejectPayment(p.id)} style={{ ...actionBtn, background: "#dc3545" }}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "#9b59b6", fontWeight: 700 }}>✔️ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 18, color: "gray" }}>
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => exportExcel(payments, "payments")} style={exportBtn}>
              Export Payments
            </button>
          </div>
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === "certificates" && (
        <div style={panelStyle}>
          <h2 style={{ color: "#66b3ff", marginBottom: 12 }}>📜 Certificates</h2>
          <p style={{ color: "#ccc" }}>Mark eligible students and export certificate list.</p>

          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Course</th>
                  <th style={th}>Eligible</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td style={td}>{s.name}</td>
                    <td style={td}>{s.email}</td>
                    <td style={td}>{s.course}</td>
                    <td style={td}>
                      <button onClick={() => markEligible(s)} style={{ ...actionBtn, background: "#0b63d0" }}>
                        Mark Eligible
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trainer Analytics */}
      {activeTab === "trainerAnalytics" && (
        <div style={panelStyle}>
          <h2 style={{ color: "#66b3ff", marginBottom: 12 }}>📊 Trainer Analytics</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={th}>Trainer</th>
                  <th style={th}>Email</th>
                  <th style={th}>Total Students</th>
                  <th style={th}>Demo</th>
                  <th style={th}>Full</th>
                  <th style={th}>Avg Attendance</th>
                  <th style={th}>Avg Score</th>
                  <th style={th}>Eligible</th>
                </tr>
              </thead>
              <tbody>
                {trainerStats.map((t) => (
                  <tr key={t.trainerEmail} style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td style={td}>{t.trainerName}</td>
                    <td style={td}>{t.trainerEmail}</td>
                    <td style={td}>{t.total}</td>
                    <td style={td}>{t.demo}</td>
                    <td style={td}>{t.full}</td>
                    <td style={td}>{t.avgAttendance}</td>
                    <td style={td}>{t.avgScore}</td>
                    <td style={td}>{t.eligibleCount}</td>
                  </tr>
                ))}
                {trainerStats.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 18, color: "gray" }}>
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Analytics */}
      {activeTab === "batchAnalytics" && (
        <div style={panelStyle}>
          <h2 style={{ color: "#66b3ff", marginBottom: 12 }}>🎯 Batch Analytics</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={th}>Batch</th>
                  <th style={th}>Trainer</th>
                  <th style={th}>Course</th>
                  <th style={th}>Total Students</th>
                  <th style={th}>Avg Attendance</th>
                  <th style={th}>Avg Score</th>
                  <th style={th}>Eligible</th>
                  <th style={th}>Action</th>
                </tr>
                </thead>
                <tbody>
                  {batchPerformance.map((b) => (
                    <tr key={b.batch} style={{ background: "rgba(255,255,255,0.02)" }}>
                      <td style={td}>{b.batch}</td>
                      <td style={td}>{b.trainer}</td>
                      <td style={td}>{b.course}</td>
                      <td style={td}>{b.totalStudents}</td>
                      <td style={td}>{b.avgAttendance}</td>
                      <td style={td}>{b.avgScore}</td>
                      <td style={td}>{b.eligibleCount}</td>
                      <td style={td}>
                <button
                  onClick={() => {
                    const filtered = students.filter((s) => s.batchName === b.batch);
                    setSelectedBatch(b);
                    setBatchStudents(filtered);
                    setShowModal(true);
                  }}
                  style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  View Students
                </button>
              </td>
            </tr>
          ))}
          {batchPerformance.length === 0 && (
            <tr>
              <td colSpan={8} style={{ padding: 18, color: "gray" }}>
                No batches found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* 🔹 Modal to show students in selected batch */}
    {showModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "#001133",
            borderRadius: 12,
            padding: 20,
            width: "90%",
            maxWidth: 900,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ color: "#66b3ff" }}>👥 Students in {selectedBatch?.batch}</h2>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Course</th>
                <th style={th}>Type</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {batchStudents.map((s) => (
                <tr key={s.id} style={{ background: "rgba(255,255,255,0.02)" }}>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.email}</td>
                  <td style={td}>{s.course}</td>
                  <td style={td}>{s.isDemo ? "Demo" : "Full"}</td>
                  <td style={td}>
                    <button
                      onClick={async () => {
                        if (!confirm(`Remove ${s.name}?`)) return;
                        await deleteDoc(doc(db, "students_info", s.id));
                        alert(`❌ ${s.name} removed.`);
                        setBatchStudents(batchStudents.filter((x) => x.id !== s.id));
                      }}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Dislink
                    </button>
                  </td>
                </tr>
              ))}
              {batchStudents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 18, color: "gray" }}>
                    No students in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: "#0b63d0",
                color: "white",
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

    </div>
  );
}

/* styles */
const panelStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "20px auto",
  background: "rgba(255,255,255,0.03)",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 6px 30px rgba(0,0,0,0.5)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
};

const theadStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  color: "#66b3ff",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontWeight: 700,
  color: "#cce6ff",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  color: "#e6eefb",
};

const actionBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  color: "white",
  border: "none",
  cursor: "pointer",
  marginRight: 8,
};

const exportBtn: React.CSSProperties = {
  background: "#0b63d0",
  color: "white",
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};
