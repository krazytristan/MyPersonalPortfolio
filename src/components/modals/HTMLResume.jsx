export default function HTMLResume() {
  return (
    <div className="p-6 print:p-0 print:bg-white bg-white text-zinc-9 00">
      <div className="max-w-4xl mx-auto print:w-[210mm] print:h-[297mm] print:p-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold">Tristan Jorge Cuartero</h1>
            <p className="text-sm text-zinc-600">Educator • Full Stack Developer • Batangas, PH</p>
            <p className="text-sm text-zinc-600">Email: trstnjorge@gmail.com · github.com/krazytristan</p>
          </div>
          <div className="text-right">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              TJ
            </span>
          </div>
        </div>
        <hr className="border-zinc-200 mb-4" />
        <section className="mb-4">
          <h2 className="font-bold">Summary</h2>
          <p className="text-sm text-zinc-700">
            Full-stack developer and IT educator with 5+ years building dashboards, workflow systems, and document
            pipelines (PHP, React, MySQL, Tailwind). Passionate about clean UX, automation, and teaching.
          </p>
        </section>
        <section className="mb-4">
          <h2 className="font-bold">Experience</h2>
          <ul className="text-sm space-y-2">
            <li>
              <strong>iLab System (Capstone/Production)</strong> — Admin & student dashboards, reservations,
              notifications, PDF/email, role-based access.
            </li>
            <li>
              <strong>Barangay Information System</strong> — Certificate requests, DomPDF + PHPMailer, resident
              management, responsive dashboards.
            </li>
            <li>
              <strong>Teaching (2018—present)</strong> — AI Fundamentals, OOP (C++), Software Engineering.
            </li>
          </ul>
        </section>
        <section className="mb-4">
          <h2 className="font-bold">Skills</h2>
          <p className="text-sm">JavaScript, React, PHP, MySQL, Tailwind, Python, Firebase, Git, PDF/email automations</p>
        </section>
        <section>
          <h2 className="font-bold">Education & Certifications</h2>
          <p className="text-sm">BSCS · Ongoing professional courses in AI/ML and Web Development</p>
        </section>
      </div>
    </div>
  );
}
