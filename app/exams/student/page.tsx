"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../../firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function StudentExamsList() {
  const [exams, setExams] = useState<any[]>([]);
  const [course, setCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load() {
      setLoading(true);
      const user = auth.currentUser;
      if(!user) {
        const promptEmail = prompt("Enter your registered email:");
        if(!promptEmail) { setLoading(false); return; }
        // try to find student's course by email
        const q = query(collection(db, "students_info"), where("email","==", promptEmail));
        const snap = await getDocs(q);
        if(!snap.empty) {
          setCourse(snap.docs[0].data().course);
        } else {
          setCourse(null);
        }
      } else {
        const q = query(collection(db, "students_info"), where("email","==", user.email));
        const snap = await getDocs(q);
        if(!snap.empty) setCourse(snap.docs[0].data().course);
      }
      setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    async function loadExams() {
      if(!course) return;
      const q = query(collection(db, "exams"), where("course","==",course), orderBy("createdAt","desc"));
      const snap = await getDocs(q);
      setExams(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    }
    loadExams();
  },[course]);

  if(loading) return <div style={{padding:24,color:"#66b3ff"}}>Loading exams...</div>;

  return (
    <div style={{padding:24, minHeight:"100vh", background:"linear-gradient(#000814,#001133)", color:"white"}}>
      <h1 style={{color:"#66b3ff"}}>📝 Available Exams</h1>
      <p>Course: <b>{course || "Not found"}</b></p>

      {exams.length===0 ? <p>No exams for your course currently.</p> : exams.map(ex=>(
        <div key={ex.id} style={{background:"rgba(255,255,255,0.03)", padding:12, borderRadius:8, marginTop:8}}>
          <strong>{ex.title}</strong> — {ex.durationMin} min
          <div style={{marginTop:8}}>
            <a href={`/exams/take/${ex.id}`} style={{padding:"6px 10px", background:"#0b63d0", color:"white", borderRadius:6, textDecoration:"none"}}>Take Exam</a>
          </div>
        </div>
      ))}
    </div>
  );
}
