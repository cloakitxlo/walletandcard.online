import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Bell, Zap, ArrowUpRight, Shield, ShieldAlert, Send, LogOut, User, Headphones } from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  authUser?: AuthUser | null;
  onLogout?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTopup: () => void;
  onOpenTiers: () => void;
  onOpenSendReceive: (mode?: 'send' | 'receive') => void;
}

export const Header: React.FC<HeaderProps> = ({
  authUser,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenTopup,
  onOpenTiers,
  onOpenSendReceive,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Cashback Credited', text: '+$64.95 Wallet & Card reward for Apple Store purchase.', time: '10m ago' },
    { id: 2, title: 'Card Auto Top-up', text: 'Auto top-up triggered: $500 added from ETH balance.', time: '2h ago' },
    { id: 3, title: 'Security Alert', text: 'New login session verified from Chrome / MacOS.', time: '1d ago' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080a0f]/90 backdrop-blur-xl border-b border-white/10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 xl:gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('overview')}
            >
              <div className="w-10 h-10 rounded-xl trust-gradient flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-all duration-200">
                <Shield className="w-5 h-5 text-white fill-white/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    Wallet & Card
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              {[
                { id: 'overview', label: 'Overview', icon: CreditCard },
                { id: 'support', label: 'Support', icon: Headphones },
                { id: 'transactions', label: 'Activity', icon: ArrowUpRight },
                { id: 'security', label: 'Security', icon: ShieldCheck },
                { id: 'profile', label: 'Profile', icon: User },
                ...(authUser?.role === 'admin'
                  ? [{ id: 'admin', label: 'Admin Vault', icon: ShieldAlert, badge: 'PRO' }]
                  : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? tab.id === 'admin'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'trust-gradient text-white shadow-md shadow-blue-600/20'
                        : tab.id === 'admin'
                        ? 'text-rose-400 hover:bg-rose-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.id === 'admin' ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded uppercase">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenSendReceive('send')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Send / Receive</span>
            </button>

            <button
              onClick={onOpenTopup}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold trust-gradient hover:trust-gradient-hover text-white shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Top Up</span>
            </button>

            <button
              onClick={onOpenTiers}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Tiers</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 transition-all relative hover:border-blue-500/30"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                    <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">
                      Live Card Activity
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold cursor-pointer hover:underline">
                      Mark all read
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs hover:border-blue-500/20 transition-all">
                        <div className="flex justify-between items-center text-slate-200 font-bold mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {authUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="hidden sm:flex flex-col text-right group/prof hover:opacity-80 transition-opacity"
                  title="Open User Profile"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover/prof:text-blue-400 transition-colors">
                    {authUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 font-extrabold uppercase flex items-center gap-1 justify-end">
                    <User className="w-3 h-3" />
                    <span>{authUser.role === 'admin' ? 'Super Admin' : 'Profile'}</span>
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Log out or switch session"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Exit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-[#080a0f] px-2 py-2">
        {[
          { id: 'overview', label: 'Card', icon: CreditCard },
          { id: 'support', label: 'Support', icon: Headphones },
          { id: 'transactions', label: 'History', icon: ArrowUpRight },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'profile', label: 'Profile', icon: User },
          ...(authUser?.role === 'admin'
            ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
                isActive ? 'text-white trust-gradient' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
