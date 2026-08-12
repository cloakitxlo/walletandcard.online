import React, { useState } from 'react';
import { SecurityLog } from '../types';
import { INITIAL_SECURITY_LOGS } from '../data/mockData';
import { ShieldCheck, Fingerprint, Activity } from 'lucide-react';

interface SecurityCenterProps {
  onToggleFreeze: () => void;
  isFrozen: boolean;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ onToggleFreeze, isFrozen }) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [antiPhishingCode, setAntiPhishingCode] = useState('APEX-2026-X9');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [logs] = useState<SecurityLog[]>(INITIAL_SECURITY_LOGS);
  const [codeSaved, setCodeSaved] = useState(false);

  const handleSaveCode = () => {
    setIsEditingCode(false);
    setCodeSaved(true);
    setTimeout(() => setCodeSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Decentralized Security Vault</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">Security & Anti-Phishing Controls</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage hardware biometric verification, security logs, and emergency card controls.
          </p>
        </div>

        <button
          onClick={onToggleFreeze}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 shadow-md ${
            isFrozen
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {isFrozen ? 'Emergency Unlock Card' : 'Emergency Lock Card'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Anti-Phishing Code & Biometrics */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <h3 className="font-extrabold text-base text-slate-100 border-b border-white/10 pb-3">
            Authentication Policies
          </h3>

          {/* Biometric 2FA */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-blue-400 border border-white/10">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100">Biometric Face ID / Touch ID</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Require hardware key for card transactions</p>
              </div>
            </div>
            <button
              onClick={() => setBiometricsEnabled(!biometricsEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                biometricsEnabled ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  biometricsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Anti-Phishing Code */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-extrabold text-slate-100">Anti-Phishing Security Code</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Verified code embedded in all official notifications</p>
              </div>
              <button
                onClick={() => setIsEditingCode(!isEditingCode)}
                className="text-xs text-blue-400 hover:underline font-bold"
              >
                {isEditingCode ? 'Cancel' : 'Edit Code'}
              </button>
            </div>

            {isEditingCode ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={antiPhishingCode}
                  onChange={(e) => setAntiPhishingCode(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none"
                />
                <button
                  onClick={handleSaveCode}
                  className="px-4 py-2 rounded-xl trust-gradient text-white font-extrabold text-xs transition-all shadow-md"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-white/10 font-mono text-xs text-blue-400 font-extrabold">
                <span>{antiPhishingCode}</span>
                {codeSaved && <span className="text-emerald-400 text-[10px] font-bold">Updated!</span>}
              </div>
            )}
          </div>
        </div>

        {/* Security Audit Trail */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Real-Time Audit Trail</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              Live Audited
            </span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-xs font-mono space-y-1 hover:border-white/10 transition-all"
              >
                <div className="flex justify-between text-slate-100 font-extrabold">
                  <span>{log.event}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{log.timestamp}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Device: {log.device}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
