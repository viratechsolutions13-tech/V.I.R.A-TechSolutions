// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import TrainerNavbar from "../components/TrainerNavbar";

export default function TrainerClassesPage() {
  // 🧑‍🏫 Trainer email from localStorage or default (for testing)
  const [trainerEmail] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("trainerEmail") || "trainer.python@vira.com"
      : "trainer.python@vira.com"
  );

  // States
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<any[]>([]);

  /* -----------------------------------------------------
     LOAD UPLOADED CLASSES
  ------------------------------------------------------ */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(
          collection(db, "live_classes"),
          where("trainerEmail", "==", trainerEmail),
          orderBy("createdAt", "desc")
        )
      );
      setUploaded(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, [trainerEmail]);

  /* -----------------------------------------------------
     UPLOAD LIVE CLASS
  ------------------------------------------------------ */
  async function uploadClass() {
    if (!title || !link || !batchName || !course) {
      return alert("⚠️ Please fill all fields!");
    }

    // 🧠 Normalize all inputs (so case doesn’t matter)
    const cleanBatch = batchName.trim().toLowerCase();
    const cleanCourse = course.trim().toLowerCase();

    setLoading(true);

    try {
      await addDoc(collection(db, "live_classes"), {
        title,
        link,
        trainerEmail,
        course: cleanCourse,
        batch: cleanBatch,
        createdAt: serverTimestamp(),
      });

      alert("✅ Live class uploaded successfully!");
      setTitle("");
      setLink("");
      setBatchName("");
      setCourse("");

      // Refresh uploaded list
      const snap = await getDocs(
        query(
          collection(db, "live_classes"),
          where("trainerEmail", "==", trainerEmail),
          orderBy("createdAt", "desc")
        )
      );
      setUploaded(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed!");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #001133, #000814)",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <TrainerNavbar />

      <div style={{ padding: "40px" }}>
        <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
          🎥 Trainer Live Class Manager
        </h1>

        {/* Upload Form */}
        <div style={formBox}>
          <input
            type="text"
            placeholder="Class Title (e.g., Python Basics)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Google Meet / Zoom Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Course (e.g., Basic Python)"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Batch Name (e.g., Batch 1)"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            style={inputStyle}
          />

          <button onClick={uploadClass} disabled={loading} style={btnStyle}>
            {loading ? "Uploading…" : "Upload Live Class"}
          </button>
        </div>

        {/* Uploaded Classes */}
        <div style={tableBox}>
          <h2 style={{ color: "#66b3ff" }}>📚 Uploaded Classes</h2>

          {uploaded.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa" }}>
              No classes uploaded yet.
            </p>
          ) : (
            <table style={table}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.1)" }}>
                  <th style={th}>Title</th>
                  <th style={th}>Course</th>
                  <th style={th}>Batch</th>
                  <th style={th}>Link</th>
                  <th style={th}>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {uploaded.map((cls, i) => (
                  <tr key={i} style={row}>
                    <td style={td}>{cls.title}</td>
                    <td style={td}>{cls.course}</td>
                    <td style={td}>{cls.batch}</td>
                    <td style={td}>
                      <a
                        href={cls.link}
                        target="_blank"
                        style={{ color: "#66b3ff", textDecoration: "underline" }}
                      >
                        Join Class
                      </a>
                    </td>
                    <td style={td}>
                      {cls.createdAt?.seconds
                        ? new Date(cls.createdAt.seconds * 1000).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- STYLES ------------------------ */
const formBox = {
  background: "rgba(255,255,255,0.05)",
  padding: 30,
  borderRadius: 15,
  width: "100%",
  maxWidth: 700,
  margin: "40px auto",
  boxShadow: "0 0 20px rgba(11,99,208,0.3)",
};

const tableBox = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 15,
  padding: 20,
  marginTop: 40,
  boxShadow: "0 0 20px rgba(11,99,208,0.3)",
};

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  marginBottom: 15,
};

const btnStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(90deg, #0b63d0, #007bff)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const th = {
  padding: 12,
  color: "#66b3ff",
};

const td = {
  padding: "10px 12px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const row = {
  background: "rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

