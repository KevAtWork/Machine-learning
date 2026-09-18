import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="site-shell min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="container py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center mx-auto text-cyan">
          <HeartPulse size={30} />
        </div>
        <span className="eyebrow justify-center">404 • SIGNAL NOT FOUND</span>
        <h1 className="text-5xl font-bold tracking-tight text-ink font-serif">
          Lost the Heartbeat
        </h1>
        <p className="text-muted text-xs max-w-sm mx-auto">
          The clinical page or diagnostic record you requested does not exist or has been relocated.
        </p>

        <div className="pt-4">
          <Link to="/" className="button button-primary !text-xs inline-flex items-center gap-2">
            <ArrowLeft size={13} />
            <span>Return to Overview</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
