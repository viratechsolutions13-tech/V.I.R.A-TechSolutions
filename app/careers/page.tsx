"use client";

export default function CareersPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "120px 20px",
        background: "linear-gradient(180deg,#000814,#001133)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.6rem",
          fontWeight: 800,
          color: "#66b3ff",
        }}
      >
        Careers at V.I.R.A Tech Solutions
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          color: "#ccc",
          maxWidth: "900px",
          margin: "20px auto",
          lineHeight: "1.8",
        }}
      >
        Join a fast-growing tech company that focuses on innovation, creativity,  
        and building real-world digital solutions.  
        At V.I.R.A Tech Solutions, you don’t just work — you grow, innovate and succeed.
      </p>

      {/* WHY JOIN US */}
      <h2
        style={{
          textAlign: "center",
          color: "#66b3ff",
          marginTop: "50px",
          marginBottom: "20px",
        }}
      >
        Why Work With Us?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {[
          "100% Growth-Oriented Work Culture",
          "Work on Real Projects With Startups & Clients",
          "Friendly Team & Supportive Mentorship",
          "Flexible Work Environment",
          "Opportunities to Learn New Technologies",
          "Performance-Based Rewards & Benefits",
        ].map((point, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p style={{ color: "#ccc", fontSize: "1.05rem" }}>✔ {point}</p>
          </div>
        ))}
      </div>

      {/* PLACEMENT SUPPORT */}
      <h2
        style={{
          textAlign: "center",
          marginTop: "60px",
          color: "#66b3ff",
        }}
      >
        Placement & Internships
      </h2>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          maxWidth: "900px",
          margin: "10px auto",
          color: "#ccc",
          lineHeight: "1.8",
        }}
      >
        We provide internship opportunities for students who complete our courses.  
        Placement support includes resume building, mock interviews, real-time projects,  
        and interview preparation to help you secure a job confidently.
      </p>
    </div>
  );
}
