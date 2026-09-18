import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  HeartPulse, ArrowRight, Download, RefreshCw, 
  CheckCircle2, TrendingUp, TrendingDown, Activity, Info
} from "lucide-react";
import api from "../utils/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

// Biomarker validation schema matching backend
const predictSchema = z.object({
  age_years: z.number().min(30, "Age must be at least 30").max(80, "Age must be at most 80"),
  gender: z.number().min(1).max(2),
  height: z.number().min(100, "Height must be at least 100 cm").max(220, "Height must be at most 220 cm"),
  weight: z.number().min(30, "Weight must be at least 30 kg").max(200, "Weight must be at most 200 kg"),
  ap_hi: z.number().min(80, "Systolic BP must be at least 80 mmHg").max(200, "Systolic BP must be at most 200 mmHg"),
  ap_lo: z.number().min(50, "Diastolic BP must be at least 50 mmHg").max(120, "Diastolic BP must be at most 120 mmHg"),
  cholesterol: z.number().min(1).max(3),
  gluc: z.number().min(1).max(3),
  smoke: z.boolean(),
  alco: z.boolean(),
  active: z.boolean(),
});

type PredictFormValues = z.infer<typeof predictSchema>;

interface SHAPFactor {
  feature: string;
  display_name: string;
  shap_value: number;
  importance: number;
  raw_value: string;
}

interface PredictionResponse {
  result_probability: number;
  risk_level: string;
  confidence_score: number;
  risk_factors: SHAPFactor[];
  protective_factors: SHAPFactor[];
  recommendations: string[];
  created_at?: string;
}

