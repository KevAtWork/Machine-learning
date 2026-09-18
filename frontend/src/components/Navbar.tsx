import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, ArrowRight, Menu, X, LogOut, Stethoscope } from "lucide-react";

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
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("cardio_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_e) {
        localStorage.removeItem("cardio_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("cardio_token");
    localStorage.removeItem("cardio_user");
    setUser(null);
    navigate("/");
  };

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

        {/* Mobile menu additional actions */}
        <div className="nav-mobile-cta">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-ink">
                Dr. {user.full_name || "Clinician"}
              </span>
              <button 
                onClick={() => { handleLogout(); closeMenu(); }}
                className="text-xs text-coral font-bold flex items-center gap-1 cursor-pointer"
              >
                Sign Out <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Link to="/login" onClick={closeMenu} className="text-xs font-semibold text-ink">
                Sign In
              </Link>
              <Link to="/prediction" onClick={closeMenu} className="text-xs text-coral font-bold flex items-center gap-1">
                Start Diagnostic <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Right CTA / User State */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-card/60 text-xs">
              <Stethoscope size={13} className="text-cyan" />
              <span className="font-semibold text-[11px] truncate max-w-[120px]">
                {user.full_name || user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 border border-line rounded-md text-muted-foreground hover:text-ink hover:border-cyan transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="nav-cta text-[11px]">
              Clinician Sign In
            </Link>
            <Link to="/prediction" className="button button-primary !min-h-[38px] !text-[11px] !px-3.5">
              <span>Start Diagnostic</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
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
