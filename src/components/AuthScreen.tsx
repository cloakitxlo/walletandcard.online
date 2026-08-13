import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, ConnectedUser } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Shield,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser, userAccount?: ConnectedUser) => void;
  onBack?: () => void;
}

export function AuthScreen({ onLoginSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    if (mode === 'signup' && !fullName) {
      setError('Please enter your full name to register.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.userAccount);
      } else if (data.code === 'NEED_SIGNUP') {
        setMode('signup');
        setError(null);
        setInfo('No account found. Please sign up first, then you can log in with your email and password.');
      } else if (data.code === 'ALREADY_REGISTERED') {
        setMode('login');
        setError(null);
        setInfo('Account already exists. Please sign in with your email and password.');
      } else {
        setError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setError('Connection error. Server failed to process login.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  return (
    <div className="landing-root min-h-screen text-slate-100 relative overflow-x-hidden">
      <div className="landing-hero-plane absolute inset-0" aria-hidden="true" />
      <div className="landing-hero-sheen absolute inset-0 opacity-60" aria-hidden="true" />

      {/* Top bar — same language as landing */}
      <header className="relative z-20 border-b border-white/10 bg-[#070b12]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2.5 group text-left"
          >
            <span className="w-9 h-9 rounded-xl trust-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <span className="landing-display text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
              Wallet &amp; Card
            </span>
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-[calc(100svh-4rem)] flex items-center justify-center px-5 sm:px-8 py-10 sm:py-14">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left story panel — desktop */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block space-y-6"
          >
            <p className="landing-display text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.08]">
              Your crypto card portal starts here
            </p>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Sign in or create an account to load USDT, activate spending, and manage your Wallet &amp; Card — same secure experience from the homepage.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'No KYC friction to get started',
                'Encrypted account access',
                'Vault balances & card controls in one place',
              ].map((line) => (
                <li key={line} className="flex gap-3 border-l-2 border-blue-500/50 pl-4">
                  {line}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected session · Secure vault authentication</span>
            </div>
          </motion.div>

          {/* Auth panel */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="auth-panel rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-blue-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest">
                    Secure access
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h1 className="landing-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {mode === 'login' ? 'Account Login' : 'Create User Account'}
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                      {mode === 'login'
                        ? 'Welcome back. Enter your details to open your dashboard.'
                        : 'Create your Wallet & Card account and start in minutes.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2.5 rounded-lg transition-all ${
                    mode === 'login'
                      ? 'trust-gradient text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2.5 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'trust-gradient text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New Sign Up
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <AnimatePresence initial={false}>
                  {(mode === 'signup' || mode === 'login') && (
                    <motion.div
                      key={`name-${mode}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Full Name{' '}
                        {mode === 'login' && (
                          <span className="text-slate-500 font-medium normal-case tracking-normal">
                            (matches card name)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="auth-input w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Login ID / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="auth-input w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="auth-input w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {info && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-blue-500/12 border border-blue-500/30 text-blue-100 text-xs font-semibold text-left flex items-start gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{info}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-rose-500/12 border border-rose-500/30 text-rose-200 text-xs font-semibold text-left flex items-start gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="auth-spinner" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Enter Dashboard' : 'Create Account & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit AES vault authentication</span>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500 lg:hidden">
              Same secure Wallet &amp; Card experience — no KYC needed to get started.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
