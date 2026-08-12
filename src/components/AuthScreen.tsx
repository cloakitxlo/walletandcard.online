import React, { useState } from 'react';
import { AuthUser, ConnectedUser } from '../types';
import { ShieldCheck, Lock, Mail, User, Key, ArrowRight, ShieldAlert } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser, userAccount?: ConnectedUser) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
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
    } catch (err: any) {
      setError('Connection error. Server failed to process login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#eaecef] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>WALLET & CARD PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            {mode === 'login' ? 'Account Login' : 'Create User Account'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Access your crypto card, TRC20/BEP20 vaults, and balance management.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-2xl border border-white/10 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setInfo(null); }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'trust-gradient text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'signup'
                ? 'trust-gradient text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Full Name {mode === 'login' && <span className="text-slate-400 font-normal lowercase">(matches card name)</span>}
              </label>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter Your Full Name"
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Login ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            {info && (
              <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs font-bold text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold text-left flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Enter Dashboard' : 'Create Account & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 pt-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-bit AES End-to-End Vault Authentication</span>
        </div>

      </div>
    </div>
  );
}
