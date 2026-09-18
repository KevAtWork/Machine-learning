import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Pages
import { Home } from "./pages/Home";
import { PredictionPage } from "./pages/PredictionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { NotFoundPage } from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        richColors 
        theme="light"
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            borderRadius: "8px",
            backgroundColor: "#F4EFE4",
            color: "#1E1E1E",
            border: "1px solid rgba(30, 30, 30, 0.15)",
          },
        }}
      />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Clinical Diagnostics */}
        <Route path="/prediction" element={<PredictionPage />} />
        
        {/* Patient Dossier History & Trends */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 14-Model Benchmarks & EDA */}
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* Documentation & Developer API */}
        <Route path="/documentation" element={<DocumentationPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
