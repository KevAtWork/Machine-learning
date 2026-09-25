import React from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  Link2,
  Mail,
  ExternalLink,
  HeartPulse,
  Code2,
  Database,
  BrainCircuit,
  Server,
  Globe,
  BookOpen,
  GraduationCap,
  User,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// ─── EDITABLE CONSTANTS ───────────────────────────────────────────────────────
// Update these values to match your personal information.
const DEVELOPER = {
  fullName: "Kaivalya Prajapati",
  initials: "KP",
  degree: "B.Tech Computer Science & Engineering",
  semester: "5th Semester",
  academicYear: "2026",
  role: "B.Tech CSE Student",
};

const LINKS = {
  github: "https://github.com/yourusername",       // TODO: Replace with your GitHub URL
  linkedin: "https://linkedin.com/in/yourusername", // TODO: Replace with your LinkedIn URL
  portfolio: "",                                     // TODO: Replace with your portfolio URL (leave empty to hide)
  email: "your.email@example.com",                  // TODO: Replace with your email
};
// ─────────────────────────────────────────────────────────────────────────────

const TECH_STACK = {
  frontend: [
    { name: "React 19", note: "UI framework" },
    { name: "TypeScript", note: "Type-safe JavaScript" },
    { name: "Vite", note: "Build tool & dev server" },
    { name: "Tailwind CSS", note: "Utility-first styling" },
    { name: "React Router", note: "Client-side routing" },
    { name: "TanStack Query", note: "Data fetching & caching" },
    { name: "Axios", note: "HTTP client" },
    { name: "Recharts", note: "Data visualization" },
    { name: "React Hook Form + Zod", note: "Form validation" },
    { name: "Lucide Icons", note: "Icon library" },
  ],
  backend: [
    { name: "Python 3.11+", note: "Primary language" },
    { name: "FastAPI", note: "REST API framework" },
    { name: "SQLAlchemy", note: "ORM & database layer" },
    { name: "SQLite", note: "Development database" },
    { name: "SHAP", note: "Model explainability" },
    { name: "ReportLab", note: "PDF report generation" },
    { name: "Uvicorn", note: "ASGI server" },
  ],
  ml: [
    { name: "Scikit-learn", note: "ML algorithms & preprocessing" },
    { name: "XGBoost", note: "Primary prediction model" },
    { name: "NumPy", note: "Numerical computation" },
    { name: "Pandas", note: "Data manipulation" },
    { name: "Joblib", note: "Model serialization" },
    { name: "Matplotlib / Seaborn", note: "EDA visualizations" },
  ],
  deployment: [
    { name: "Docker", note: "Containerization" },
    { name: "Docker Compose", note: "Multi-service orchestration" },
    { name: "Nginx", note: "Reverse proxy" },
    { name: "Vercel", note: "Frontend deployment" },
  ],
};

const PROJECT_DETAILS = [
  { label: "Project Name", value: "CardioPredict AI" },
  { label: "Project Type", value: "Academic / Machine Learning Project" },
  { label: "Domain", value: "Healthcare / Machine Learning" },
  { label: "Dataset", value: "Cardiovascular Disease Dataset (Kaggle)" },
  { label: "Dataset Records", value: "70,000 patient entries" },
  { label: "Input Features", value: "11 health biomarkers" },
  { label: "Models Benchmarked", value: "14 ML algorithms" },
  { label: "Primary ML Algorithm", value: "XGBoost (with GridSearch tuning)" },
  { label: "Frontend", value: "React 19 + TypeScript + Vite" },
  { label: "Backend", value: "Python + FastAPI" },
  { label: "Database", value: "SQLite (Dev) / PostgreSQL (Production)" },
  { label: "Explainability", value: "SHAP (SHapley Additive exPlanations)" },
];

interface TechBadgeProps {
  name: string;
  note: string;
}

const TechBadge: React.FC<TechBadgeProps> = ({ name, note }) => (
  <div
    className="flex flex-col gap-0.5 px-3 py-2 rounded-md border border-line bg-card/60"
    style={{ background: "rgba(244,239,228,0.6)" }}
  >
    <span className="text-[11px] font-semibold text-ink">{name}</span>
    <span className="text-[9px] text-muted font-mono uppercase tracking-wider">{note}</span>
  </div>
);

interface SectionHeaderProps {
  index: string;
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ index, title, subtitle }) => (
  <div className="mb-8">
    <span className="section-index">{index}</span>
    <h2
      className="mt-3 text-ink font-bold tracking-tight"
      style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.06em", lineHeight: 1 }}
    >
      {title}
    </h2>
    {subtitle && (
      <p className="mt-2 text-muted text-xs leading-relaxed max-w-lg">{subtitle}</p>
    )}
  </div>
);

