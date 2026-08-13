import React, { useState } from 'react';
import { Lock, Fingerprint, ShieldAlert, KeyRound, Check, RefreshCw, X, AlertCircle } from 'lucide-react';

export interface SecurityAuthModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  expectedPin?: string;
  amountUsd?: number;
  targetInfo?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onResetPin?: (newPin: string) => Promise<boolean>;
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  expectedPin = '1234',
  amountUsd,
  targetInfo,
  onSuccess,
  onCancel,
  onResetPin,
}) => {
  const [authMode, setAuthMode] = useState<'pin' | 'biometric'>('pin');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  // Forgot PIN Overlay state
  const [showForgotPinOverlay, setShowForgotPinOverlay] = useState<boolean>(false);
  const [recoveryAccountPassword, setRecoveryAccountPassword] = useState<string>('');
  const [newSecurityPin, setNewSecurityPin] = useState<string>('');
  const [confirmSecurityPin, setConfirmSecurityPin] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPin = (enteredPin: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (enteredPin === expectedPin) {
        onSuccess();
      } else {
        setErrorMsg('Incorrect Security PIN. Please try again.');
        setPin('');
      }
    }, 400);
  };

  const triggerBiometricScan = () => {
    setIsBiometricScanning(true);
    setBiometricSuccess(false);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 1500);
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);

    if (!recoveryAccountPassword.trim()) {
      setResetErrorMsg('Please enter your account password to verify identity.');
      return;
    }
    if (newSecurityPin.length !== 4 || !/^\d{4}$/.test(newSecurityPin)) {
      setResetErrorMsg('Security PIN must be exactly 4 digits.');
      return;
    }
    if (newSecurityPin !== confirmSecurityPin) {
      setResetErrorMsg('New PINs do not match.');
      return;
    }

    setIsResetting(true);
    if (onResetPin) {
      const ok = await onResetPin(newSecurityPin);
      setIsResetting(false);
      if (ok) {
        setResetSuccessMsg('Security PIN reset successfully! Enter your new PIN to proceed.');
        setTimeout(() => {
          setShowForgotPinOverlay(false);
          setResetSuccessMsg(null);
          setPin('');
        }, 1200);
      } else {
        setResetErrorMsg('Failed to reset Security PIN. Check password.');
      }
    } else {
      setIsResetting(false);
      setResetSuccessMsg('Security PIN updated to ' + newSecurityPin + '!');
      setTimeout(() => {
        setShowForgotPinOverlay(false);
        setResetSuccessMsg(null);
        setPin('');
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-card border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition-all border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl trust-gradient text-white shadow-lg shadow-blue-600/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">{actionTitle}</h3>
            <p className="text-xs text-slate-400 font-medium">{actionDescription}</p>
          </div>
        </div>

        {/* Amount / Target context if available */}
        {(amountUsd || targetInfo) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1 text-xs font-mono">
            {amountUsd && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Value:</span>
                <span className="text-emerald-400 font-extrabold">${amountUsd.toLocaleString()} USD</span>
              </div>
            )}
            {targetInfo && (
              <div className="flex justify-between">
                <span className="text-slate-400">Target Address/User:</span>
                <span className="text-slate-200 font-bold truncate max-w-[180px]">{targetInfo}</span>
              </div>
            )}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-white/10 mb-6">
          <button
            onClick={() => {
              setAuthMode('pin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              authMode === 'pin'
                ? 'trust-gradient text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security PIN</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('biometric');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              authMode === 'biometric'
                ? 'trust-gradient text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Face ID / Touch ID</span>
          </button>
        </div>

        {/* Forgotten PIN Overlay */}
        {showForgotPinOverlay ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium">
              Verify account credentials below to reset your 4-digit Security PIN immediately.
            </div>

            {resetErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetErrorMsg}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPinSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  value={recoveryAccountPassword}
                  onChange={(e) => setRecoveryAccountPassword(e.target.value)}
                  placeholder="Enter account password..."
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newSecurityPin}
                    onChange={(e) => setNewSecurityPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-center text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmSecurityPin}
                    onChange={(e) => setConfirmSecurityPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-center text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPinOverlay(false)}
                  className="w-1/2 py-2.5 rounded-xl glass-card text-slate-300 text-xs font-extrabold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-1/2 py-2.5 rounded-xl trust-gradient text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5"
                >
                  {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Reset PIN</span>}
                </button>
              </div>
            </form>
          </div>
        ) : authMode === 'pin' ? (
          /* Security PIN Entry Mode */
          <div className="space-y-5">
            {/* PIN Display Dots */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Enter 4-Digit Security PIN
              </span>
              <div className="flex items-center justify-center gap-3 my-2">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border font-mono text-lg transition-all ${
                        filled
                          ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                          : 'bg-slate-950/80 border-white/10 text-slate-600'
                      }`}
                    >
                      {filled ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  disabled={isVerifying}
                  className="h-12 rounded-2xl glass-card border border-white/10 text-slate-100 hover:text-white hover:border-blue-500/40 text-base font-extrabold transition-all active:scale-95 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeypadPress('0')}
                disabled={isVerifying}
                className="h-12 rounded-2xl glass-card border border-white/10 text-slate-100 hover:text-white hover:border-blue-500/40 text-base font-extrabold transition-all active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleKeypadDelete}
                disabled={isVerifying}
                className="h-12 rounded-2xl glass-card border border-white/10 text-slate-400 hover:text-white hover:border-rose-500/40 text-xs font-extrabold transition-all active:scale-95 flex items-center justify-center"
              >
                DEL
              </button>
            </div>

            {/* Forgot Security PIN Option */}
            <div className="text-center pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setShowForgotPinOverlay(true);
                  setResetErrorMsg(null);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-extrabold hover:underline inline-flex items-center gap-1.5"
              >
                <span>Forgot Security PIN?</span>
              </button>
            </div>
          </div>
        ) : (
          /* Biometrics Mode */
          <div className="space-y-6 py-4 text-center">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed ${
                  isBiometricScanning
                    ? 'border-blue-500 animate-spin'
                    : biometricSuccess
                    ? 'border-emerald-500 scale-105'
                    : 'border-white/20'
                }`}
              />
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  biometricSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/30 scale-110'
                    : isBiometricScanning
                    ? 'trust-gradient text-white shadow-xl shadow-blue-600/40'
                    : 'bg-slate-900 text-slate-400 border border-white/10'
                }`}
              >
                {biometricSuccess ? (
                  <Check className="w-10 h-10 text-emerald-400" />
                ) : (
                  <Fingerprint className="w-10 h-10" />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-100">
                {biometricSuccess
                  ? 'Biometric Scan Verified!'
                  : isBiometricScanning
                  ? 'Scanning Face ID / Touch ID...'
                  : 'Touch ID or Face ID Scan'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {biometricSuccess
                  ? 'Identity confirmed. Unlocking action...'
                  : isBiometricScanning
                  ? 'Aligning hardware biometric sensors...'
                  : 'Click below to initiate hardware biometric scan.'}
              </p>
            </div>

            {!biometricSuccess && (
              <button
                onClick={triggerBiometricScan}
                disabled={isBiometricScanning}
                className="w-full py-3 rounded-2xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isBiometricScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Hardware Biometrics...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Scan Face ID / Touch ID</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
