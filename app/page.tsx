"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
  // Enable animations on scroll
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#000814,#001133)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* HERO SECTION */}
      <section
        className="fade-up"
        style={{
          maxWidth: "900px",
          margin: "120px auto 0 auto",
          textAlign: "center",
          padding: "20px",
          opacity: 0,
          transition: "1.2s",
        }}
      >
        <img
          src="/logo.png"
          alt="VIRA Logo"
          style={{
            width: "130px",
            height: "130px",
            margin: "0 auto 25px",
            borderRadius: "18px",
            boxShadow: "0 0 20px rgba(11,99,208,0.6)",
          }}
        />

        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: 800,
            color: "#66b3ff",
          }}
        >
          V.I.R.A Tech Solutions
        </h1>

        <p
          style={{
            color: "#cccccc",
            fontSize: "1.2rem",
            marginTop: "10px",
          }}
        >
          Innovate • Educate • Create • Work
        </p>

        <div
          style={{
            marginTop: "35px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <Link
            href="/about"
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "1px solid #0b63d0",
              color: "#66b3ff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            About Us
          </Link>

          <Link
            href="/login"
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              background: "linear-gradient(90deg,#0b63d0,#007bff)",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              boxShadow: "0 0 15px rgba(11,99,208,0.4)",
            }}
          >
            🎓 LMS Portal
          </Link>
        </div>
      </section>

      {/* OUR SERVICES */}
      <section
        className="fade-up"
        style={{
          maxWidth: "1100px",
          margin: "80px auto",
          padding: "40px 20px",
          textAlign: "center",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          boxShadow: "0 0 20px rgba(11,99,208,0.15)",
          opacity: 0,
          transition: "1s",
        }}
      >
        <h2 style={{ fontSize: "2rem", color: "#66b3ff", marginBottom: "20px" }}>
          🛠️ Our Services
        </h2>

        <p style={{ color: "#ccc", fontSize: "1.1rem", marginBottom: "30px" }}>
          We build modern, fast, secure and scalable digital solutions for businesses &
          individuals.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              title: "Website Development",
              desc: "Professional business websites, landing pages & portfolios.",
            },
            {
              title: "Mobile App Development",
              desc: "Android & iOS using Flutter and modern tech.",
            },
            {
              title: "Custom LMS",
              desc: "Students, exams, payments, trainers — all automated.",
            },
            {
              title: "UI/UX Design",
              desc: "Clean, minimal & user-centered interface design.",
            },
            {
              title: "Branding & Logo",
              desc: "Brand identities that make businesses stand out.",
            },
            {
              title: "Digital Marketing",
              desc: "SEO, Instagram growth, performance ads.",
            },
          ].map((service, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 style={{ color: "#66b3ff", marginBottom: "10px" }}>
                {service.title}
              </h3>
              <p style={{ color: "#ccc", fontSize: "0.95rem" }}>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT US */}
      <section
        className="fade-up"
        style={{
          maxWidth: "1100px",
          margin: "80px auto",
          padding: "40px 20px",
          opacity: 0,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#66b3ff", fontSize: "2rem" }}>
          📞 Contact Us
        </h2>

        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "1.1rem",
          }}
        >
          📍 Mangalagiri, Guntur District, Andhra Pradesh <br />
          📞 7349124762 <br />
          ✉️ v.i.r.a.techsolutions13@gmail.com
        </p>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <iframe
            src="https://maps.google.com/maps?q=Mangalagiri&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="350"
            style={{
              border: 0,
              borderRadius: "15px",
              maxWidth: "800px",
            }}
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "80px",
          padding: "40px",
          textAlign: "center",
          background: "rgba(0,0,0,0.4)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p style={{ marginBottom: "8px" }}>© 2025 V.I.R.A Tech Solutions</p>
        <p style={{ color: "#66b3ff" }}>All Rights Reserved</p>
      </footer>

      {/* WHATSAPP FLOAT BUTTON */}
      <a
        href="https://wa.me/917349124762"
        target="_blank"
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          background: "#25D366",
          padding: "15px",
          borderRadius: "50%",
          boxShadow: "0 0 15px rgba(0,0,0,0.4)",
        }}
      >
        <img src="/whatsapp.png" width="35" />
      </a>

      {/* ANIMATION STYLES */}
      <style>
        {`
          .fade-up {
            transform: translateY(40px);
          }
          .fade-up.visible {
            opacity: 1 !important;
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
}
