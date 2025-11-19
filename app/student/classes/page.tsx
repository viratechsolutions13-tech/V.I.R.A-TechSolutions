"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function StudentClassesPage() {
  const email =
    typeof window !== "undefined" ? localStorage.getItem("studentEmail") : null;

  const [student, setStudent] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize helper (case-insensitive)
  const normalize = (v: any) =>
    typeof v === "string" ? v.toLowerCase().trim() : "";

  /* ----------------------------
     STEP 1: LOAD STUDENT INFO
  ----------------------------- */
  useEffect(() => {
    if (!email) return;

    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "students_info"), where("email", "==", email))
        );

        if (!snap.empty) {
          setStudent(snap.docs[0].data());
        }
      } catch (error) {
        console.error("Error loading student:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  /* ----------------------------
     STEP 2: LOAD LIVE CLASSES
  ----------------------------- */
  useEffect(() => {
    if (!student) return;

    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "live_classes"), orderBy("createdAt", "desc"))
        );

        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const sBatch = normalize(student.batchName || student.batch);
        const sCourse = normalize(student.course);
        const sTrainer = normalize(
          student.trainerEmail || student.trainerEmailAssigned
        );

        // ✅ Match trainer + batch + course
        list = list.filter((cls) => {
          const cBatch = normalize(cls.batch);
          const cCourse = normalize(cls.course);
          const cTrainer = normalize(cls.trainerEmail);
          return (
            cBatch === sBatch &&
            cCourse === sCourse &&
            cTrainer === sTrainer
          );
        });

        // ✅ Auto-hide classes older than 2 hours
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours

        list = list.filter((cls) => {
          const ts = cls.createdAt?.seconds
            ? cls.createdAt.seconds * 1000
            : Date.parse(cls.createdAt);
          return now - ts < twoHours; // keep only recent ones
        });

        setClasses(list);
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    })();
  }, [student]);

  /* ----------------------------
     STEP 3: UI RENDERING
  ----------------------------- */
  if (loading)
    return (
      <div style={center}>
        <p>Loading classes…</p>
      </div>
    );

  if (!student)
    return (
      <div style={center}>
        <h3>No student data found</h3>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        color: "white",
        padding: 30,
      }}
    >
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        📚 Your Live Classes
      </h1>

      {classes.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: 40 }}>
          No active live classes for your batch right now.
        </p>
      ) : (
        classes.map((cls) => (
          <div
            key={cls.id}
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: 20,
              marginTop: 20,
              borderRadius: 10,
              boxShadow: "0 0 15px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ color: "#66b3ff" }}>{cls.title}</h3>
            <p style={{ color: "#ccc", marginTop: 6 }}>
              Course: {cls.course} <br />
              Batch: {cls.batch} <br />
              Trainer: {cls.trainerEmail}
            </p>

            <a
              href={cls.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 10,
                display: "inline-block",
                background: "#0b63d0",
                padding: "8px 14px",
                borderRadius: 8,
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.background = "#007bff")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.background = "#0b63d0")
              }
            >
              🎥 Join Class
            </a>

            <p style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
              Uploaded:&nbsp;
              {cls.createdAt?.seconds
                ? new Date(cls.createdAt.seconds * 1000).toLocaleString()
                : "—"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

/* ----------------------------
   Styles
----------------------------- */
const center = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
};
