"use client";

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#000814,#001133)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        padding: "120px 20px",
      }}
    >
      <section style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        
        <h1
          style={{
            fontSize: "2.6rem",
            color: "#66b3ff",
            fontWeight: 800,
            marginBottom: "30px",
          }}
        >
          About V.I.R.A Tech Solutions
        </h1>

        <p style={{ fontSize: "1.1rem", color: "#ccc", lineHeight: "1.8" }}>
          At <b>V.I.R.A Tech Solutions</b>, we transform ideas into powerful digital experiences.
          We are a next-generation IT company focused on delivering high-quality training,
          cutting-edge software solutions, and real-world skill development.
          Our vision is simple — to bridge the gap between technology and people by providing
          modern learning, innovative products, and industry-standard IT services.
        </p>

        <p style={{ fontSize: "1.1rem", color: "#ccc", marginTop: "20px", lineHeight: "1.8" }}>
          Our mission is to empower students, working professionals, and businesses with the 
          technical skills and digital infrastructure needed to succeed in today’s fast-growing world. 
          We focus on innovation, creativity, and practical execution — ensuring that every learner 
          and client experiences measurable growth.
        </p>

        <p style={{ fontSize: "1.1rem", color: "#ccc", marginTop: "20px", lineHeight: "1.8" }}>
          🚀 We provide hands-on training, live projects, internships, and career-focused mentoring 
          across Java, Python, App Development, Web Development, AI, and more.
          <br /><br />
          🧩 From building business websites and Android/iOS apps to creating fully automated LMS 
          platforms, we deliver scalable and modern digital solutions tailored for growth.
        </p>

        <h2 style={{ color: "#66b3ff", marginTop: "40px" }}>Why Students Choose Us</h2>
        <p style={{ color: "#ccc", fontSize: "1.05rem", lineHeight: "1.8", marginTop: "10px" }}>
          ✔ Industry-Experienced Trainers <br />
          ✔ Real-Time Live Projects <br />
          ✔ 1–1 Mentorship & Doubt Support <br />
          ✔ Affordable Course Fees <br />
          ✔ Internship + Placement Support <br />
          ✔ Practical Learning Over Theory <br />
        </p>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#ccc",
            marginTop: "40px",
            lineHeight: "1.8",
          }}
        >
          At V.I.R.A Tech Solutions, every student matters.
          Every project matters.  
          Every idea matters.
          <br /><br />
          We are committed to helping you learn, grow, build, and create your future with confidence.
        </p>
      </section>
    </div>
  );
}