export const CreditsPage: React.FC = () => {
  return (
    <div className="site-shell min-h-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Navbar />

      <main className="container py-16 space-y-20">

        {/* ── PROJECT HEADER ──────────────────────────────────────── */}
        <section>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            ABOUT THIS PROJECT
          </span>
          <h1
            className="mt-5 font-bold text-ink"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.08em", lineHeight: 0.95 }}
          >
            CardioPredict <em>AI</em>
          </h1>
          <p className="mt-4 text-muted text-sm leading-relaxed max-w-2xl">
            CardioPredict AI is a machine-learning-based cardiovascular disease prediction system developed
            as an academic project. It uses patient health and clinical parameters to estimate the
            likelihood of cardiovascular disease and presents the prediction through an interactive web
            interface with real-time SHAP explanations.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link to="/prediction" className="button button-primary !text-[11px] !px-4 !min-h-[38px]">
              <HeartPulse size={13} />
              Try Risk Predictor
            </Link>
            <Link to="/documentation" className="button button-outline !text-[11px] !px-4 !min-h-[38px]">
              <BookOpen size={13} />
              View Documentation
            </Link>
          </div>
        </section>

        {/* ── DEVELOPER PROFILE ───────────────────────────────────── */}
        <section>
          <SectionHeader
            index="01"
            title="Developed By"
            subtitle="Personal credits for the development of CardioPredict AI."
          />

          <div
            className="glass-card rounded-xl border border-line p-8"
            style={{ maxWidth: "640px" }}
          >
            <div className="flex items-start gap-6">
              {/* Initials avatar */}
              <div
                className="flex-shrink-0 grid place-items-center rounded-full border-2 font-bold text-xl text-night"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "var(--cyan)",
                  borderColor: "rgba(242,106,75,0.3)",
                  fontFamily: "var(--font-serif)",
                  letterSpacing: "-0.04em",
                }}
              >
                {DEVELOPER.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="text-ink font-bold"
                    style={{ fontSize: "1.35rem", letterSpacing: "-0.05em" }}
                  >
                    {DEVELOPER.fullName}
                  </h3>
                  <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-cyan border border-cyan/30 px-2 py-0.5 rounded-full">
                    <GraduationCap size={10} />
                    {DEVELOPER.role}
                  </span>
                </div>

                <p className="mt-3 text-xs text-muted leading-relaxed">
                  Designed and developed CardioPredict AI, including the machine learning workflow,
                  application interface, backend integration, and project deployment.
                </p>

                {/* Contributions */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
                  {[
                    "Full-stack development",
                    "Machine Learning implementation",
                    "Frontend development",
                    "Backend / API integration",
                    "UI/UX implementation",
                    "Project architecture",
                    "Database integration",
                    "Deployment & configuration",
                  ].map((item) => (
                    <span key={item} className="text-[10px] text-muted flex items-center gap-1.5">
                      <span
                        className="inline-block w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: "var(--cyan)" }}
                      />
                      {item}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-line">
                  <a
                    href={LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-muted hover:text-cyan transition-colors"
                  >
                    <GitBranch size={13} /> GitHub
                  </a>
                  <a
                    href={LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-muted hover:text-cyan transition-colors"
                  >
                    <Link2 size={13} /> LinkedIn
                  </a>
                  {LINKS.portfolio && (
                    <a
                      href={LINKS.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-muted hover:text-cyan transition-colors"
                    >
                      <Globe size={13} /> Portfolio
                    </a>
                  )}
                  <a
                    href={`mailto:${LINKS.email}`}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-muted hover:text-cyan transition-colors"
                  >
                    <Mail size={13} /> {LINKS.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACADEMIC INFORMATION ────────────────────────────────── */}
        <section>
          <SectionHeader
            index="02"
            title="Academic Project"
            subtitle="Project context and academic metadata."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {[
              { label: "Project", value: "CardioPredict AI" },
              { label: "Developed By", value: DEVELOPER.fullName },
              { label: "Degree", value: DEVELOPER.degree },
              { label: "Semester", value: DEVELOPER.semester },
              { label: "Project Type", value: "Machine Learning / Academic Project" },
              { label: "Academic Year", value: DEVELOPER.academicYear },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 px-4 py-3 rounded-md border border-line"
                style={{ background: "rgba(244,239,228,0.5)" }}
              >
                <span className="text-[9px] font-mono text-muted uppercase tracking-wider">{label}</span>
                <span className="text-xs font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TECHNOLOGIES USED ────────────────────────────────────── */}
        <section>
          <SectionHeader
            index="03"
            title="Technologies Used"
            subtitle="Technologies present in this repository, verified from the actual codebase."
          />

          <div className="space-y-8">
            {/* Frontend */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 size={14} className="text-cyan" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Frontend</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.frontend.map((t) => (
                  <TechBadge key={t.name} name={t.name} note={t.note} />
                ))}
              </div>
            </div>

            {/* Backend */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server size={14} className="text-cyan" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Backend</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.backend.map((t) => (
                  <TechBadge key={t.name} name={t.name} note={t.note} />
                ))}
              </div>
            </div>

            {/* Machine Learning */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit size={14} className="text-cyan" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Machine Learning</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.ml.map((t) => (
                  <TechBadge key={t.name} name={t.name} note={t.note} />
                ))}
              </div>
            </div>

            {/* Deployment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-cyan" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Deployment</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.deployment.map((t) => (
                  <TechBadge key={t.name} name={t.name} note={t.note} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECT DETAILS ──────────────────────────────────────── */}
        <section>
          <SectionHeader
            index="04"
            title="Project Details"
            subtitle="Factual information about the project scope and implementation."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROJECT_DETAILS.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 px-4 py-3 rounded-md border border-line"
                style={{ background: "rgba(244,239,228,0.5)" }}
              >
                <span className="text-[9px] font-mono text-muted uppercase tracking-wider">{label}</span>
                <span className="text-xs font-semibold text-ink leading-snug">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DATASET & MODEL CREDIT ───────────────────────────────── */}
        <section>
          <SectionHeader
            index="05"
            title="Dataset & Model"
            subtitle="Source acknowledgement for the dataset used to train the cardiovascular prediction model."
          />

          <div className="glass-card rounded-xl border border-line p-6 max-w-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Database size={15} className="text-cyan" />
              <span className="text-xs font-bold text-ink">Cardiovascular Disease Dataset</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Dataset Name", value: "Cardiovascular Disease Dataset" },
                { label: "Original Source", value: "Kaggle (caravanuden/cardio)" },
                { label: "Records", value: "70,000 patient entries" },
                { label: "Features", value: "11 health biomarkers + 1 target (cardio)" },
                { label: "Target Variable", value: "Cardio (0 = No Disease, 1 = Disease)" },
                { label: "Primary Model", value: "XGBoost (GridSearch tuned)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider">{label}</span>
                  <span className="text-[11px] font-semibold text-ink">{value}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-line">
              <p className="text-[10px] text-muted leading-relaxed">
                <span className="font-semibold text-ink">Preprocessing applied:</span> Physiological
                boundary cleaning (blood pressure, height, weight outlier removal), BMI and pulse
                pressure feature engineering, one-hot encoding for cholesterol and glucose categories,
                StandardScaler normalization, and 80/20 stratified train/test split.
              </p>
            </div>

            <a
              href="https://github.com/caravanuden/cardio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-cyan hover:underline"
            >
              <ExternalLink size={11} />
              Dataset Source on GitHub
            </a>
          </div>
        </section>

        {/* ── PERSONAL LINKS ───────────────────────────────────────── */}
        <section>
          <SectionHeader
            index="06"
            title="Contact & Links"
            subtitle="Replace the placeholder values in CreditsPage.tsx to add your actual links."
          />

          <div className="flex flex-wrap gap-3">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-line text-xs font-semibold text-ink hover:border-cyan hover:text-cyan transition-colors"
              style={{ background: "rgba(244,239,228,0.6)" }}
            >
              <GitBranch size={14} />
              GitHub
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-line text-xs font-semibold text-ink hover:border-cyan hover:text-cyan transition-colors"
              style={{ background: "rgba(244,239,228,0.6)" }}
            >
              <Link2 size={14} />
              LinkedIn
            </a>
            {LINKS.portfolio && (
              <a
                href={LINKS.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-line text-xs font-semibold text-ink hover:border-cyan hover:text-cyan transition-colors"
                style={{ background: "rgba(244,239,228,0.6)" }}
              >
                <Globe size={14} />
                Portfolio
              </a>
            )}
            <a
              href={`mailto:${LINKS.email}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-line text-xs font-semibold text-ink hover:border-cyan hover:text-cyan transition-colors"
              style={{ background: "rgba(244,239,228,0.6)" }}
            >
              <Mail size={14} />
              {LINKS.email}
            </a>
          </div>
          <p className="mt-4 text-[10px] text-muted font-mono">
            * Update the <code className="text-ink">DEVELOPER</code> and <code className="text-ink">LINKS</code> constants at the top of{" "}
            <code className="text-ink">CreditsPage.tsx</code> to personalise this page.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};
