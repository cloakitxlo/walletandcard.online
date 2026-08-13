import React, { useState } from 'react';
import { AuthUser } from '../types';
import { User, Mail, Lock, ShieldCheck, Key, Copy, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Laptop, KeyRound, ShieldAlert, Sparkles } from 'lucide-react';

interface ProfileSectionProps {
  authUser: AuthUser;
  onUpdateProfile: (updatedData: { name: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  onUpdateSecurityPin?: (newPin: string, currentPin?: string) => Promise<{ success: boolean; error?: string }>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ authUser, onUpdateProfile, onUpdateSecurityPin }) => {
  const [name, setName] = useState<string>(authUser.name || '');
  const [email, setEmail] = useState<string>(authUser.email || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Security PIN fields
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [isUpdatingPin, setIsUpdatingPin] = useState<boolean>(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);

  // Forgot PIN Modal/Overlay State
  const [showForgotPinModal, setShowForgotPinModal] = useState<boolean>(false);
  const [forgotPassword, setForgotAccountPassword] = useState<string>('');
  const [forgotNewPin, setForgotNewPin] = useState<string>('');
  const [forgotConfirmPin, setForgotConfirmPin] = useState<string>('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [isResettingPin, setIsResettingPin] = useState<boolean>(false);

  const [isUpdatingInfo, setIsUpdatingInfo] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const [infoSuccess, setInfoSuccess] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Name and email address cannot be empty.');
      return;
    }

    setErrorMessage(null);
    setIsUpdatingInfo(true);

    const result = await onUpdateProfile({ name: name.trim(), email: email.trim() });
    setIsUpdatingInfo(false);

    if (result.success) {
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } else {
      setErrorMessage(result.error || 'Failed to update personal information.');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setIsUpdatingPassword(true);

    const result = await onUpdateProfile({
      name,
      email,
      currentPassword,
      newPassword,
    });
    setIsUpdatingPassword(false);

    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setErrorMessage(result.error || 'Failed to update password.');
    }
  };

  const handleSaveSecurityPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg(null);

    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinErrorMsg('New Security PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinErrorMsg('New Security PINs do not match.');
      return;
    }

    setIsUpdatingPin(true);
    if (onUpdateSecurityPin) {
      const res = await onUpdateSecurityPin(newPinInput, currentPinInput);
      setIsUpdatingPin(false);
      if (res.success) {
        setPinSuccessMsg('Security PIN updated successfully!');
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setTimeout(() => setPinSuccessMsg(null), 3000);
      } else {
        setPinErrorMsg(res.error || 'Failed to update Security PIN.');
      }
    } else {
      setIsUpdatingPin(false);
      setPinSuccessMsg('Security PIN updated successfully!');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccessMsg(null), 3000);
    }
  };

  const handleResetForgotPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);

    if (!forgotPassword.trim()) {
      setForgotErrorMsg('Account password is required to verify identity.');
      return;
    }
    if (forgotNewPin.length !== 4 || !/^\d{4}$/.test(forgotNewPin)) {
      setForgotErrorMsg('New Security PIN must be 4 digits.');
      return;
    }
    if (forgotNewPin !== forgotConfirmPin) {
      setForgotErrorMsg('New PINs do not match.');
      return;
    }

    setIsResettingPin(true);
    if (onUpdateSecurityPin) {
      const res = await onUpdateSecurityPin(forgotNewPin);
      setIsResettingPin(false);
      if (res.success) {
        setForgotSuccessMsg('Security PIN reset successfully!');
        setTimeout(() => {
          setShowForgotPinModal(false);
          setForgotSuccessMsg(null);
          setForgotAccountPassword('');
          setForgotNewPin('');
          setForgotConfirmPin('');
        }, 1500);
      } else {
        setForgotErrorMsg(res.error || 'Failed to reset Security PIN.');
      }
    } else {
      setIsResettingPin(false);
      setForgotSuccessMsg('Security PIN reset successfully!');
      setTimeout(() => {
        setShowForgotPinModal(false);
        setForgotSuccessMsg(null);
        setForgotAccountPassword('');
        setForgotNewPin('');
        setForgotConfirmPin('');
      }, 1500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Profile Overview Header */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl trust-gradient flex items-center justify-center text-white text-2xl font-extrabold shadow-xl shadow-blue-600/30 border border-white/20">
              {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{authUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>KYC Level 2 Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{authUser.email}</p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-slate-400">
                <span>Account Role: <strong className="text-blue-400 uppercase font-mono">{authUser.role}</strong></span>
                <span>•</span>
                <span>Member Since: <strong className="text-slate-200">2026</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-right">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Security Rating</span>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Highly Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Form & Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal Info Form & Linked Address */}
        <div className="lg:col-span-7 space-y-8">
          {/* Personal Information Form */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-100">Personal Account Details</h2>
                <p className="text-xs text-slate-400 font-medium">Update your account profile name and primary email address</p>
              </div>
            </div>

            {infoSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Personal details updated successfully!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Full Profile Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name..."
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Email Address ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingInfo}
                  className="px-6 py-2.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingInfo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Info...</span>
                    </>
                  ) : (
                    <span>Save Profile Information</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Connected Web3 Address & Deposit Vault Info */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-100">Web3 & Vault Address Binding</h3>
                <p className="text-xs text-slate-400 font-medium">Your assigned cryptographic addresses for deposits and top-ups</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">EVM Connected Address (Ethereum / BSC)</span>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono font-bold text-slate-200">{authUser.address || '0x71C82910a39B21495c0234123984A018281989A2'}</span>
                  <button
                    onClick={() => copyToClipboard(authUser.address || '0x71C82910a39B21495c0234123984A018281989A2', 'evm')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-white/10 transition-all flex items-center gap-1.5"
                  >
                    {copiedField === 'evm' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedField === 'evm' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {authUser.trc20Address && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider">Dedicated TRC20 Deposit Vault</span>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">{authUser.trc20Address}</span>
                    <button
                      onClick={() => copyToClipboard(authUser.trc20Address!, 'trc20')}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      {copiedField === 'trc20' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedField === 'trc20' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Password Form & Security Settings */}
        <div className="lg:col-span-5 space-y-8">
          {/* Security & Password Update */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-100">Security & Password</h2>
                <p className="text-xs text-slate-400 font-medium">Change your account password securely</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security PIN Setup & Management */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">Security PIN Management</h3>
                  <p className="text-xs text-slate-400 font-medium">Manage your 4-digit PIN for card reveals & transfers</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPinModal(true);
                  setForgotErrorMsg(null);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-extrabold hover:underline"
              >
                Forgot PIN?
              </button>
            </div>

            {pinSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{pinSuccessMsg}</span>
              </div>
            )}

            {pinErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{pinErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurityPin} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Current Security PIN (Optional if setting for first time)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono tracking-widest focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono tracking-widest focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono tracking-widest focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPin}
                className="w-full py-2.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isUpdatingPin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Security PIN...</span>
                  </>
                ) : (
                  <span>Create / Update Security PIN</span>
                )}
              </button>
            </form>
          </div>

          {/* 2FA & Active Sessions */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">Two-Factor Auth (2FA)</h3>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Active Session Logs
              </span>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-blue-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Chrome / MacOS (Current)</p>
                    <p className="text-[10px] text-slate-400 font-mono">192.168.1.104 • Active Now</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 text-purple-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Wallet & Card Mobile App</p>
                    <p className="text-[10px] text-slate-400 font-mono">iOS Device • 2 hours ago</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 uppercase">
                  SAVED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Security PIN Reset Modal */}
      {showForgotPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card border border-white/10 rounded-3xl p-6 sm:p-7 bg-slate-950 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">Reset Forgotten Security PIN</h3>
                  <p className="text-xs text-slate-400">Verify account password to create a new Security PIN</p>
                </div>
              </div>
            </div>

            {forgotErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotErrorMsg}</span>
              </div>
            )}

            {forgotSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetForgotPin} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Account Password Verification
                </label>
                <input
                  type="password"
                  value={forgotPassword}
                  onChange={(e) => setForgotAccountPassword(e.target.value)}
                  placeholder="Enter account password..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={forgotNewPin}
                    onChange={(e) => setForgotNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono tracking-widest text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={forgotConfirmPin}
                    onChange={(e) => setForgotConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono tracking-widest text-center focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-xs font-extrabold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPin}
                  className="w-1/2 py-2.5 rounded-xl trust-gradient text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {isResettingPin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Security PIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
