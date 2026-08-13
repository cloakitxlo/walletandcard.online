import React, { useState } from 'react';
import { CryptoCard } from '../types';
import { CARD_TIERS } from '../data/mockData';
import { Eye, EyeOff, Lock, Unlock, ShieldAlert, Wifi, Sparkles, RefreshCw, KeyRound, Shield } from 'lucide-react';
import { SecurityAuthModal } from './SecurityAuthModal';

interface CryptoCard3DProps {
  card: CryptoCard;
  expectedSecurityPin?: string;
  isCardActive?: boolean;
  onToggleFreeze: () => void;
  onOpenTopup: () => void;
  onOpenTiers: () => void;
  onResetSecurityPin?: (newPin: string) => Promise<boolean>;
}

export const CryptoCard3D: React.FC<CryptoCard3DProps> = ({
  card,
  expectedSecurityPin = '1234',
  isCardActive = false,
  onToggleFreeze,
  onOpenTopup,
  onOpenTiers,
  onResetSecurityPin,
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSecurityAuthModal, setShowSecurityAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'reveal_pin' | 'toggle_freeze' | 'reveal_details' | null>(null);

  const tierInfo = CARD_TIERS.find((t) => t.id === card.tier) || CARD_TIERS[3];
  const cardAtmPin = card.cardPin || '7842';

  // Dynamic Card Tier Styling Configuration
  const getTierStyleConfig = (tier: string) => {
    switch (tier) {
      case 'black':
        return {
          glowClass:
            'bg-gradient-to-r from-blue-600/70 via-indigo-900/80 to-purple-950/70 shadow-[0_0_65px_rgba(59,130,246,0.35)] animate-aura-pulse',
          cardBgClass:
            'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-zinc-700/80 shadow-2xl shadow-blue-950/50 hover:border-blue-500/50',
          shimmerGradient: 'from-blue-400/20 via-indigo-300/15 to-transparent',
          badgeClass:
            'bg-zinc-900/90 text-zinc-100 border-zinc-700 shadow-md shadow-black/80 font-mono tracking-widest',
          badgeLabel: 'OBSIDIAN BLACK',
          chipGradient: 'from-amber-300 via-yellow-200 to-amber-400 border-amber-500/60',
          watermarkColor: 'text-zinc-800 fill-zinc-800/30',
          accentGlowColor: 'bg-blue-500/20',
          starColor: 'text-blue-400',
          tagBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
      case 'gold':
        return {
          glowClass:
            'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_75px_rgba(245,158,11,0.5)] animate-aura-pulse',
          cardBgClass:
            'bg-gradient-to-br from-amber-950 via-yellow-950 to-amber-900 border-amber-400/80 shadow-2xl shadow-amber-950/80 hover:border-amber-300',
          shimmerGradient: 'from-yellow-200/40 via-amber-300/25 to-transparent',
          badgeClass:
            'bg-amber-500/20 text-amber-200 border-amber-400/70 shadow-md shadow-amber-900/50 font-mono tracking-widest',
          badgeLabel: '24K GOLD PRESTIGE',
          chipGradient: 'from-amber-200 via-yellow-300 to-amber-400 border-amber-400',
          watermarkColor: 'text-amber-500/15 fill-amber-500/15',
          accentGlowColor: 'bg-amber-500/25',
          starColor: 'text-amber-300',
          tagBg: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
        };
      case 'silver':
      case 'standard':
        return {
          glowClass:
            'bg-gradient-to-r from-slate-200 via-zinc-300 to-slate-400 shadow-[0_0_55px_rgba(226,232,240,0.4)] animate-aura-pulse',
          cardBgClass:
            'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 border-slate-400/70 shadow-2xl shadow-slate-950/80 hover:border-slate-300',
          shimmerGradient: 'from-white/50 via-slate-200/30 to-transparent',
          badgeClass:
            'bg-slate-800/90 text-slate-100 border-slate-400/70 shadow-md font-mono tracking-widest',
          badgeLabel: 'SILVER METALLIC',
          chipGradient: 'from-slate-100 via-slate-200 to-zinc-300 border-slate-400',
          watermarkColor: 'text-slate-400/15 fill-slate-400/15',
          accentGlowColor: 'bg-slate-400/20',
          starColor: 'text-slate-200',
          tagBg: 'bg-slate-700/50 text-slate-200 border-slate-500/40',
        };
      case 'platinum':
      default:
        return {
          glowClass:
            'bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 shadow-[0_0_65px_rgba(34,211,238,0.4)] animate-aura-pulse',
          cardBgClass:
            'bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 border-cyan-400/80 shadow-2xl shadow-cyan-950/80 hover:border-cyan-300',
          shimmerGradient: 'from-cyan-300/40 via-teal-200/25 to-transparent',
          badgeClass:
            'bg-cyan-950/90 text-cyan-200 border-cyan-400/70 shadow-md shadow-cyan-950/50 font-mono tracking-widest',
          badgeLabel: 'PLATINUM TITANIUM',
          chipGradient: 'from-cyan-200 via-teal-200 to-slate-200 border-cyan-400',
          watermarkColor: 'text-cyan-400/15 fill-cyan-400/15',
          accentGlowColor: 'bg-cyan-500/20',
          starColor: 'text-cyan-300',
          tagBg: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40',
        };
    }
  };

  const tierStyle = getTierStyleConfig(card.tier);

  const formatCardNumber = (num: string) => {
    if (showCardNumber) {
      return num.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  const handleRequestViewPin = () => {
    setPendingAction('reveal_pin');
    setShowSecurityAuthModal(true);
  };

  const handleRequestToggleDetails = () => {
    if (showCardNumber) {
      setShowCardNumber(false);
    } else {
      setPendingAction('reveal_details');
      setShowSecurityAuthModal(true);
    }
  };

  const handleSecurityAuthSuccess = () => {
    setShowSecurityAuthModal(false);
    if (pendingAction === 'reveal_pin') {
      setShowPinModal(true);
    } else if (pendingAction === 'reveal_details') {
      setShowCardNumber(true);
    } else if (pendingAction === 'toggle_freeze') {
      onToggleFreeze();
    }
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Container with Perspective */}
      <div className="w-full max-w-md perspective-1000 relative group">
        {/* Dynamic Tier Ambient Background Glow */}
        <div
          className={`absolute -inset-2.5 rounded-3xl blur-2xl transition-all duration-700 pointer-events-none ${
            card.isFrozen ? 'opacity-20 bg-slate-800' : 'opacity-80 group-hover:opacity-100 ' + tierStyle.glowClass
          }`}
        />

        {/* Floating Ambient Corner Flares */}
        <div className={`absolute -top-4 -left-4 w-28 h-28 rounded-full blur-2xl pointer-events-none ${tierStyle.accentGlowColor}`} />
        <div className={`absolute -bottom-4 -right-4 w-28 h-28 rounded-full blur-2xl pointer-events-none ${tierStyle.accentGlowColor}`} />

        {/* Physical Metallic Card Body */}
        <div
          className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 transform border backdrop-blur-xl overflow-hidden cursor-pointer select-none ${
            tierStyle.cardBgClass
          } ${card.isFrozen ? 'brightness-50 grayscale' : 'hover:scale-[1.02] hover:-translate-y-1'}`}
        >
          {/* Animated Shimmering Gradient Light Beam Sweep */}
          {!card.isFrozen && (
            <div
              className={`absolute inset-0 w-1/2 h-full bg-gradient-to-r ${tierStyle.shimmerGradient} pointer-events-none animate-card-shimmer`}
            />
          )}

          {/* Subtle Metallic Grain & Radial Reflection */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/75 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl transform rotate-45 pointer-events-none" />

          {/* Card Shield Watermark background */}
          <div className={`absolute right-4 bottom-2 pointer-events-none ${tierStyle.watermarkColor}`}>
            <Shield className="w-48 h-48" />
          </div>

          {/* Frozen Watermark Overlay */}
          {card.isFrozen && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <ShieldAlert className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
              <span className="text-sm font-extrabold text-white tracking-wider uppercase">
                Card Temporarily Locked
              </span>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                Online purchases and ATM withdrawals are paused for security.
              </p>
              <button
                onClick={onToggleFreeze}
                className="mt-4 px-5 py-2 rounded-xl trust-gradient text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-600/30"
              >
                Unlock Card Now
              </button>
            </div>
          )}

          {/* Top Header: Brand & Dynamic Tier Badge */}
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-white fill-white/20" />
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                CARD
              </span>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${tierStyle.badgeClass}`}>
                {tierStyle.badgeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Wifi className="w-5 h-5 text-white/80 transform rotate-90" />
              <Sparkles className={`w-4 h-4 animate-pulse ${tierStyle.starColor}`} />
            </div>
          </div>

          {/* Middle: Custom Tier EMV Chip & Contactless Indicator */}
          <div className="flex items-center gap-4 z-10 my-1">
            {/* Dynamic Tier EMV Chip Visual */}
            <div className={`w-12 h-9 rounded-md bg-gradient-to-tr ${tierStyle.chipGradient} p-0.5 shadow-md flex flex-col justify-between border`}>
              <div className="h-full w-full rounded border border-black/20 grid grid-cols-2 gap-0.5 p-0.5 opacity-85">
                <div className="bg-black/20 rounded-sm" />
                <div className="bg-black/20 rounded-sm" />
                <div className="bg-black/20 rounded-sm" />
                <div className="bg-black/20 rounded-sm" />
              </div>
            </div>
            <div className="text-[10px] tracking-widest text-white/80 font-mono font-extrabold uppercase drop-shadow">
              DEBIT CARD
            </div>
          </div>

          {/* Bottom Card Numbers & Expiry */}
          <div className="z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-widest drop-shadow-md">
                {formatCardNumber(card.cardNumber)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestToggleDetails();
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                title={showCardNumber ? 'Hide Card Details' : 'Show Card Details'}
              >
                {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-end text-xs text-white/90">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono font-semibold">
                  Cardholder
                </p>
                <p className="font-mono font-bold tracking-wide uppercase text-white drop-shadow">
                  {card.cardHolder}
                </p>
              </div>

              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono font-semibold">
                    Expires
                  </p>
                  <p className="font-mono font-bold text-white">{card.expiryDate}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono font-semibold">
                    CVV
                  </p>
                  <p className="font-mono font-bold text-white">
                    {showCardNumber ? card.cvv : '•••'}
                  </p>
                </div>
              </div>

              {/* Network Logo */}
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/90 shadow-sm border border-white/20" />
                <div className="w-6 h-6 rounded-full bg-cyan-400/90 shadow-sm border border-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Balance under Card */}
      <div className={`w-full max-w-md mt-5 p-4 rounded-2xl glass-card border bg-slate-950/60 flex items-center justify-between gap-3 ${
        isCardActive ? 'border-emerald-500/30' : 'border-amber-500/30'
      }`}>
        <div>
          <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Card Balance</p>
          <p className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
            ${(card.balanceUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Available</p>
          {isCardActive ? (
            <p className="text-xs font-bold text-emerald-400 mt-1">Ready to spend</p>
          ) : (
            <p className="text-xs font-bold text-amber-400 mt-1">Not Active</p>
          )}
        </div>
      </div>

      {/* Quick Action Bar under Card */}
      <div className="w-full max-w-md grid grid-cols-4 gap-2.5 mt-3">
        <button
          onClick={onToggleFreeze}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
            card.isFrozen
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
              : 'glass-card text-slate-200 border-white/10 hover:border-blue-500/30 hover:text-white'
          }`}
        >
          {card.isFrozen ? <Unlock className="w-4 h-4 mb-1 text-blue-400" /> : <Lock className="w-4 h-4 mb-1 text-slate-400" />}
          <span>{card.isFrozen ? 'Unlock' : 'Freeze'}</span>
        </button>

        <button
          onClick={onOpenTopup}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-card text-slate-200 hover:text-white border border-white/10 hover:border-blue-500/30 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-4 h-4 mb-1 text-emerald-400" />
          <span>Top Up</span>
        </button>

        <button
          onClick={handleRequestViewPin}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-card text-slate-200 hover:text-white border border-white/10 hover:border-blue-500/30 text-xs font-bold transition-all"
        >
          <KeyRound className="w-4 h-4 mb-1 text-amber-400" />
          <span>View PIN</span>
        </button>

        <button
          onClick={onOpenTiers}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-card text-slate-200 hover:text-white border border-white/10 hover:border-blue-500/30 text-xs font-bold transition-all"
        >
          <Sparkles className="w-4 h-4 mb-1 text-purple-400" />
          <span>Tiers</span>
        </button>
      </div>

      {/* PIN Reveal Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Physical Card ATM PIN</h3>
              <p className="text-xs text-slate-400 mt-1">
                Unlocked via Security PIN authentication. Use at ATMs and payment terminals.
              </p>
            </div>

            <div className="py-4 bg-slate-950/80 rounded-2xl border border-white/10 font-mono text-3xl font-extrabold text-amber-400 tracking-widest">
              {cardAtmPin}
            </div>

            <p className="text-[11px] text-slate-400">
              Never share your PIN code with anyone. Wallet & Card Support will never ask for your PIN.
            </p>

            <button
              onClick={() => setShowPinModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-white/10"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Security Auth Modal for PIN Reveal / Card Details */}
      {showSecurityAuthModal && (
        <SecurityAuthModal
          isOpen={showSecurityAuthModal}
          actionTitle={
            pendingAction === 'reveal_pin'
              ? 'Unlock Physical Card PIN'
              : pendingAction === 'reveal_details'
              ? 'Reveal Sensitive Card Details'
              : 'Card Security Verification'
          }
          actionDescription={
            pendingAction === 'reveal_pin'
              ? 'Enter your 4-digit Security PIN or scan Face ID/Touch ID to unlock card PIN.'
              : 'Enter Security PIN to reveal card number & CVV on screen.'
          }
          expectedPin={expectedSecurityPin}
          onSuccess={handleSecurityAuthSuccess}
          onCancel={() => {
            setShowSecurityAuthModal(false);
            setPendingAction(null);
          }}
          onResetPin={onResetSecurityPin}
        />
      )}
    </div>
  );
};
