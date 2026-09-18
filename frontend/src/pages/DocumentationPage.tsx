import React from "react";
import { Code, Database, Cpu, CheckCircle2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const DocumentationPage: React.FC = () => {
  return (
    <div className="site-shell min-h-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar />

      <main className="container py-12 md:py-16 space-y-12 max-w-5xl">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">
            <span className="eyebrow-dot" /> TECHNICAL & CLINICAL COMPENDIUM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Clinical Methodology & <span>Developer API</span>
          </h1>
          <p className="hero-lede mt-3">
            Algorithmic details, biomarker reference boundaries, SHAP attribution mechanics, and programmatic REST integration endpoints.
          </p>
        </div>

        {/* Section: Medical Methodology */}
        <section className="glass-card p-6 md:p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-2 text-ink border-b border-line pb-4">
            <Cpu className="text-cyan" size={18} />
            <h2 className="text-lg font-bold">Machine Learning Diagnostic Methodology</h2>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Cardia AI evaluates patient risk through an ensemble architecture anchored on an optimized **XGBoost (Extreme Gradient Boosting)** classifier, benchmarked against 13 other algorithms (including Random Forest, LightGBM, SVM, Multi-Layer Perceptron, and a Logistic Regression constructed entirely from scratch using vectorized gradient descent).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-card/60 border border-line space-y-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-cyan" />
                SHAP (Shapley Additive exPlanations)
              </span>
              <p className="text-[11px] text-muted leading-normal">
                Derived from cooperative game theory, TreeSHAP decomposes the log-odds output of the tree ensemble into additive feature contributions, identifying which specific biomarkers elevated risk vs. provided protective buffering.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card/60 border border-line space-y-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-cyan" />
                Biomarker Cleaning & Clipping Pipelines
              </span>
              <p className="text-[11px] text-muted leading-normal">
                Clinical outlier filtering applies physiological boundary clipping on blood pressure (80–200 mmHg systolic, 50–120 mmHg diastolic) and height/weight anomalies to ensure stable gradient calculations.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Biomarker Reference Ranges */}
        <section className="glass-card p-6 md:p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-2 text-ink border-b border-line pb-4">
            <Database className="text-cyan" size={18} />
            <h2 className="text-lg font-bold">Clinical Biomarker Reference Ranges</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] font-mono text-dim uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Biomarker</th>
                  <th className="pb-3 font-semibold">Clinical Normal Range</th>
                  <th className="pb-3 font-semibold">High Risk Threshold</th>
                  <th className="pb-3 font-semibold">Relative Model Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                <tr>
                  <td className="py-2.5 font-semibold text-ink">Systolic BP (ap_hi)</td>
                  <td className="py-2.5 text-muted">90 – 120 mmHg</td>
                  <td className="py-2.5 text-red-600 font-mono">≥ 140 mmHg</td>
                  <td className="py-2.5 text-cyan font-bold font-mono">Highest Driver (~34%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-ink">Diastolic BP (ap_lo)</td>
                  <td className="py-2.5 text-muted">60 – 80 mmHg</td>
                  <td className="py-2.5 text-red-600 font-mono">≥ 90 mmHg</td>
                  <td className="py-2.5 text-cyan font-mono">High Driver (~19%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-ink">Cholesterol Level</td>
                  <td className="py-2.5 text-muted">1 (Normal)</td>
                  <td className="py-2.5 text-red-600 font-mono">3 (Well Above Normal)</td>
                  <td className="py-2.5 text-cyan font-mono">Moderate (~15%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-ink">Body Mass Index (BMI)</td>
                  <td className="py-2.5 text-muted">18.5 – 24.9 kg/m²</td>
                  <td className="py-2.5 text-red-600 font-mono">≥ 30.0 kg/m² (Obese)</td>
                  <td className="py-2.5 text-cyan font-mono">Moderate (~12%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-ink">Glucose Level</td>
                  <td className="py-2.5 text-muted">1 (Normal)</td>
                  <td className="py-2.5 text-red-600 font-mono">3 (Well Above Normal)</td>
                  <td className="py-2.5 text-cyan font-mono">Moderate (~8%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: REST API Reference */}
        <section className="glass-card p-6 md:p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-2 text-ink border-b border-line pb-4">
            <Code className="text-cyan" size={18} />
            <h2 className="text-lg font-bold">Developer REST API Endpoints</h2>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Integrate Cardia AI directly into clinical EHR systems or mobile health portals using programmatic HTTP endpoints:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card/60 border border-line space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan bg-cyan/10 px-2.5 py-1 rounded border border-cyan/30">
                  POST /api/v1/predict
                </span>
                <span className="text-[10px] font-mono text-dim">Calculate Risk & SHAP Factors</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-dim uppercase tracking-wider block">cURL HTTP Request:</span>
                <pre className="p-3.5 rounded-md bg-[#1E1E1E] text-[#E6E4D7] overflow-x-auto text-[11px] font-mono leading-relaxed">
{`curl -X 'POST' \\
  'http://localhost:8000/api/v1/predict' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "age_years": 54,
  "gender": 2,
  "height": 172,
  "weight": 82.0,
  "ap_hi": 142,
  "ap_lo": 90,
  "cholesterol": 2,
  "gluc": 1,
  "smoke": false,
  "alco": false,
  "active": true
}'`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-dim uppercase tracking-wider block">JSON Response:</span>
                <pre className="p-3.5 rounded-md bg-[#1E1E1E] text-[#E6E4D7] overflow-x-auto text-[11px] font-mono leading-relaxed">
{`{
  "result_probability": 0.684,
  "risk_level": "High",
  "confidence_score": 0.368,
  "risk_factors": [
    { "feature": "ap_hi", "display_name": "Systolic BP", "shap_value": 0.182, "importance": 0.182 }
  ],
  "protective_factors": [
    { "feature": "active", "display_name": "Physical Activity", "shap_value": -0.045, "importance": 0.045 }
  ],
  "recommendations": [
    "Systolic blood pressure exceeds 140 mmHg. Schedule clinical review for antihypertensive therapy."
  ]
}`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card/60 border border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-ink bg-card px-2.5 py-1 rounded border border-line">
                  POST /api/v1/predict/report
                </span>
                <span className="text-[10px] font-mono text-dim">Generate Medical PDF Report</span>
              </div>
              <p className="text-[11px] text-muted">
                Accepts the same JSON body as <code>/predict</code> and streams back a formatted, downloadable <code>application/pdf</code> document.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
