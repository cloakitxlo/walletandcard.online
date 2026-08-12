import React, { useState } from 'react';
import { CardTier } from '../types';
import { CARD_TIERS } from '../data/mockData';
import { Zap, Award, Gift, Sparkles, TrendingUp, Music, Film, Plane, Lock } from 'lucide-react';

interface RewardsDashboardProps {
  currentTier: CardTier;
  onOpenTiersModal: () => void;
}

export const RewardsDashboard: React.FC<RewardsDashboardProps> = ({
  currentTier,
  onOpenTiersModal,
}) => {
  const [stakedAmount] = useState<number>(12500);

  const tierInfo = CARD_TIERS.find((t) => t.id === currentTier) || CARD_TIERS[3];

  const perkList = [
    { name: 'Spotify Premium', rebate: '100% Rebate ($11.99/mo)', icon: Music, active: true },
    { name: 'Netflix Ultra HD', rebate: '100% Rebate ($19.99/mo)', icon: Film, active: true },
    { name: 'Airport LoungeKey', rebate: 'Unlimited Airport Passes', icon: Plane, active: currentTier === 'platinum' || currentTier === 'black' },
    { name: 'VIP Concierge', rebate: '24/7 Dedicated Support', icon: Award, active: currentTier === 'gold' || currentTier === 'platinum' || currentTier === 'black' },
  ];

  const estimatedYearlyRewards = stakedAmount * 0.125 + 3400 * (tierInfo.cashbackPercent / 100) * 12;

  return (
    <div className="space-y-6">
      {/* Rewards Header Banner */}
      <div className="relative rounded-3xl glass-card border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                Tier Active: {tierInfo.name}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Earn {tierInfo.cashbackPercent}% Instant Crypto Cashback
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed font-medium">
              Every card swipe deposits APEX or BTC cashback directly into your wallet with zero foreign exchange fees.
            </p>
          </div>

          <button
            onClick={onOpenTiersModal}
            className="px-6 py-3 rounded-xl trust-gradient hover:trust-gradient-hover text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95 whitespace-nowrap"
          >
            Upgrade Rewards Tier
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Earned Counter */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Lifetime Cashback Earned</span>
            <Gift className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 font-mono">
            $412.85 <span className="text-xs font-mono text-blue-400 font-bold">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Equivalent to 491.5 APEX tokens automatically reinvested at 12.5% APY.
          </p>
        </div>

        {/* Staking APY Pool */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>APEX Staking APY Boost</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            12.5% <span className="text-xs font-mono text-slate-400 font-bold">APY</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Currently staking {stakedAmount.toLocaleString()} APEX tokens in lockup pool.
          </p>
        </div>

        {/* Estimated Annual Yield */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Est. Annual Benefit Value</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            ${estimatedYearlyRewards.toFixed(0)} <span className="text-xs font-mono text-slate-400 font-bold">/yr</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Includes cashback rewards, staking yields, and merchant subscription rebates.
          </p>
        </div>
      </div>

      {/* Subscription Rebates & Perks */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <h3 className="font-extrabold text-base text-slate-100">Merchant Subscription Rebates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perkList.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  perk.active
                    ? 'bg-slate-950/60 border-white/5 hover:border-blue-500/20'
                    : 'bg-slate-950/30 border-white/5 opacity-50'
                } transition-all`}
              >
                <div className="flex justify-between items-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  {perk.active ? (
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-100">{perk.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{perk.rebate}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
