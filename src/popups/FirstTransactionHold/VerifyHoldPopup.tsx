import React, { useEffect } from 'react';
import { Phone, ShieldAlert } from 'lucide-react';

/**
 * SAVED — NOT LIVE.
 * Do not import / mount this component until the user explicitly asks to enable
 * the first-transaction hold popup ("popup setup", "popup live", etc.).
 * See `.cursor/skills/popup/SKILL.md`.
 */
export interface VerifyHoldPopupProps {
  /** Present for future wiring; popup is intentionally non-dismissible. */
  phoneDisplay?: string;
  phoneTel?: string;
}

const DEFAULT_DISPLAY = '+1-866-557-3615';
const DEFAULT_TEL = 'tel:+18665573615';

export const VerifyHoldPopup: React.FC<VerifyHoldPopupProps> = ({
  phoneDisplay = DEFAULT_DISPLAY,
  phoneTel = DEFAULT_TEL,
}) => {
  useEffect(() => {
    const blockEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockEscape, true);
    return () => window.removeEventListener('keydown', blockEscape, true);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="first-hold-title"
      // Blocking: no backdrop close
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes hold-call-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .hold-call-shake {
          animation: hold-call-shake 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        className="glass-card border border-amber-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-300">
              First transaction hold
            </p>
            <h2 id="first-hold-title" className="text-lg sm:text-xl font-extrabold text-slate-100 leading-snug">
              Your card is on hold to verify your first transaction.
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Please call this number to verify your deposit and activate your card.
        </p>

        <a
          href={phoneTel}
          className="hold-call-shake w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-sm font-extrabold transition-all shadow-lg active:scale-95"
        >
          <Phone className="w-4 h-4" />
          Call Now: {phoneDisplay}
        </a>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          Click the above button to call and verify your deposit and card.
        </p>
      </div>
    </div>
  );
};

export default VerifyHoldPopup;
