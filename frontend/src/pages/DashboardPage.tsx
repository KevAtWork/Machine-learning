import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  HeartPulse, FileSpreadsheet, PlusCircle, Activity, 
  ShieldAlert, BarChart3, TrendingUp, LockKeyhole, ArrowRight
} from "lucide-react";
import api from "../utils/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface HistoryRecord {
  id: number;
  user_id: number;
  age_years: number;
  gender: number;
  height: number;
  weight: number;
  ap_hi: number;
  ap_lo: number;
  cholesterol: number;
  gluc: number;
  smoke: boolean;
  alco: boolean;
  active: boolean;
  result_probability: number;
  risk_level: string;
  created_at: string;
}

const CARDIA_CHART_COLORS = ["#F26A4B", "#2E2E2E", "#5E5A52", "#A89F8F", "#D8D2C4"];

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [exporting, setExporting] = useState(false);
  const token = localStorage.getItem("cardio_token");

  useEffect(() => {
    if (token) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/history");
      setHistory(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to load prediction history. Ensure you are signed in.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get("/history/export", {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Cardia_Clinical_History_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      toast.success("CSV record export downloaded successfully.");
    } catch (_error: any) {
      toast.error("Failed to export history CSV.");
    } finally {
      setExporting(false);
    }
  };

  // Helper stats
  const totalAssessments = history.length;
  const avgBmi = history.length > 0 
    ? history.reduce((sum, h) => {
        const heightM = h.height / 100;
        return sum + (h.weight / (heightM * heightM));
      }, 0) / history.length
    : 0;

  const avgSysBp = history.length > 0
    ? history.reduce((sum, h) => sum + h.ap_hi, 0) / history.length
    : 0;

  const criticalCases = history.filter(h => 
    h.risk_level.toLowerCase() === "critical" || h.risk_level.toLowerCase() === "high"
  ).length;

  // Recharts trend data
  const trendData = [...history]
    .reverse()
    .map(h => ({
      date: new Date(h.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      probability: Math.round(h.result_probability * 100)
    }));

  // Recharts distribution data
  const riskCounts = history.reduce((acc: Record<string, number>, curr) => {
    const level = curr.risk_level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const distributionData = Object.keys(riskCounts).map(key => ({
    name: `${key.toUpperCase()} Risk`,
    value: riskCounts[key]
  }));

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
        {/* Unauthenticated View */}
        {!token ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="glass-card p-10 rounded-2xl max-w-lg w-full text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center mx-auto text-cyan">
                <LockKeyhole size={24} />
              </div>
              <div className="space-y-2">
                <span className="eyebrow justify-center">CLINICAL AUTHENTICATION REQUIRED</span>
                <h2 className="text-3xl font-bold tracking-tight text-ink font-serif">
                  Access Patient Dossiers
                </h2>
                <p className="text-muted text-xs leading-relaxed max-w-sm mx-auto">
                  Sign in or create a clinician account to automatically store patient assessments, analyze chronological risk progression, and export CSV logs.
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Link to="/login" className="button button-primary !text-xs px-6">
                  Clinician Sign In <ArrowRight size={13} />
                </Link>
                <Link to="/register" className="button button-outline !text-xs px-5">
                  Create Account
                </Link>
              </div>

              <div className="pt-4 border-t border-line text-[11px] text-dim">
                <span>Want to test the predictive core immediately without an account? </span>
                <Link to="/prediction" className="text-cyan font-semibold hover:underline">
                  Launch Guest Diagnostic
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Page Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-line">
              <div>
                <div className="eyebrow mb-2">
                  <span className="eyebrow-dot" /> CLINICAL DOSSIER ARCHIVE
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
                  Patient <span>Assessment Dashboard</span>
                </h1>
                <p className="text-muted text-xs mt-1">
                  Chronological records of cardiovascular evaluations, biomarker classifications, and risk trajectories.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  disabled={exporting || history.length === 0}
                  className="button button-outline !min-h-[38px] !text-xs disabled:opacity-50"
                >
                  <FileSpreadsheet size={13} className="text-cyan" />
                  <span>{exporting ? "Exporting..." : "Export CSV"}</span>
                </button>

                <Link
                  to="/prediction"
                  className="button button-primary !min-h-[38px] !text-xs"
                >
                  <PlusCircle size={13} />
                  <span>New Diagnostic</span>
                </Link>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-xl">
                <div className="flex justify-between items-center text-dim text-xs font-mono mb-2">
                  <span>ASSESSMENTS</span>
                  <Activity size={14} className="text-cyan" />
                </div>
                <strong className="text-3xl font-serif text-ink">{totalAssessments}</strong>
                <span className="text-[10px] text-muted block mt-1">Total evaluated profiles</span>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <div className="flex justify-between items-center text-dim text-xs font-mono mb-2">
                  <span>AVG PATIENT BMI</span>
                  <TrendingUp size={14} className="text-cyan" />
                </div>
                <strong className="text-3xl font-serif text-ink">{avgBmi > 0 ? avgBmi.toFixed(1) : "—"}</strong>
                <span className="text-[10px] text-muted block mt-1">Cohort mass index</span>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <div className="flex justify-between items-center text-dim text-xs font-mono mb-2">
                  <span>AVG SYSTOLIC BP</span>
                  <HeartPulse size={14} className="text-cyan" />
                </div>
                <strong className="text-3xl font-serif text-ink">{avgSysBp > 0 ? Math.round(avgSysBp) : "—"}</strong>
                <span className="text-[10px] text-muted block mt-1">mmHg systolic pressure</span>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <div className="flex justify-between items-center text-dim text-xs font-mono mb-2">
                  <span>HIGH / CRITICAL</span>
                  <ShieldAlert size={14} className="text-red-600" />
                </div>
                <strong className="text-3xl font-serif text-red-600">{criticalCases}</strong>
                <span className="text-[10px] text-muted block mt-1">Escalated intervention cases</span>
              </div>
            </div>

            {/* Visual Charts (Recharts) */}
            {history.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-8 glass-card p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="text-xs font-bold text-ink flex items-center gap-2">
                      <TrendingUp size={14} className="text-cyan" />
                      Cardiovascular Risk Trajectory (%)
                    </span>
                    <span className="text-[10px] font-mono text-dim">Latest Assessments</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 30, 0.08)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#8A8478" 
                          fontSize={10} 
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#8A8478" 
                          fontSize={10} 
                          domain={[0, 100]}
                          unit="%"
                          tickLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#F4EFE4", 
                            borderColor: "rgba(30,30,30,0.15)",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontFamily: "Inter, sans-serif"
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="probability" 
                          stroke="#F26A4B" 
                          strokeWidth={2.5} 
                          dot={{ fill: "#F26A4B", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#F26A4B" }}
                          name="Risk %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Distribution Chart */}
                <div className="lg:col-span-4 glass-card p-6 rounded-xl space-y-4">
                  <div className="border-b border-line pb-3">
                    <span className="text-xs font-bold text-ink flex items-center gap-2">
                      <BarChart3 size={14} className="text-cyan" />
                      Risk Level Proportions
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {distributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CARDIA_CHART_COLORS[index % CARDIA_CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#F4EFE4", 
                            borderColor: "rgba(30,30,30,0.15)",
                            borderRadius: "8px",
                            fontSize: "11px"
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment History Table */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h3 className="text-sm font-bold text-ink">Clinical Patient Records</h3>
                <span className="text-xs font-mono text-dim">{history.length} records logged</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-muted">
                  Loading patient dossier archive...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs text-muted">No patient assessments logged under this account yet.</p>
                  <Link to="/prediction" className="button button-primary !text-xs">
                    Run First Diagnostic
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-line text-[10px] font-mono text-dim uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Demographics</th>
                        <th className="pb-3 font-semibold">Blood Pressure</th>
                        <th className="pb-3 font-semibold">Biomarkers</th>
                        <th className="pb-3 font-semibold">Habits</th>
                        <th className="pb-3 font-semibold">Probability</th>
                        <th className="pb-3 font-semibold text-right">Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {history.map((record) => {
                        const hM = record.height / 100;
                        const recBmi = (record.weight / (hM * hM)).toFixed(1);

                        return (
                          <tr key={record.id} className="hover:bg-card/40 transition-colors">
                            <td className="py-3 font-mono text-dim text-[11px]">
                              {new Date(record.created_at).toLocaleDateString(undefined, { 
                                month: "short", 
                                day: "numeric",
                                year: "numeric" 
                              })}
                            </td>
                            <td className="py-3">
                              <span className="font-semibold text-ink">{record.age_years} yrs</span>
                              <span className="text-dim text-[10px] block">
                                {record.gender === 1 ? "Female" : "Male"} • BMI {recBmi}
                              </span>
                            </td>
                            <td className="py-3 font-mono">
                              <span className="font-semibold text-ink">{record.ap_hi}/{record.ap_lo}</span>
                              <span className="text-dim text-[10px] block">mmHg</span>
                            </td>
                            <td className="py-3 text-[11px] text-muted">
                              <span>Chol: {record.cholesterol}</span> • <span>Gluc: {record.gluc}</span>
                            </td>
                            <td className="py-3 text-[11px] text-muted">
                              <span>{record.smoke ? "🚬 Smoker" : "Non-smoker"}</span> • 
                              <span>{record.active ? " 🏃 Active" : " Sedentary"}</span>
                            </td>
                            <td className="py-3 font-bold font-mono text-ink text-sm">
                              {Math.round(record.result_probability * 100)}%
                            </td>
                            <td className="py-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono tracking-wide ${getRiskBadgeStyles(record.risk_level)}`}>
                                {record.risk_level.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
