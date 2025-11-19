// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
} from "firebase/firestore";

export default function StudentExamsPage() {
  const [studentEmail] = useState<string>("komalraj4762@gmail.com");
  const [studentName] = useState<string>("Komal Raj");

  const [studentCourse, setStudentCourse] = useState<string>("");
  const [studentBatch, setStudentBatch] = useState<string>("");

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  // Normalize helper (for safe string comparisons)
  const normalize = (v: string) => (v ? v.toLowerCase().trim() : "");

  // 🕒 Format Firestore Timestamp or ISO String safely
  const formatDate = (date: any) => {
    if (!date) return "—";
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return "—";
  };

  /* -------------------------------------------
     STEP 1: Load Student Info and Exams
  -------------------------------------------- */
  useEffect(() => {
    async function loadStudentAndExams() {
      try {
        setLoading(true);

        // Load student info
        const infoSnap = await getDocs(
          query(collection(db, "students_info"), where("email", "==", studentEmail))
        );

        if (infoSnap.empty) {
          console.error("No student found for:", studentEmail);
          setLoading(false);
          return;
        }

        const stu = infoSnap.docs[0].data();
        const course = normalize(stu.course);
        const batch = normalize(stu.batchName || stu.batch);

        setStudentCourse(course);
        setStudentBatch(batch);

        // Load all exams
        const allExamsSnap = await getDocs(
          query(collection(db, "exams"), orderBy("createdAt", "desc"))
        );

        const allExams = allExamsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Filter exams by course + batch
        const matches = allExams.filter((exam) => {
          const examCourse = normalize(exam.course);
          const examBatch = normalize(exam.batch);
          return examCourse === course && examBatch === batch;
        });

        setExams(matches);
      } catch (err) {
        console.error("Error loading exams:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentAndExams();
  }, [studentEmail]);

  /* -------------------------------------------
     STEP 2: Start Exam
  -------------------------------------------- */
  const startExam = (exam: any) => {
    const mcqAnswers = (exam.mcqs || []).map(() => null);
    const codingAnswers = (exam.codingQs || []).map(() => "");
    setSelectedExam({ ...exam, mcqAnswers, codingAnswers });
  };

  /* -------------------------------------------
     STEP 3: Submit Exam (Auto Save Results)
  -------------------------------------------- */
  const submitExam = async () => {
    if (!selectedExam) return;

    const mcqs = selectedExam.mcqs || [];
    const answers = selectedExam.mcqAnswers || [];

    let correct = 0;
    for (let i = 0; i < mcqs.length; i++) {
      if (answers[i] !== null && answers[i] === mcqs[i].answerIndex) {
        correct++;
      }
    }

    const mcqPercentage =
      mcqs.length === 0 ? 0 : Math.round((correct / mcqs.length) * 100);
    const totalMarks = mcqs.length;

    const payload = {
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      trainerEmail: selectedExam.trainerEmail,
      course: selectedExam.course,
      batch: selectedExam.batch,
      studentEmail,
      studentName,
      mcqAnswers: selectedExam.mcqAnswers,
      codingAnswers: selectedExam.codingAnswers,
      mcqPercentage,
      totalMarks,
      codingPending: true,
      createdAt: new Date(),
    };

    try {
      // Save detailed submission
      await addDoc(collection(db, "exam_submissions"), payload);

      // Save summary result
      await addDoc(collection(db, "exam_results"), {
        email: studentEmail,
        name: studentName,
        title: selectedExam.title,
        examId: selectedExam.id,
        course: selectedExam.course,
        batch: selectedExam.batch,
        trainer: selectedExam.trainerEmail,
        score: correct,
        totalMarks,
        percent: mcqPercentage,
        submittedAt: new Date(),
      });

      alert("✅ Exam submitted successfully!");
      setSelectedExam(null);
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("❌ Failed to submit exam. Try again.");
    }
  };

  /* -------------------------------------------
     STEP 4: Render UI
  -------------------------------------------- */
  return (
    <div
      style={{
        padding: 30,
        color: "white",
        minHeight: "100vh",
        background: "linear-gradient(180deg,#001133,#000814)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h2 style={{ color: "#66b3ff", textAlign: "center" }}>
        📚 Exams for Your Course & Batch
      </h2>

      {/* Exams List */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: 40 }}>Loading exams...</p>
      ) : exams.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: 40 }}>
          No exams available for your batch or course.
        </p>
      ) : (
        exams.map((ex) => (
          <div key={ex.id} style={examCard}>
            <b style={{ fontSize: 18 }}>{ex.title}</b>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
              Course: {ex.course} <br />
              Batch: {ex.batch} <br />
              Created: {formatDate(ex.createdAt)} <br />
              {ex.mcqs?.length || 0} MCQs • {ex.codingQs?.length || 0} Coding
            </div>
            <button onClick={() => startExam(ex)} style={btnPrimary}>
              Start Exam
            </button>
          </div>
        ))
      )}

      {/* Selected Exam */}
      {selectedExam && (
        <div style={examBox}>
          <h3 style={{ color: "#66b3ff" }}>{selectedExam.title}</h3>

          {/* MCQs */}
          {selectedExam.mcqs.map((m: any, i: number) => (
            <div key={i} style={qBlock}>
              <b>
                {i + 1}. {m.question}
              </b>
              {m.options.map((opt: string, oi: number) => (
                <label key={oi} style={{ display: "block", marginTop: 4 }}>
                  <input
                    type="radio"
                    name={`mcq-${i}`}
                    onChange={() => {
                      const copy = { ...selectedExam };
                      copy.mcqAnswers[i] = oi;
                      setSelectedExam(copy);
                    }}
                    style={{ marginRight: 6 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          {/* Coding Questions */}
          {selectedExam.codingQs.map((c: any, i: number) => (
            <div key={i} style={qBlock}>
              <b>
                Coding Q{i + 1}: {c.prompt}
              </b>
              <textarea
                onChange={(e) => {
                  const copy = { ...selectedExam };
                  copy.codingAnswers[i] = e.target.value;
                  setSelectedExam(copy);
                }}
                style={textarea}
              />
            </div>
          ))}

          <button onClick={submitExam} style={btnSubmit}>
            Submit Exam
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   STYLES
------------------------------- */
const examCard = {
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 10,
  marginTop: 20,
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const btnPrimary = {
  marginTop: 10,
  background: "#0b63d0",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const examBox = {
  marginTop: 30,
  background: "rgba(255,255,255,0.05)",
  padding: 20,
  borderRadius: 10,
};

const qBlock = {
  marginTop: 15,
  background: "rgba(255,255,255,0.07)",
  padding: 12,
  borderRadius: 8,
};

const textarea = {
  width: "100%",
  minHeight: 120,
  background: "#000",
  color: "white",
  borderRadius: 6,
  padding: 10,
  marginTop: 8,
  border: "1px solid rgba(255,255,255,0.2)",
};

const btnSubmit = {
  marginTop: 20,
  background: "linear-gradient(90deg,#0b63d0,#007bff)",
  border: "none",
  color: "white",
  fontWeight: 600,
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

