"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import Image from "next/image";

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState("");

  // 🧩 Real-time listener for payments
  useEffect(() => {
    const q = query(collection(db, "payments_pending"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPayments(data);
      setLoading(false);
      setNotif("🔔 Live data synced with Firestore!");
      setTimeout(() => setNotif(""), 3000);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Approve / ❌ Reject Payment
  async function updateStatus(id: string, status: "approved" | "rejected") {
    await updateDoc(doc(db, "payments_pending", id), { status });
    alert(`Payment ${status.toUpperCase()} successfully.`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #001133, #000814 80%)",
        padding: "40px 20px",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ color: "#66b3ff", textAlign: "center", marginBottom: "20px" }}>
          🏢 V.I.R.A Admin Dashboard (Live)
        </h1>

        {notif && (
          <div
            style={{
              textAlign: "center",
              background: "#0b63d0",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {notif}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center" }}>⏳ Loading payments...</p>
        ) : payments.length === 0 ? (
          <p style={{ textAlign: "center", color: "gray" }}>No payments found.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  transition: "0.3s",
                  borderLeft:
                    p.status === "approved"
                      ? "4px solid #00ff99"
                      : p.status === "rejected"
                      ? "4px solid #ff4d4d"
                      : "4px solid #ffd166",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  {/* Left Side Info */}
                  <div style={{ flex: "1 1 320px" }}>
                    <h3 style={{ color: "#66b3ff" }}>{p.name}</h3>
                    <p>
                      <strong>Email:</strong> {p.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {p.phone}
                    </p>
                    <p>
                      <strong>Course:</strong> {p.courseTitle}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{p.amount}
                    </p>
                    <p>
                      <strong>Type:</strong> {p.isDemo ? "🎓 Demo (1-Day)" : "Full Course"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color:
                            p.status === "approved"
                              ? "#00ff99"
                              : p.status === "rejected"
                              ? "#ff6666"
                              : "#ffd166",
                        }}
                      >
                        {p.status?.toUpperCase() || "PENDING"}
                      </span>
                    </p>
                    {p.isDemo && p.expiresAt && (
                      <p style={{ color: "#ffcc00" }}>
                        Expires:{" "}
                        {p.expiresAt?.seconds
                          ? new Date(p.expiresAt.seconds * 1000).toLocaleString()
                          : new Date(p.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Right Side Screenshot */}
                  <div style={{ flex: "1 1 300px", textAlign: "center" }}>
                    {p.paymentScreenshot ? (
                      <a
                        href={p.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={p.paymentScreenshot}
                          alt="Payment Screenshot"
                          width={300}
                          height={200}
                          style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "2px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                          }}
                        />
                      </a>
                    ) : (
                      <p style={{ color: "gray" }}>No screenshot uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Approve / Reject Buttons */}
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => updateStatus(p.id, "approved")}
                    style={{
                      background: "#00b894",
                      color: "white",
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => updateStatus(p.id, "rejected")}
                    style={{
                      background: "#d63031",
                      color: "white",
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
