import React from 'react';
import { RefreshCw, Shield, Wallet, CreditCard } from 'lucide-react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Loader Indicator */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          </div>
          <div>
            <div className="h-4 w-48 bg-slate-800 rounded animate-pulse mb-1.5" />
            <div className="h-3 w-64 bg-slate-800/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Synchronizing Web3 Vault</span>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Card & Physical Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Skeleton */}
          <div className="w-full max-w-md mx-auto aspect-[1.586/1] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-slate-800 rounded-full animate-pulse" />
            </div>

            <div className="space-y-2 my-auto">
              <div className="h-3 w-20 bg-slate-800/60 rounded animate-pulse" />
              <div className="h-6 w-56 bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-white/5">
              <div className="space-y-1">
                <div className="h-2.5 w-16 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-12 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="glass-card rounded-3xl p-6 space-y-5 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-slate-800/50 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-800/50 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-slate-800/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Overview & Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Holdings Skeleton */}
          <div className="glass-card rounded-3xl p-6 space-y-6 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <div className="h-3 w-32 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-9 w-48 bg-slate-800 rounded-xl animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-28 bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-10 w-28 bg-slate-800 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Assets List Skeletons */}
            <div className="space-y-3">
              <div className="h-4 w-28 bg-slate-800/60 rounded animate-pulse mb-2" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-slate-800/60 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 w-24 bg-slate-800 rounded animate-pulse ml-auto" />
                    <div className="h-3 w-16 bg-slate-800/60 rounded animate-pulse ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Skeleton */}
          <div className="glass-card rounded-3xl p-6 space-y-4 border border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="h-5 w-36 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-800/60 rounded animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-28 bg-slate-800 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-slate-800/60 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
