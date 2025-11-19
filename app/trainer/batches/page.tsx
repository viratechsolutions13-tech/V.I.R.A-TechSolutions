"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function TrainerBatchesPage() {
  const [trainerEmail] = useState<string>("trainer.python@vira.com");
  const [trainerCourse] = useState<string>("Basic Python");
  const [batchData, setBatchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Get students who belong to trainer’s course
      const studentSnap = await getDocs(
        query(collection(db, "students_info"), where("course", "==", trainerCourse))
      );

      if (studentSnap.empty) {
        setBatchData([]);
        setLoading(false);
        return;
      }

      // Group by batch
      const grouped: Record<string, any[]> = {};
      studentSnap.docs.forEach((doc) => {
        const stu = doc.data();
        const batchName = stu.batchName || stu.batch || "Unassigned";
        if (!grouped[batchName]) grouped[batchName] = [];
        grouped[batchName].push(stu);
      });

      const formatted = Object.keys(grouped).map((batch) => ({
        name: batch,
        students: grouped[batch],
      }));

      setBatchData(formatted);
      setLoading(false);
    }

    loadData();
  }, [trainerCourse]);

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
      <h2 style={{ color: "#66b3ff", textAlign: "center", marginBottom: 30 }}>
        📘 {trainerCourse} — Trainer Dashboard
      </h2>

      {loading ? (
        <p style={{ textAlign: "center", color: "#66b3ff" }}>Loading students...</p>
      ) : batchData.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>No students found.</p>
      ) : (
        batchData.map((batch) => (
          <div key={batch.name} style={batchBox}>
            <h3 style={{ color: "#66b3ff" }}>
              🧩 Batch: {batch.name} ({batch.students.length} Students)
            </h3>
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {batch.students.map((stu: any, i: number) => (
                  <tr key={i} style={tbodyRow}>
                    <td>{stu.name}</td>
                    <td>{stu.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------- 🔹 Styles ---------- */
const batchBox = {
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "rgba(255,255,255,0.05)",
  borderRadius: 8,
  marginTop: 10,
};

const theadRow = {
  background: "rgba(255,255,255,0.1)",
  color: "#66b3ff",
};

const tbodyRow = {
  textAlign: "center" as const,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};
