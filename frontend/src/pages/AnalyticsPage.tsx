import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, Image as ImageIcon, RefreshCw, CheckCircle2
} from "lucide-react";
import api from "../utils/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface ModelMetric {
  Accuracy: number;
  Precision: number;
  Recall: number;
  "F1 Score": number;
  "ROC AUC": number;
  "CV Score": number;
  "Training Time": number;
  "Prediction Time": number;
  "Confusion Matrix"?: number[][];
}

type ModelComparison = Record<string, ModelMetric>;

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [modelMetrics, setModelMetrics] = useState<ModelComparison | null>(null);
  const [edaInsights, setEdaInsights] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"models" | "dataset">("models");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [metricsRes, edaRes] = await Promise.all([
        api.get("/metrics"),
        api.get("/eda")
      ]);
      setModelMetrics(metricsRes.data);
      setEdaInsights(edaRes.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to load analytics metrics. Ensure model weights are trained.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const chartData = modelMetrics 
    ? Object.keys(modelMetrics).map(key => ({
        name: key.replace(" from Scratch", "*").replace(" (MLP)", ""),
        accuracy: Math.round(modelMetrics[key].Accuracy * 1000) / 10,
        cvScore: Math.round(modelMetrics[key]["CV Score"] * 1000) / 10,
        trainingTime: Math.round(modelMetrics[key]["Training Time"] * 100) / 100
      })).sort((a, b) => b.accuracy - a.accuracy)
    : [];

  const getAPIEndpointGraph = (name: string) => {
    return `/api/v1/eda/graphs/${name}`;
  };

  return (
    <div className="site-shell min-h-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Navbar />

      <main className="container py-12 md:py-16 space-y-10">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow mb-2">
            <span className="eyebrow-dot" /> MACHINE LEARNING BENCHMARKS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Classifier Analytics & <span>Cohort Insights</span>
          </h1>
          <p className="hero-lede mt-3">
            Compare 14 trained machine learning algorithms evaluated across 70,000 patient records, inspect cross-validation stability, and review exploratory medical trends.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-line gap-6">
          <button
            onClick={() => setActiveTab("models")}
            className={`pb-3 text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition-colors relative ${
              activeTab === "models" ? "text-cyan" : "text-muted hover:text-ink"
            }`}
          >
            <span>14-Model Comparison Leaderboard</span>
            {activeTab === "models" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan" />}
          </button>
          
          <button
            onClick={() => setActiveTab("dataset")}
            className={`pb-3 text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition-colors relative ${
              activeTab === "dataset" ? "text-cyan" : "text-muted hover:text-ink"
            }`}
          >
            <span>Dataset Exploratory Analysis (EDA)</span>
            {activeTab === "dataset" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan" />}
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="animate-spin text-cyan mx-auto" size={24} />
            <p className="text-xs text-muted">Compiling algorithmic benchmark evaluations...</p>
          </div>
        ) : (
          <>
            {activeTab === "models" && (
              <div className="space-y-8">
                {/* Accuracy Comparison Recharts Bar */}
                <div className="glass-card p-6 md:p-8 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <h2 className="text-base font-bold text-ink flex items-center gap-2">
                        <TrendingUp size={16} className="text-cyan" />
                        Accuracy & Cross-Validation Comparison
                      </h2>
                      <p className="text-dim text-xs mt-0.5">Ranked by test validation accuracy on the 70,000-entry clinical cohort</p>
                    </div>
                    <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-2.5 py-1 rounded border border-cyan/30">
                      * Includes Custom Scratch LR
                    </span>
                  </div>

                  <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,30,0.08)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#8A8478" 
                          fontSize={9} 
                          angle={-45} 
                          textAnchor="end" 
                          interval={0} 
                        />
                        <YAxis 
                          stroke="#8A8478" 
                          fontSize={10} 
                          domain={[60, 90]} 
                          unit="%" 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#F4EFE4", 
                            borderColor: "rgba(30,30,30,0.15)",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Bar dataKey="accuracy" name="Test Accuracy (%)" fill="#F26A4B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cvScore" name="5-Fold CV (%)" fill="#2E2E2E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Model Benchmark Leaderboard Table */}
                <div className="glass-card rounded-xl p-6 md:p-8 space-y-4">
                  <div className="border-b border-line pb-4">
                    <h3 className="text-base font-bold text-ink">Comprehensive Algorithmic Metric Matrix</h3>
                    <p className="text-xs text-muted mt-0.5">Precision, Recall, F1 Score, ROC-AUC, and Inference Timing</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-line text-[10px] font-mono text-dim uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Algorithm</th>
                          <th className="pb-3 font-semibold">Accuracy</th>
                          <th className="pb-3 font-semibold">Precision</th>
                          <th className="pb-3 font-semibold">Recall</th>
                          <th className="pb-3 font-semibold">F1 Score</th>
                          <th className="pb-3 font-semibold">ROC-AUC</th>
                          <th className="pb-3 font-semibold">CV Score</th>
                          <th className="pb-3 font-semibold text-right">Train Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {modelMetrics && Object.keys(modelMetrics).map((modelName) => {
                          const m = modelMetrics[modelName];
                          const isBest = modelName.includes("XGBoost") || modelName.includes("Random Forest");

                          return (
                            <tr key={modelName} className={`hover:bg-card/40 transition-colors ${isBest ? "bg-cyan/5" : ""}`}>
                              <td className="py-3 font-semibold text-ink flex items-center gap-1.5">
                                {isBest && <CheckCircle2 size={13} className="text-cyan shrink-0" />}
                                <span>{modelName}</span>
                              </td>
                              <td className="py-3 font-mono font-bold text-ink">
                                {(m.Accuracy * 100).toFixed(1)}%
                              </td>
                              <td className="py-3 font-mono text-muted">
                                {(m.Precision * 100).toFixed(1)}%
                              </td>
                              <td className="py-3 font-mono text-muted">
                                {(m.Recall * 100).toFixed(1)}%
                              </td>
                              <td className="py-3 font-mono text-muted">
                                {(m["F1 Score"] * 100).toFixed(1)}%
                              </td>
                              <td className="py-3 font-mono text-cyan font-semibold">
                                {m["ROC AUC"].toFixed(3)}
                              </td>
                              <td className="py-3 font-mono text-muted">
                                {(m["CV Score"] * 100).toFixed(1)}%
                              </td>
                              <td className="py-3 font-mono text-dim text-right">
                                {m["Training Time"].toFixed(2)}s
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "dataset" && (
              <div className="space-y-8">
                {/* Dataset Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5 rounded-xl">
                    <span className="eyebrow text-[9px]">TOTAL COHORT</span>
                    <strong className="text-3xl font-serif text-ink block mt-1">70,000</strong>
                    <span className="text-[10px] text-muted block mt-1">Patient records analyzed</span>
                  </div>
                  <div className="glass-card p-5 rounded-xl">
                    <span className="eyebrow text-[9px]">CLINICAL FEATURES</span>
                    <strong className="text-3xl font-serif text-ink block mt-1">11</strong>
                    <span className="text-[10px] text-muted block mt-1">Direct biomarkers + engineered BMI</span>
                  </div>
                  <div className="glass-card p-5 rounded-xl">
                    <span className="eyebrow text-[9px]">TARGET BALANCE</span>
                    <strong className="text-3xl font-serif text-ink block mt-1">49.97%</strong>
                    <span className="text-[10px] text-muted block mt-1">Even positive/negative split</span>
                  </div>
                  <div className="glass-card p-5 rounded-xl">
                    <span className="eyebrow text-[9px]">DATA HYGIENE</span>
                    <strong className="text-3xl font-serif text-ink block mt-1">100%</strong>
                    <span className="text-[10px] text-muted block mt-1">IQR outlier bounds applied</span>
                  </div>
                </div>

                {/* Precomputed Visual EDA Visualizations */}
                <div className="glass-card p-6 md:p-8 rounded-xl space-y-6">
                  <div className="border-b border-line pb-4">
                    <h3 className="text-base font-bold text-ink">Exploratory Visual Distributions</h3>
                    <p className="text-xs text-muted mt-0.5">Automated visualization plots generated from data preprocessing pipelines</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl border border-line bg-card/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>Biomarker Correlation Matrix</span>
                        <span className="text-[10px] font-mono text-cyan">Heatmap</span>
                      </div>
                      <div className="aspect-video bg-card/80 rounded-lg overflow-hidden flex items-center justify-center border border-line">
                        <img 
                          src={getAPIEndpointGraph("correlation_heatmap.png")} 
                          alt="Correlation Heatmap" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="text-dim text-xs p-4 text-center">
                          <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                          <span>Correlation Heatmap</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-line bg-card/40 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>Blood Pressure Risk Distributions</span>
                        <span className="text-[10px] font-mono text-cyan">Violin / KDE</span>
                      </div>
                      <div className="aspect-video bg-card/80 rounded-lg overflow-hidden flex items-center justify-center border border-line">
                        <img 
                          src={getAPIEndpointGraph("blood_pressure_distribution.png")} 
                          alt="BP Distribution" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="text-dim text-xs p-4 text-center">
                          <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                          <span>BP Distribution</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
