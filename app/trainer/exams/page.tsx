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
} from "firebase/firestore";

export default function TrainerExamsPage() {
  const [trainerEmail] = useState<string>("trainer.python@vira.com");

  // 🔹 Trainer sets course & batch
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [batch, setBatch] = useState("");

  const [mcqs, setMcqs] = useState<any[]>([]);
  const [codingQs, setCodingQs] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // SUBMISSIONS STATE
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Load Trainer Exams
  useEffect(() => {
    async function load() {
      setLoading(true);

      const q1 = query(
        collection(db, "exams"),
        where("trainerEmail", "==", trainerEmail),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q1);
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setExams(arr);
      setLoading(false);
    }

    load();
  }, [trainerEmail]);

  // Create Exam
  const createExam = async () => {
    if (!title || !batch || !course) return alert("Fill all fields");
    if (mcqs.length === 0 && codingQs.length === 0)
      return alert("Add at least 1 question");

    await addDoc(collection(db, "exams"), {
      trainerEmail,
      // 🔹 Store course & batch for student-side filtering
      course,
      batch,
      title,
      mcqs,
      codingQs,
      createdAt: new Date(),
    });

    alert("Exam Created ✔");

    const q1 = query(
      collection(db, "exams"),
      where("trainerEmail", "==", trainerEmail),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q1);
    setExams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

    setTitle("");
    setBatch("");
    setCourse("");      // reset course input
    setMcqs([]);
    setCodingQs([]);
  };

  // Fetch Submissions + Detailed View Support
  const fetchSubmissions = async (examId: string) => {
    try {
      setSelectedExamId(examId);
      setSelectedSubmission(null);
      setLoadingSubmissions(true);

      const exam = exams.find((x) => x.id === examId);
      setSelectedExam(exam);

      const q2 = query(
        collection(db, "exam_submissions"),
        where("examId", "==", examId)
      );
      const snap = await getDocs(q2);

      const data = snap.docs.map((d) => {
        const dt = d.data();
        let ts = 0;

        if (dt.createdAt?.seconds) {
          ts = dt.createdAt.seconds * 1000;
        } else if (typeof dt.createdAt === "string") {
          ts = Date.parse(dt.createdAt) || 0;
        }

        return { id: d.id, ...dt, _ts: ts };
      });

      data.sort((a, b) => b._ts - a._ts);

      setSubmissions(data);
      setLoadingSubmissions(false);
    } catch (err) {
      console.error(err);
      alert("Error loading submissions");
      setLoadingSubmissions(false);
    }
  };

  // Add MCQ
  const addEmptyMcq = () =>
    setMcqs([...mcqs, { question: "", options: ["", ""], answerIndex: 0 }]);

  const addEmptyCoding = () =>
    setCodingQs([...codingQs, { prompt: "", stub: "" }]);

  return (
    <div style={{ padding: 30, color: "white", minHeight: "100vh" }}>
      <h2 style={{ color: "#66b3ff" }}>🧪 Trainer Exams - Create & Review</h2>

      {/* CREATE EXAM BLOCK */}
      <div style={card}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam Title"
          style={input}
        />

        {/* 🔹 Course input */}
        <div style={{ marginTop: 12 }}>
          <label style={{ color: "#bfe1ff" }}>Enter Course Name</label>
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Basic Python"
            style={input}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ color: "#bfe1ff" }}>Enter Batch Name</label>
          <input
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="Batch 1"
            style={input}
          />
        </div>

        {/* MCQs */}
        <div style={{ marginTop: 16 }}>
          <h4 style={{ color: "#66b3ff" }}>MCQs</h4>
          <button onClick={addEmptyMcq} style={btnSmall}>
            + Add MCQ
          </button>

          {mcqs.map((m, i) => (
            <div key={i} style={box}>
              <input
                value={m.question}
                onChange={(e) => {
                  const arr = [...mcqs];
                  arr[i].question = e.target.value;
                  setMcqs(arr);
                }}
                placeholder={`Question ${i + 1}`}
                style={input}
              />

              {m.options.map((opt: string, oi: number) => (
                <div key={oi} style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const arr = [...mcqs];
                      arr[i].options[oi] = e.target.value;
                      setMcqs(arr);
                    }}
                    placeholder={`Option ${oi + 1}`}
                    style={{ ...input, flex: 1 }}
                  />

                  <button
                    onClick={() => {
                      const arr = [...mcqs];
                      arr[i].answerIndex = oi;
                      setMcqs(arr);
                    }}
                    style={{
                      ...correctBtn,
                      background:
                        m.answerIndex === oi
                          ? "#0b63d0"
                          : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {m.answerIndex === oi ? "✔" : "Correct"}
                  </button>
                </div>
              ))}

              <button
                style={btnSmall}
                onClick={() => {
                  const arr = [...mcqs];
                  arr[i].options.push("");
                  setMcqs(arr);
                }}
              >
                + Add Option
              </button>
            </div>
          ))}
        </div>

        {/* CODING QUESTIONS */}
        <div style={{ marginTop: 16 }}>
          <h4 style={{ color: "#66b3ff" }}>Coding Questions</h4>
          <button style={btnSmall} onClick={addEmptyCoding}>
            + Add Coding Question
          </button>

          {codingQs.map((c, i) => (
            <div key={i} style={box}>
              <input
                value={c.prompt}
                onChange={(e) => {
                  const arr = [...codingQs];
                  arr[i].prompt = e.target.value;
                  setCodingQs(arr);
                }}
                placeholder={`Coding Prompt ${i + 1}`}
                style={input}
              />

              <input
                value={c.stub}
                onChange={(e) => {
                  const arr = [...codingQs];
                  arr[i].stub = e.target.value;
                  setCodingQs(arr);
                }}
                placeholder="Starter Code (optional)"
                style={{ ...input, marginTop: 6 }}
              />
            </div>
          ))}
        </div>

        <button onClick={createExam} style={btnPrimary}>
          Create Exam
        </button>
      </div>

      {/* EXAMS LIST */}
      <h3 style={{ marginTop: 32, color: "#66b3ff" }}>Your Exams</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        exams.map((ex) => (
          <div key={ex.id} style={examRow}>
            <div>
              <b>{ex.title}</b>
              <div style={{ color: "#aaa", fontSize: 13 }}>
                Course: {ex.course} • Batch: {ex.batch} • {ex.mcqs?.length} MCQs •{" "}
                {ex.codingQs?.length} Coding
              </div>
            </div>

            <button onClick={() => fetchSubmissions(ex.id)} style={btnPrimary}>
              Submissions
            </button>
          </div>
        ))
      )}

      {/* SUBMISSIONS TABLE */}
      {selectedExamId && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: "#66b3ff" }}>Submissions</h3>

          {submissions.length === 0 ? (
            <p>No submissions yet...</p>
          ) : (
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>MCQ %</th>
                  <th>Submitted</th>
                  <th>View Details</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} style={tbodyRow}>
                    <td>{s.studentName}</td>
                    <td>{s.studentEmail}</td>
                    <td>{s.mcqPercentage}%</td>
                    <td>{new Date(s._ts).toLocaleString()}</td>

                    <td>
                      <button
                        onClick={() => setSelectedSubmission(s)}
                        style={btnSmall}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* DETAILED SUBMISSION POPUP */}
      {selectedSubmission && (
        <div style={popup}>
          <div style={popupBox}>
            <h3 style={{ color: "#66b3ff" }}>
              Submission – {selectedSubmission.studentName}
            </h3>

            {/* MCQ Details */}
            <h4 style={{ marginTop: 20 }}>MCQ Answers</h4>
            {selectedExam?.mcqs?.map((q: any, i: number) => {
              const studentAns = selectedSubmission.mcqAnswers[i];
              const correct = q.answerIndex;

              return (
                <div key={i} style={detailBox}>
                  <b>
                    Q{i + 1}: {q.question}
                  </b>

                  <p>
                    <span style={{ color: "#ccc" }}>Student Answer:</span>{" "}
                    <b
                      style={{
                        color:
                          studentAns === correct ? "#4caf50" : "#ff5252",
                      }}
                    >
                      {q.options[studentAns] || "Not Answered"}
                    </b>
                  </p>

                  <p>
                    <span style={{ color: "#ccc" }}>Correct Answer:</span>{" "}
                    <b style={{ color: "#4caf50" }}>{q.options[correct]}</b>
                  </p>
                </div>
              );
            })}

            {/* Coding Details */}
            <h4 style={{ marginTop: 20 }}>Coding Answers</h4>
            {selectedExam?.codingQs?.map((c: any, i: number) => (
              <div key={i} style={detailBox}>
                <b>
                  Q{i + 1}: {c.prompt}
                </b>
                <pre style={codeBox}>
                  {selectedSubmission.codingAnswers[i] || "(empty)"}
                </pre>
              </div>
            ))}

            <button
              onClick={() => setSelectedSubmission(null)}
              style={btnPrimary}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   STYLE COMPONENTS
============================ */

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
};

const btnPrimary = {
  padding: "8px 14px",
  borderRadius: 6,
  background: "#0b63d0",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const btnSmall = {
  padding: "6px 10px",
  background: "rgba(255,255,255,0.15)",
  borderRadius: 6,
  border: "none",
  color: "white",
  cursor: "pointer",
};

const correctBtn = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  color: "white",
  cursor: "pointer",
};

const card = {
  marginTop: 20,
  padding: 18,
  background: "rgba(255,255,255,0.05)",
  borderRadius: 10,
};

const examRow = {
  marginTop: 10,
  padding: 12,
  background: "rgba(255,255,255,0.05)",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = {
  background: "rgba(255,255,255,0.2)",
};

const tbodyRow = {
  background: "rgba(255,255,255,0.08)",
  textAlign: "center" as const,
};

const box = {
  marginTop: 10,
  padding: 10,
  background: "rgba(255,255,255,0.1)",
  borderRadius: 8,
};

const popup = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
};

const popupBox = {
  width: "90%",
  maxWidth: 900,
  background: "rgba(255,255,255,0.08)",
  padding: 20,
  borderRadius: 10,
  maxHeight: "90vh",
  overflowY: "auto" as const,
};

const detailBox = {
  marginTop: 12,
  padding: 12,
  background: "rgba(255,255,255,0.1)",
  borderRadius: 6,
};

const codeBox = {
  background: "#000",
  padding: 10,
  borderRadius: 6,
  color: "#8aff8a",
  whiteSpace: "pre-wrap" as const,
};
