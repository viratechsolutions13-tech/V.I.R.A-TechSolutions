"use client";

export default function CoursesPage() {
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
          marginBottom: "20px",
        }}
      >
        Our Courses
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#ccc",
          fontSize: "1.1rem",
          maxWidth: "900px",
          margin: "0 auto 40px auto",
          lineHeight: "1.8",
        }}
      >
        At V.I.R.A Tech Solutions, we offer industry-focused training designed to
        build real skills through practical projects, mentorship, and hands-on learning.
        Every course is crafted to ensure you gain the knowledge required for your
        career, freelance journey, or personal skill growth.
      </p>

      {/* COURSE LIST */}
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
          {
            title: "Python for Beginners",
            desc: "Start your programming journey with Python fundamentals, logic building, and hands-on exercises.",
          },
          {
            title: "Core Java Programming",
            desc: "Master OOP, data structures, and Java development to build strong backend and enterprise applications.",
          },
          {
            title: "Web Design & Development",
            desc: "Learn HTML, CSS, JavaScript and create responsive, modern websites with industry-standard UI/UX practices.",
          },
          {
            title: "Android App Development",
            desc: "Build powerful Android apps using modern frameworks, APIs, and real-world mobile development concepts.",
          },
          {
            title: "Java Full Stack Development",
            desc: "Front-end + Backend + Database. Become a complete developer with Spring Boot, React, APIs & more.",
          },
          {
            title: "UI/UX Design",
            desc: "Learn user interface & experience design using Figma, wireframes, prototypes, and modern design systems.",
          },
          {
            title: "1–2 Month Internship Learning",
            desc: "Get hands-on experience, real-time tasks, mentor support, and industry exposure through structured internships.",
          },
          {
            title: "Basic Python",
            desc: "A simplified version of Python focusing on syntax, basics, and foundation for beginners.",
          },
          {
            title: "Basic Java",
            desc: "Understand the core concepts of Java and prepare for advanced programming and backend development.",
          },
          {
            title: "HTML & CSS",
            desc: "Learn how to design beautiful landing pages, layouts, and websites using clean HTML and advanced CSS.",
          },
          {
            title: "Internships",
            desc: "Gain real-world experience by working on client projects, live tasks, and professional workflows.",
          },
          {
            title: "Intern + Placement Program",
            desc: "Guaranteed skill-building with projects, interview training, resume building, and placement assistance.",
          },
        ].map((course, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "25px",
              borderRadius: "15px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2 style={{ color: "#66b3ff", marginBottom: "10px" }}>{course.title}</h2>
            <p style={{ color: "#ccc", lineHeight: "1.6" }}>{course.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
