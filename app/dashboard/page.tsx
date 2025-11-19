"use client";

import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentAndPayment() {
      try {
        // Fetch latest student info
        const studentSnap = await getDocs(query(collection(db, "students_info")));
        if (studentSnap.empty) return;
        const studentData = studentSnap.docs[studentSnap.docs.length - 1].data();
        setStudent(studentData);

        // Fetch payment record for this student
        const paySnap = await getDocs(
          query(
            collection(db, "payments_pending"),
            where("email", "==", studentData.email)
          )
        );
        if (!paySnap.empty) {
          const payData = paySnap.docs[0].data();
          setPayment(payData);

          // Handle demo expiry
          if (payData.isDemo && payData.expiresAt) {
            const expiryDate = new Date(payData.expiresAt.seconds * 1000);
            const interval = setInterval(() => {
              const now = new Date();
              const diff = expiryDate.getTime() - now.getTime();
              if (diff <= 0) {
                clearInterval(interval);
                alert("⚠️ Your demo access has expired. Please enroll in the full course.");
                router.push("/login");
              } else {
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
              }
            }, 1000);
            return () => clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error loading student dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentAndPayment();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000814",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <h2>⏳ Loading your dashboard...</h2>
      </div>
    );
  }

  if (!payment) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000814",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h2>❌ No active payment found.</h2>
        <p style={{ color: "#66b3ff" }}>
          Please complete your payment to access your course.
        </p>
        <button
          onClick={() => router.push("/student/payment")}
          style={{
            marginTop: "20px",
            background: "linear-gradient(90deg, #0b63d0, #007bff)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          💳 Go to Payment
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #001133, #000814 80%)",
        padding: "40px",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <h1 style={{ textAlign: "center", color: "#66b3ff" }}>
        🎓 Welcome, {student?.name || "Student"}
      </h1>
      <p style={{ textAlign: "center", color: "#ccc" }}>
        V.I.R.A Tech Solutions — Learn. Build. Achieve.
      </p>

      {/* Dashboard Card */}
      <div
        style={{
          margin: "40px auto",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 0 25px rgba(11,99,208,0.4)",
          maxWidth: "600px",
        }}
      >
        <h2 style={{ color: "#66b3ff", marginBottom: "20px" }}>📘 Course Info</h2>

        <p><strong>Course:</strong> {payment.courseTitle}</p>
        <p><strong>Payment Status:</strong> {payment.status}</p>
        <p><strong>Type:</strong> {payment.isDemo ? "1-Day Demo" : "Full Course"}</p>
        <p><strong>Amount Paid:</strong> ₹{payment.amount}</p>

        {payment.isDemo && timeLeft && (
          <p style={{ marginTop: "15px", color: "#ffcc00" }}>
            ⏳ Demo Access Expires In: <strong>{timeLeft}</strong>
          </p>
        )}

        {payment.status === "pending" && (
          <p style={{ color: "#ffa500", marginTop: "15px" }}>
            ⏳ Waiting for admin approval...
          </p>
        )}

        {payment.status === "approved" && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#00ff99" }}>✅ Access Granted</h3>
            <p>Start learning your course from today!</p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg, #0b63d0, #007bff)",
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}
