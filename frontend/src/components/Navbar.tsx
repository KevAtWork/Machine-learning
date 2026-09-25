import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HeartPulse, ArrowRight, Menu, X } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Cardia home">
      <span className="logo-mark">
        <HeartPulse size={17} strokeWidth={2.4} />
      </span>
      <span>
        cardia<span className="logo-ai">.ai</span>
      </span>
    </Link>
  );
}

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="topbar container">
      <Logo />

      <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
        <Link 
          to="/" 
          onClick={closeMenu}
          className={isActive("/") ? "active" : ""}
        >
          Overview
        </Link>
        <Link 
          to="/prediction" 
          onClick={closeMenu}
          className={isActive("/prediction") ? "active" : ""}
        >
          Risk Predictor
        </Link>
        <Link 
          to="/dashboard" 
          onClick={closeMenu}
          className={isActive("/dashboard") ? "active" : ""}
        >
          Clinical Dashboard
        </Link>
        <Link 
          to="/analytics" 
          onClick={closeMenu}
          className={isActive("/analytics") ? "active" : ""}
        >
          Model Benchmarks
        </Link>
        <Link 
          to="/documentation" 
          onClick={closeMenu}
          className={isActive("/documentation") ? "active" : ""}
        >
          Documentation
        </Link>
        <Link 
          to="/credits" 
          onClick={closeMenu}
          className={isActive("/credits") ? "active" : ""}
        >
          Credits
        </Link>

        {/* Mobile menu additional actions */}
        <div className="nav-mobile-cta">
          <Link to="/prediction" onClick={closeMenu} className="text-xs text-coral font-bold flex items-center gap-1">
            Start Diagnostic <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Desktop Right CTA */}
      <div className="hidden md:flex items-center gap-3">
        <Link to="/prediction" className="button button-primary !min-h-[38px] !text-[11px] !px-3.5">
          <span>Start Diagnostic</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Mobile Hamburger Toggle */}
      <button 
        className="menu-toggle" 
        aria-label={menuOpen ? "Close menu" : "Open menu"} 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
};
