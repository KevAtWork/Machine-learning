import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User, ShieldCheck } from "lucide-react";
import api from "../utils/api";
import { Logo } from "../components/Navbar";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;
type RegisterFields = z.infer<typeof registerSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired")) {
      toast.warning("Your session has expired. Please sign in again.");
    }
  }, [location]);

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("cardio_token", access_token);
      localStorage.setItem("cardio_user", JSON.stringify(user));
      
      toast.success(`Welcome back, Dr. ${user.full_name || "Clinician"}!`);
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Invalid clinical credentials.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell min-h-screen flex items-center justify-center p-6">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo />
          </div>
          <span className="eyebrow justify-center">SECURE CLINICAL ACCESS</span>
          <h1 className="text-3xl font-bold tracking-tight text-ink font-serif">
            Clinician Sign In
          </h1>
          <p className="text-xs text-muted">
            Access patient cardiovascular dossiers and diagnostic histories
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl space-y-6 border border-line">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-dim" />
                <input
                  type="email"
                  placeholder="doctor@hospital.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-card/80 text-xs text-ink placeholder:text-dim focus:outline-none focus:border-cyan"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-600 block mt-1">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-dim" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-card/80 text-xs text-ink placeholder:text-dim focus:outline-none focus:border-cyan"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-600 block mt-1">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button button-primary w-full justify-center !py-3 !text-xs disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          <div className="pt-4 border-t border-line text-center text-xs text-muted">
            <span>Don't have a clinician account? </span>
            <Link to="/register" className="text-cyan font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-dim flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} />
          <span>Encrypted JWT Sessions • Private Patient Records</span>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("cardio_token", access_token);
      localStorage.setItem("cardio_user", JSON.stringify(user));

      toast.success(`Account created! Welcome, Dr. ${user.full_name || "Clinician"}`);
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Registration failed. An account with this email may exist.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell min-h-screen flex items-center justify-center p-6">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <Logo />
          </div>
          <span className="eyebrow justify-center">CREATE CLINICIAN ACCOUNT</span>
          <h1 className="text-3xl font-bold tracking-tight text-ink font-serif">
            Register for Cardia
          </h1>
          <p className="text-xs text-muted">
            Start saving patient risk trajectories and compiling diagnostic summaries
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl space-y-6 border border-line">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Full Name / Doctor Title
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-dim" />
                <input
                  type="text"
                  placeholder="Dr. Samantha Patel"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-card/80 text-xs text-ink placeholder:text-dim focus:outline-none focus:border-cyan"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <span className="text-[10px] text-red-600 block mt-1">{errors.fullName.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Hospital / Institutional Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-dim" />
                <input
                  type="email"
                  placeholder="s.patel@cardiology.med"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-card/80 text-xs text-ink placeholder:text-dim focus:outline-none focus:border-cyan"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-600 block mt-1">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-dim" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-line bg-card/80 text-xs text-ink placeholder:text-dim focus:outline-none focus:border-cyan"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-600 block mt-1">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button button-primary w-full justify-center !py-3 !text-xs disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Clinician Account"}
            </button>
          </form>

          <div className="pt-4 border-t border-line text-center text-xs text-muted">
            <span>Already have an account? </span>
            <Link to="/login" className="text-cyan font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
