"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../../firebaseConfig";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function TakeExamPage({ params }: { params: { examId: string } }) {
  const { examId } = params;
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(()=>{
    async function load() {
      setLoading(true);
      const docRef = doc(db, "exams", examId);
      const snap = await getDoc(docRef);
      if(!snap.exists()) { alert("Exam not found"); setLoading(false); return; }
      const data = snap.data();
      setExam(data);

      // start timer
      const start = Date.now();
      setStartedAt(start);
      setTimeLeft((data.durationMin || 30) * 60); // seconds
      setLoading(false);
    }
    load();
  },[examId]);

  // countdown
  useEffect(()=>{
    if(timeLeft === null) return;
    if(timeLeft <= 0) {
      handleSubmit(); // auto submit
      return;
    }
    const t = setInterval(()=> setTimeLeft((s)=> (s!==null? s-1 : s)),1000);
    return ()=>clearInterval(t);
  },[timeLeft]);

  function setMCQ(qId:string, idx:number) {
    setAnswers(a=>({ ...a, [qId]: { type:"mcq", selectedIndex: idx } }));
  }
  function setCode(qId:string, code:string) {
    setAnswers(a=>({ ...a, [qId]: { type:"coding", code } }));
  }

  async function handleSubmit() {
    if(!exam) return;
    const user = auth.currentUser;
    const studentEmail = user?.email || prompt("Enter your email for submission:");
    const studentName = user?.displayName || studentEmail;
    // auto-score MCQs
    let autoScore = 0;
    const answersArr: any[] = [];
    exam.questions.forEach((q:any)=>{
      const ans = answers[q.id];
      if(q.type==="mcq") {
        const sel = ans?.selectedIndex ?? -1;
        const got = sel === q.answerIndex ? (q.marks || 1) : 0;
        autoScore += got;
        answersArr.push({ qId: q.id, type: "mcq", selectedIndex: sel, marksObtained: got });
      } else {
        // coding
        answersArr.push({ qId: q.id, type: "coding", code: ans?.code || "", marksObtained: null });
      }
    });

    // Save submission
    try {
      await addDoc(collection(db, "exam_submissions"), {
        examId,
        examTitle: exam.title,
        studentEmail,
        studentName,
        startedAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        answers: answersArr,
        autoScore,
        finalScore: null,
        gradedBy: null,
      });
      alert("✅ Exam submitted. MCQs auto-scored. Coding will be graded by trainer.");
      router.push("/student");
    } catch (err) {
      console.error(err);
      alert("Failed to submit exam.");
    }
  }

  if(loading) return <div style={{padding:24,color:"#66b3ff"}}>Loading exam...</div>;
  if(!exam) return null;

  return (
    <div style={{padding:24, minHeight:"100vh", background:"linear-gradient(#000814,#001133)", color:"white"}}>
      <h1 style={{color:"#66b3ff"}}>{exam.title}</h1>
      <p>Duration: {exam.durationMin} minutes</p>
      <p>Time left: {timeLeft !== null ? `${Math.floor(timeLeft/60)}m ${timeLeft%60}s` : "—"}</p>

      <div style={{marginTop:16}}>
        {exam.questions.map((q:any, idx:number)=>(
          <div key={q.id} style={{background:"rgba(255,255,255,0.03)", padding:12, borderRadius:8, marginTop:10}}>
            <strong>{idx+1}. {q.text}</strong>
            {q.type==="mcq" ? (
              <div style={{marginTop:8}}>
                {q.options.map((opt:any, i:number)=>(
                  <label key={i} style={{display:"block", marginTop:6}}>
                    <input type="radio" name={q.id} checked={answers[q.id]?.selectedIndex===i} onChange={()=>setMCQ(q.id,i)} /> {" "}
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <div style={{marginTop:8}}>
                <p style={{color:"#cfcfcf"}}>{q.instructions||"Provide code below"}</p>
                <textarea value={answers[q.id]?.code || ""} onChange={e=>setCode(q.id,e.target.value)} style={{width:"100%", minHeight:140, background:"rgba(0,0,0,0.4)", color:"white", borderRadius:8}} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{marginTop:18}}>
        <button onClick={handleSubmit} style={{padding:"10px 18px", background:"#0b63d0", borderRadius:8, color:"white"}}>Submit Exam</button>
      </div>
    </div>
  );
}
