import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Navbar";

export const Footer: React.FC = () => {
  return (
    <footer className="footer container" id="about">
      <Logo />
      <div className="footer-mid">
        A clearer signal for every<br />beat ahead.
      </div>
      <div className="footer-right">
        <span>© 2026 Cardia AI • Clinical Diagnostic Intelligence</span>
        <div className="flex items-center gap-4">
          <Link to="/credits" className="hover:text-cyan transition-colors">
            Credits
          </Link>
          <Link to="/documentation" className="hover:text-cyan transition-colors">
            Docs & APIs
          </Link>
          <Link to="/prediction" className="hover:text-cyan transition-colors flex items-center gap-1 font-bold text-cyan">
            Risk Predictor <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
};
