import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CircleHelp,
  HeartPulse,
  LockKeyhole,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const features = [
  { 
    icon: Activity, 
    label: "Detect earlier", 
    text: "Surface subtle biomarker patterns and blood pressure variances before acute symptoms develop.",
    link: "/prediction"
  },
  { 
    icon: BrainCircuit, 
    label: "Explain clearly", 
    text: "Translate complex ensemble decisions into transparent SHAP patient drivers and risk mitigators.",
    link: "/prediction"
  },
  { 
    icon: ShieldCheck, 
    label: "Stay in control", 
    text: "Every patient evaluation is traceable, reviewable in clinical history, and exportable to CSV/PDF.",
    link: "/dashboard"
  },
];

function Waveform({ className = "" }: { className?: string }) {
  const path = "M0 95H104C117 95 119 78 131 78C142 78 142 95 151 95H205L227 95L245 35L263 142L280 95H326C340 95 343 66 355 66C367 66 367 95 379 95H451L470 95C483 95 486 74 498 74C510 74 510 95 522 95H720";
  return (
    <svg className={className} viewBox="0 0 720 180" fill="none" aria-label="Cardiac waveform visualization" role="img">
      <path d={path} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} stroke="currentColor" strokeOpacity=".2" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Home: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main id="top" className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Intelligence for the heart
          </div>
          <h1>
            See what the<br />
            <em>heart</em> is saying.
          </h1>
          <p className="hero-lede">
            Cardia turns cardiovascular clinical data into earlier, clearer decisions — powered by 14 machine learning models with real-time SHAP explainability.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/prediction">
              Explore the predictor <ArrowRight size={16} />
            </Link>
            <button className="button button-quiet" onClick={() => setShowDemo(true)}>
              <span className="play-icon">
                <Play size={11} fill="currentColor" />
              </span>
              <span>Platform overview</span>
            </button>
          </div>
          <div className="hero-proof">
            <span className="proof-avatars">
              <span>ML</span>
              <span>XP</span>
              <span>SH</span>
            </span>
            <span>Trained on 70,000 clinical records with 14 benchmarked classifiers.</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Live cardiovascular intelligence overview">
          <div className="visual-orbit orbit-a" />
          <div className="visual-orbit orbit-b" />
          <div className="heart-core">
            <HeartPulse size={96} strokeWidth={1.05} />
            <span className="core-ring ring-one" />
            <span className="core-ring ring-two" />
          </div>
          
          <div className="signal-card signal-top glass-card">
            <span className="signal-label">
              <span className="live-dot" /> Live Diagnostic Core
            </span>
            <strong>XGBoost + SHAP</strong>
            <small>87.4% test validation</small>
          </div>

          <div className="signal-card signal-bottom glass-card">
            <span className="signal-label">
              Inference Latency <CircleHelp size={12} />
            </span>
            <strong>
              &lt; 45ms <span className="risk-line" />
            </strong>
            <small>Real-time factor decomposition</small>
          </div>

          <div className="visual-caption">
            Continuous cardiac intelligence <span>///</span>
          </div>
        </div>
      </section>

      {/* Signal Strip with Animated Waveform */}
      <section className="signal-strip container" id="signals">
        <div className="strip-copy">
          <span className="strip-kicker">CARDIA SIGNALS</span>
          <strong>One clear view of cardiovascular health.</strong>
        </div>
        <div className="waveform-wrap">
          <Waveform className="waveform" />
          <span className="wave-label wave-label-start">DIAGNOSTIC PIPELINE</span>
          <span className="wave-label wave-label-end">ACTIVE</span>
        </div>
        <div className="strip-status">
          <span className="status-pulse" /> 11 Clinical Biomarkers Evaluated
        </div>
      </section>

      {/* Platform Section */}
      <section className="platform-section container" id="platform">
        <div className="section-heading">
          <span className="section-index">01 / THE PLATFORM</span>
          <h2>
            From raw data<br />
            <span>to clinical meaning.</span>
          </h2>
          <p>
            Designed to sit alongside clinical expertise, Cardia makes the invisible visible — without adding another layer of noise.
          </p>
        </div>
        
        <div className="feature-grid">
          {features.map(({ icon: Icon, label, text, link }, index) => (
            <article className="feature-card" key={label}>
              <span className="feature-number">0{index + 1}</span>
              <Icon className="feature-icon" size={26} strokeWidth={1.5} />
              <h3>{label}</h3>
              <p>{text}</p>
              <Link to={link} aria-label={`Open ${label}`}>
                Launch tool <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Statistical Capabilities Banner */}
      <section className="container pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl border border-line bg-card/40">
            <strong className="text-3xl font-extrabold text-ink block font-serif tracking-tight">14</strong>
            <span className="text-[11px] uppercase tracking-wider text-cyan font-mono block mt-1">Classifiers</span>
            <p className="text-muted-foreground text-xs mt-2">Custom Scratch LR, Random Forest, XGBoost & LightGBM</p>
          </div>
          <div className="p-6 rounded-xl border border-line bg-card/40">
            <strong className="text-3xl font-extrabold text-ink block font-serif tracking-tight">70k</strong>
            <span className="text-[11px] uppercase tracking-wider text-cyan font-mono block mt-1">Patient Cohort</span>
            <p className="text-muted-foreground text-xs mt-2">Comprehensive demographic and biometric indicators</p>
          </div>
          <div className="p-6 rounded-xl border border-line bg-card/40">
            <strong className="text-3xl font-extrabold text-ink block font-serif tracking-tight">SHAP</strong>
            <span className="text-[11px] uppercase tracking-wider text-cyan font-mono block mt-1">Explainability</span>
            <p className="text-muted-foreground text-xs mt-2">Isolates patient-specific risk drivers & protective biomarkers</p>
          </div>
          <div className="p-6 rounded-xl border border-line bg-card/40">
            <strong className="text-3xl font-extrabold text-ink block font-serif tracking-tight">PDF</strong>
            <span className="text-[11px] uppercase tracking-wider text-cyan font-mono block mt-1">Medical Export</span>
            <p className="text-muted-foreground text-xs mt-2">Formatted clinical diagnostic documentation at 1 click</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section container" id="trust">
        <div className="trust-card glass-card">
          <div className="trust-content">
            <span className="section-index">02 / TRUSTED BY DESIGN</span>
            <h2>
              Human judgment,<br />
              <span>augmented.</span>
            </h2>
            <p>
              Cardia is not here to replace the clinician. It is here to give them more of what matters: time, context, and diagnostic confidence.
            </p>
            <Link className="text-link" to="/documentation">
              Explore medical methodology <ArrowRight size={15} />
            </Link>
          </div>
          
          <div className="trust-visual">
            <div className="trust-stat">
              <strong>4.8<span>x</span></strong>
              <small>
                faster review<br />
                of complex profiles
              </small>
            </div>
            <div className="trust-line">
              <span /><span /><span /><span /><span /><span /><span />
            </div>
            <div className="trust-foot">
              <LockKeyhole size={13} /> Private & Secure Clinical Sessions
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />

      {/* Demo Modal */}
      {showDemo && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Cardia platform demo">
          <div className="demo-modal glass-card">
            <button 
              className="modal-close" 
              onClick={() => setShowDemo(false)} 
              aria-label="Close demo"
            >
              <X size={18} />
            </button>
            <div className="demo-icon">
              <HeartPulse size={22} />
            </div>
            <span className="eyebrow">Cardia.ai Platform Architecture</span>
            <h2>
              Clinical clarity,<br />
              <em>in motion.</em>
            </h2>
            <p>
              Cardia combines clinical biometrics with state-of-the-art tree ensemble algorithms and Game Theory SHAP values. Ready to run assessments right now.
            </p>
            <div className="space-y-3 mt-5">
              <Link 
                to="/prediction" 
                onClick={() => setShowDemo(false)}
                className="button button-primary w-full justify-center"
              >
                Launch Live Predictor <ArrowRight size={15} />
              </Link>
              <Link 
                to="/analytics" 
                onClick={() => setShowDemo(false)}
                className="button button-outline w-full justify-center"
              >
                View 14-Model Benchmarks
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