export const PredictionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [submittedData, setSubmittedData] = useState<PredictFormValues | null>(null);

  const { handleSubmit, setValue, watch } = useForm<PredictFormValues>({
    resolver: zodResolver(predictSchema),
    defaultValues: {
      age_years: 52,
      gender: 1,
      height: 168,
      weight: 74,
      ap_hi: 125,
      ap_lo: 82,
      cholesterol: 1,
      gluc: 1,
      smoke: false,
      alco: false,
      active: true,
    }
  });

  const formValues = watch();

  // Calculate live BMI
  const heightM = formValues.height / 100;
  const bmi = heightM > 0 ? (formValues.weight / (heightM * heightM)).toFixed(1) : "0";
  const bmiNum = parseFloat(bmi);
  const bmiStatus = bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese";

  // Blood Pressure assessment helper
  const getBpCategory = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) return { label: "Hypertension Stage 2", color: "text-[#EF4444]" };
    if (sys >= 130 || dia >= 80) return { label: "Hypertension Stage 1", color: "text-amber-600" };
    if (sys >= 120 && dia < 80) return { label: "Elevated", color: "text-amber-500" };
    return { label: "Optimal", color: "text-emerald-700" };
  };
  const bpCategory = getBpCategory(formValues.ap_hi, formValues.ap_lo);

  const onSubmit = async (data: PredictFormValues) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post("/predict", data);
      setResult(response.data);
      setSubmittedData(data);
      toast.success("Cardiovascular diagnostic calculated successfully.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Prediction request failed. Ensure backend server is running.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!submittedData) return;
    setDownloading(true);
    try {
      const response = await api.post("/predict/report", submittedData, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Cardia_Clinical_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      toast.success("Medical summary PDF downloaded.");
    } catch (_error: any) {
      toast.error("Failed to generate PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSubmittedData(null);
  };

  const getRiskBadgeStyles = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 border-red-500/40 text-red-700";
      case "high":
        return "bg-[#F26A4B]/20 border-[#F26A4B]/50 text-[#F26A4B]";
      case "moderate":
        return "bg-amber-500/15 border-amber-500/40 text-amber-700";
      default:
        return "bg-emerald-500/15 border-emerald-500/40 text-emerald-800";
    }
  };

  return (
    <div className="site-shell min-h-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar />

      <main className="container py-12 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="eyebrow mb-2">
            <span className="eyebrow-dot" /> CLINICAL DIAGNOSTIC CORE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Cardiovascular <span>Risk Diagnostic</span>
          </h1>
          <p className="hero-lede mt-3">
            Enter patient biometric indicators to calculate cardiovascular disease probability, isolate SHAP risk drivers, and compile a clinical PDF summary report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Biomarker Form Panel */}
          <div className={`space-y-6 ${result ? "lg:col-span-6" : "lg:col-span-8"}`}>
            <div className="glass-card p-6 md:p-8 rounded-xl">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <HeartPulse className="text-cyan" size={18} />
                  <h2 className="text-base font-bold text-ink">11 Patient Biomarkers</h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-dim">
                  <span>BMI: <strong className="text-ink">{bmi}</strong> ({bmiStatus})</span>
                  <span>•</span>
                  <span>BP: <strong className={bpCategory.color}>{bpCategory.label}</strong></span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Age & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider">
                        Patient Age
                      </label>
                      <span className="text-sm font-bold text-ink font-mono">{formValues.age_years} yrs</span>
                    </div>
                    <input 
                      type="range"
                      min="30"
                      max="80"
                      step="1"
                      value={formValues.age_years}
                      onChange={(e) => setValue("age_years", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
                      <span>30 yrs</span>
                      <span>80 yrs</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <label className="block text-xs font-semibold text-muted font-mono uppercase tracking-wider mb-2">
                      Biological Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setValue("gender", 1)}
                        className={`py-2 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                          formValues.gender === 1
                            ? "bg-cyan text-white border-cyan shadow-sm"
                            : "bg-transparent border-line text-muted hover:border-dim"
                        }`}
                      >
                        Female
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("gender", 2)}
                        className={`py-2 px-3 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                          formValues.gender === 2
                            ? "bg-cyan text-white border-cyan shadow-sm"
                            : "bg-transparent border-line text-muted hover:border-dim"
                        }`}
                      >
                        Male
                      </button>
                    </div>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider">
                        Height
                      </label>
                      <span className="text-sm font-bold text-ink font-mono">{formValues.height} cm</span>
                    </div>
                    <input 
                      type="range"
                      min="100"
                      max="220"
                      step="1"
                      value={formValues.height}
                      onChange={(e) => setValue("height", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
                      <span>100 cm</span>
                      <span>220 cm</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider">
                        Weight
                      </label>
                      <span className="text-sm font-bold text-ink font-mono">{formValues.weight} kg</span>
                    </div>
                    <input 
                      type="range"
                      min="30"
                      max="200"
                      step="1"
                      value={formValues.weight}
                      onChange={(e) => setValue("weight", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
                      <span>30 kg</span>
                      <span>200 kg</span>
                    </div>
                  </div>
                </div>

                {/* Blood Pressures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider">
                        Systolic BP (ap_hi)
                      </label>
                      <span className="text-sm font-bold text-ink font-mono">{formValues.ap_hi} mmHg</span>
                    </div>
                    <input 
                      type="range"
                      min="80"
                      max="200"
                      step="1"
                      value={formValues.ap_hi}
                      onChange={(e) => setValue("ap_hi", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
                      <span>80 mmHg</span>
                      <span>200 mmHg</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider">
                        Diastolic BP (ap_lo)
                      </label>
                      <span className="text-sm font-bold text-ink font-mono">{formValues.ap_lo} mmHg</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="120"
                      step="1"
                      value={formValues.ap_lo}
                      onChange={(e) => setValue("ap_lo", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
                      <span>50 mmHg</span>
                      <span>120 mmHg</span>
                    </div>
                  </div>
                </div>

                {/* Cholesterol & Glucose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <label className="block text-xs font-semibold text-muted font-mono uppercase tracking-wider mb-2">
                      Cholesterol Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 1, label: "Normal" },
                        { val: 2, label: "Above" },
                        { val: 3, label: "High" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setValue("cholesterol", item.val)}
                          className={`py-2 px-1 rounded border text-[11px] font-semibold cursor-pointer transition-all ${
                            formValues.cholesterol === item.val
                              ? "bg-cyan text-white border-cyan"
                              : "bg-transparent border-line text-muted hover:border-dim"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card/60 border border-line">
                    <label className="block text-xs font-semibold text-muted font-mono uppercase tracking-wider mb-2">
                      Glucose Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 1, label: "Normal" },
                        { val: 2, label: "Above" },
                        { val: 3, label: "High" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setValue("gluc", item.val)}
                          className={`py-2 px-1 rounded border text-[11px] font-semibold cursor-pointer transition-all ${
                            formValues.gluc === item.val
                              ? "bg-cyan text-white border-cyan"
                              : "bg-transparent border-line text-muted hover:border-dim"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Behavioral & Lifestyle toggles */}
                <div className="p-4 rounded-lg bg-card/60 border border-line">
                  <label className="block text-xs font-semibold text-muted font-mono uppercase tracking-wider mb-3">
                    Lifestyle & Habitual Factors
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("smoke", !formValues.smoke)}
                      className={`p-3 rounded-md border text-center transition-all cursor-pointer ${
                        formValues.smoke 
                          ? "bg-[#F26A4B]/20 border-cyan text-ink font-bold" 
                          : "bg-transparent border-line text-muted"
                      }`}
                    >
                      <div className="text-xs">Smoking</div>
                      <div className="text-[10px] font-mono mt-1">
                        {formValues.smoke ? "Active Yes" : "No"}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("alco", !formValues.alco)}
                      className={`p-3 rounded-md border text-center transition-all cursor-pointer ${
                        formValues.alco 
                          ? "bg-[#F26A4B]/20 border-cyan text-ink font-bold" 
                          : "bg-transparent border-line text-muted"
                      }`}
                    >
                      <div className="text-xs">Alcohol</div>
                      <div className="text-[10px] font-mono mt-1">
                        {formValues.alco ? "Active Yes" : "No"}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("active", !formValues.active)}
                      className={`p-3 rounded-md border text-center transition-all cursor-pointer ${
                        formValues.active 
                          ? "bg-emerald-500/20 border-emerald-600 text-ink font-bold" 
                          : "bg-transparent border-line text-muted"
                      }`}
                    >
                      <div className="text-xs">Physically Active</div>
                      <div className="text-[10px] font-mono mt-1">
                        {formValues.active ? "Yes (Regular)" : "Sedentary"}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="button button-primary w-full justify-center !text-sm !py-3.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin" size={16} />
                        Computing SHAP Risk Decomposition...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Calculate Diagnostic Risk <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Display Panel */}
          <div className={`space-y-6 ${result ? "lg:col-span-6" : "lg:col-span-4"}`}>
            {result ? (
              <div className="glass-card p-6 md:p-8 rounded-xl space-y-6 border border-line">
                {/* Result Top Summary */}
                <div className="border-b border-line pb-6">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">DIAGNOSTIC OUTCOME</span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold font-mono tracking-wide ${getRiskBadgeStyles(result.risk_level)}`}>
                      {result.risk_level.toUpperCase()} RISK
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <strong className="text-5xl font-serif font-bold text-ink">
                      {Math.round(result.result_probability * 100)}%
                    </strong>
                    <span className="text-xs text-muted leading-tight">
                      Cardiovascular disease probability<br />
                      <small className="font-mono text-dim">Confidence: {(result.confidence_score * 100).toFixed(1)}%</small>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-line h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-cyan transition-all duration-700 rounded-full"
                      style={{ width: `${Math.min(Math.max(result.result_probability * 100, 5), 100)}%` }}
                    />
                  </div>
                </div>

                {/* SHAP Risk Drivers */}
                {result.risk_factors && result.risk_factors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-[#F26A4B]" />
                        Key Risk Escalators (SHAP +)
                      </span>
                      <span className="text-[10px] font-mono text-dim">Relative Impact</span>
                    </div>
                    <div className="space-y-2">
                      {result.risk_factors.slice(0, 4).map((f) => (
                        <div key={f.feature} className="p-2.5 rounded-md bg-card/60 border border-line text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-ink">{f.display_name}</span>
                            <span className="font-mono text-[11px] text-[#F26A4B] font-bold">
                              +{((f.importance || Math.abs(f.shap_value)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-line h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#F26A4B] rounded-full"
                              style={{ width: `${Math.min((f.importance || Math.abs(f.shap_value)) * 300, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SHAP Protective Factors */}
                {result.protective_factors && result.protective_factors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <TrendingDown size={14} className="text-emerald-700" />
                        Protective Biomarkers (SHAP -)
                      </span>
                      <span className="text-[10px] font-mono text-dim">Mitigation Impact</span>
                    </div>
                    <div className="space-y-2">
                      {result.protective_factors.slice(0, 3).map((f) => (
                        <div key={f.feature} className="p-2.5 rounded-md bg-card/60 border border-line text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-ink">{f.display_name}</span>
                            <span className="font-mono text-[11px] text-emerald-700 font-bold">
                              -{((f.importance || Math.abs(f.shap_value)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-line h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${Math.min((f.importance || Math.abs(f.shap_value)) * 300, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-line">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-cyan" />
                      Clinical Action Items
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions: Download PDF and Reset */}
                <div className="pt-4 border-t border-line flex gap-3">
                  <button
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="button button-primary flex-1 justify-center !text-xs disabled:opacity-50"
                  >
                    {downloading ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="animate-spin" size={13} />
                        Compiling PDF...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Download size={13} />
                        Export PDF Report
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="button button-outline !text-xs px-4"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 md:p-8 rounded-xl border border-line space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <Activity size={16} className="text-cyan" />
                  <span>Explainable Decision Engine</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Upon submitting the patient biomarkers, Cardia executes inference through an ensemble of 14 classifiers and extracts localized SHAP values.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg border border-line bg-card/40 text-xs">
                    <strong className="text-ink block font-semibold">1. Instant Probability</strong>
                    <span className="text-dim text-[11px]">Calculates cardiovascular risk probability with calibrated confidence bounds.</span>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-card/40 text-xs">
                    <strong className="text-ink block font-semibold">2. SHAP Attribution</strong>
                    <span className="text-dim text-[11px]">Pinpoints positive drivers (e.g. Systolic BP) versus protective markers.</span>
                  </div>
                  <div className="p-3 rounded-lg border border-line bg-card/40 text-xs">
                    <strong className="text-ink block font-semibold">3. PDF Medical Dossier</strong>
                    <span className="text-dim text-[11px]">Instant export of a clinical diagnostic report for patient records.</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card/60 border border-line flex items-center gap-2 text-[11px] text-muted">
                  <Info size={14} className="text-cyan shrink-0" />
                  <span>All predictions run client-sandboxed with cryptographic authentication options.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
