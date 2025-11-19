// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function ExamResultPage() {
  const router = useRouter();
  const { examId } = useParams();
  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    if (!examId) return;
    (async () => {
      const snap = await getDoc(doc(db, "exam_results", examId as string));
      if (snap.exists()) {
        setExam(snap.data());
      }
    })();
  }, [examId]);

  if (!exam)
    return (
      <div style={center}>
        <p style={{ color: "#66b3ff" }}>Loading exam result…</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#000b1f,#001133)",
        color: "white",
        padding: 30,
      }}
    >
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        📊 Exam Result
      </h1>

      <div style={resultBox}>
        <p><b>Exam Title:</b> {exam.title}</p>
        <p><b>Email:</b> {exam.email}</p>
        <p><b>Percent:</b> {exam.percent}%</p>
        <p><b>Score:</b> {exam.score}</p>
        <p><b>Submitted At:</b> {exam.submittedAt}</p>

        <p>
          <b>Status:</b>{" "}
          {exam.percent >= 50 ? "✅ Passed" : "❌ Failed"}
        </p>

        <button onClick={() => router.back()} style={button}>
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* Styles */
const center = {
  display: "flex",
  minHeight: "100vh",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  flexDirection: "column",
};

const button = {
  padding: "10px 20px",
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: 20,
};

const resultBox = {
  background: "rgba(255,255,255,0.08)",
  padding: 30,
  borderRadius: 12,
  width: 400,
  margin: "0 auto",
  marginTop: 40,
  boxShadow: "0 0 15px rgba(0,0,0,0.3)",
};

