"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function TrainerReviewPage() {
  const [examId, setExamId] = useState<string | null>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // read examId from URL query
    const params = new URLSearchParams(window.location.search);
    const e = params.get("examId");
    setExamId(e);
  },[]);

  useEffect(()=>{
    if(!examId) return;
    async function fetchSubs() {
      setLoading(true);
      const q = query(collection(db,"exam_submissions"), where("examId","==", examId));
      const snap = await getDocs(q);
      setSubs(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      setLoading(false);
    }
    fetchSubs();
  },[examId]);

  async function gradeSubmission(subId:string, marks:number) {
    const docRef = doc(db, "exam_submissions", subId);
    await updateDoc(docRef, { finalScore: marks, gradedBy: "trainer", gradedAt: new Date() });
    alert("Saved grade.");
    // refresh
    const q = query(collection(db,"exam_submissions"), where("examId","==", examId));
    const snap = await getDocs(q);
    setSubs(snap.docs.map(d=>({ id:d.id, ...d.data() })));
  }

  if(loading) return <div style={{padding:24,color:"#66b3ff"}}>Loading submissions...</div>;

  return (
    <div style={{padding:24, minHeight:"100vh", background:"linear-gradient(#000814,#001133)", color:"white"}}>
      <h1 style={{color:"#66b3ff"}}>📝 Review Submissions</h1>
      {!examId ? <p>Missing examId in URL</p> : subs.length===0 ? <p>No submissions yet.</p> : subs.map(s=>(
        <div key={s.id} style={{background:"rgba(255,255,255,0.03)", padding:12, borderRadius:8, marginTop:12}}>
          <p><b>{s.studentName}</b> — {s.studentEmail}</p>
          <p>Auto-score (MCQ): {s.autoScore}</p>
          <p>Final grade: {s.finalScore ?? "Not graded"}</p>

          <div style={{marginTop:8}}>
            <h4>Answers</h4>
            {s.answers.map((a:any, i:number)=>(
              <div key={i} style={{padding:8, borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <p><b>Q:</b> {a.qId} — type: {a.type}</p>
                {a.type==="mcq" ? (
                  <p>Selected index: {a.selectedIndex} — marksObtained: {a.marksObtained}</p>
                ) : (
                  <div>
                    <p>Code:</p>
                    <pre style={{background:"#000", color:"#0f0", padding:8, borderRadius:6, overflowX:"auto"}}>{a.code}</pre>
                    <label>Assign marks (coding): </label>
                    <input type="number" defaultValue={a.marksObtained ?? 0} id={`mark-${s.id}-${i}`} style={{marginLeft:8}} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{marginTop:10}}>
            <button onClick={async ()=> {
              // compute total: autoScore + sum coding marks entered
              let codingSum = 0;
              s.answers.forEach((a:any,i:number)=>{
                if(a.type==="coding"){
                  const el:any = document.getElementById(`mark-${s.id}-${i}`);
                  const val = Number(el?.value || 0);
                  codingSum += val;
                }
              });
              const total = (s.autoScore || 0) + codingSum;
              await gradeSubmission(s.id, total);
            }} style={{padding:"8px 12px", background:"#0b63d0", borderRadius:6}}>Save Grade</button>
          </div>
        </div>
      ))}
    </div>
  );
}
