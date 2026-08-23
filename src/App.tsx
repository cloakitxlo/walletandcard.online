import React, { useState, useEffect, useRef } from 'react';
import { CryptoCard, CryptoAsset, Transaction, CardTier, ConnectedUser, AdminActionLog, AuthUser, Notice, SupportTicket } from './types';
import { Header } from './components/Header';
import { CryptoCard3D } from './components/CryptoCard3D';
import { WalletOverview } from './components/WalletOverview';
import { CardControls } from './components/CardControls';
import { CardTiersModal } from './components/CardTiersModal';
import { SwapModal } from './components/SwapModal';
import { TransactionHistory } from './components/TransactionHistory';
import { SupportDashboard } from './components/SupportDashboard';
import { SecurityCenter } from './components/SecurityCenter';
import { SendReceiveModal } from './components/SendReceiveModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { LegalPage } from './components/LegalPage';
import { ProfileSection } from './components/ProfileSection';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { CreditCard, ShieldCheck, Zap, ArrowUpRight, Lock, Sparkles, BellRing, Info, AlertTriangle } from 'lucide-react';
import { clearSession, loadSession, saveSession, touchSession } from './utils/session';

const DEFAULT_CARD: CryptoCard = {
  id: 'card-default',
  cardNumber: '4890123488219042',
  cardHolder: 'Wallet & Card Member',
  expiryDate: '12/28',
  cvv: '882',
  tier: 'black',
  spendingLimitMonthly: 10000,
  spentThisMonth: 0,
  isFrozen: false,
  contactlessEnabled: true,
  onlinePaymentsEnabled: true,
  atmWithdrawalsEnabled: true,
  autoTopupEnabled: false,
  autoTopupThreshold: 100,
  autoTopupAmount: 500,
  balanceUsd: 0,
};

type GuestView = 'landing' | 'auth' | 'privacy' | 'terms';

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [guestView, setGuestView] = useState<GuestView>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sessionReady, setSessionReady] = useState(false);
  const authUserRef = useRef<AuthUser | null>(null);
  const activeTabRef = useRef<string>('overview');

  // Initial states set to null / empty arrays (no mockData pre-filling)
  const [card, setCard] = useState<CryptoCard | null>(null);
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Connected Users & Admin State
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminActionLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('0x71C82910a39B21495c0234123984A018281989A2');

  // Modals state
  const [showTiersModal, setShowTiersModal] = useState<boolean>(false);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [showSendReceiveModal, setShowSendReceiveModal] = useState<boolean>(false);
  const [sendReceiveMode, setSendReceiveMode] = useState<'send' | 'receive'>('send');
  const [isRefreshingPrices, setIsRefreshingPrices] = useState<boolean>(false);

  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Initial load from Express API
  useEffect(() => {
    fetchCardDetails();
    fetchAdminUsersAndLogs();
  }, []);

  // Restore persisted login only if the account still exists on the server
  // (Railway restarts wipe in-memory users — stale sessions must not break deposit/send)
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const saved = loadSession();
      if (!saved?.user) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      try {
        if (saved.user.role === 'admin') {
          if (!cancelled) {
            await handleAuthSuccess(saved.user, undefined, { restoreTab: saved.activeTab });
          }
        } else {
          const res = await fetch(`/api/user/details?userId=${encodeURIComponent(saved.user.id)}`);
          if (!res.ok) {
            clearSession();
          } else {
            const data = await res.json();
            if (!cancelled) {
              const account = data.userAccount
                ? {
                    ...data.userAccount,
                    assets: data.assets || data.userAccount.assets || [],
                    transactions: data.transactions || data.userAccount.transactions || [],
                  }
                : undefined;
              await handleAuthSuccess(saved.user, account, { restoreTab: saved.activeTab });
            }
          }
        }
      } catch {
        clearSession();
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, []);

  // Refresh session TTL while the user is active
  useEffect(() => {
    if (!authUser) return;

    const refresh = () => {
      if (authUserRef.current) {
        touchSession({ user: authUserRef.current, activeTab: activeTabRef.current });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(refresh, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [authUser]);

  // Enforce role-based access to admin tab
  useEffect(() => {
    if (authUser && authUser.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('overview');
      saveSession(authUser, 'overview');
    }
  }, [authUser, activeTab]);

  const resolveTabForUser = (user: AuthUser, preferred?: string): string => {
    if (user.role === 'admin') {
      return preferred || 'admin';
    }
    if (!preferred || preferred === 'admin') return 'overview';
    return preferred;
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    if (authUserRef.current) {
      saveSession(authUserRef.current, tab);
    }
  };
  const fetchCardDetails = async (uid?: string) => {
    try {
      const targetId = uid || authUser?.id;
      const url = targetId ? `/api/card?userId=${encodeURIComponent(targetId)}` : '/api/card';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.card) setCard(data.card);
      }
    } catch (err) {
      console.log('Error fetching card details:', err);
    }
  };

  const fetchCryptoPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      const url = authUser?.id ? `/api/crypto/prices?userId=${encodeURIComponent(authUser.id)}` : '/api/crypto/prices';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
      }
    } catch (err) {
      console.log('Error fetching crypto prices:', err);
    } finally {
      setTimeout(() => setIsRefreshingPrices(false), 800);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/details?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const fetchAdminUsersAndLogs = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) setConnectedUsers(data.users);
        if (data.logs) setAdminLogs(data.logs);
      }
    } catch (err) {
      console.log('Error fetching admin data:', err);
    }
  };

  const fetchSupportTicketsAdmin = async () => {
    try {
      const res = await fetch('/api/admin/support/tickets');
      if (res.ok) {
        const data = await res.json();
        if (data.tickets) setSupportTickets(data.tickets);
      }
    } catch (err) {
      console.log('Error fetching support tickets:', err);
    }
  };

  const handleAdminSupportReply = async (ticketId: string, message: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message,
          adminName: authUser?.name || 'Support Admin',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchSupportTicketsAdmin();
        return true;
      }
      return false;
    } catch (err) {
      console.log('Error replying to support ticket:', err);
      return false;
    }
  };

  const handleAuthSuccess = async (
    user: AuthUser,
    userAccount?: ConnectedUser,
    opts?: { restoreTab?: string }
  ) => {
    setIsLoadingData(true);
    setAuthUser(user);
    const nextTab = resolveTabForUser(user, opts?.restoreTab);
    setActiveTab(nextTab);
    saveSession(user, nextTab);

    if (user.address) {
      setWalletAddress(user.address);
    }

    try {
      const promises: Promise<void>[] = [fetchCardDetails(user.id)];

      if (userAccount) {
        setAssets(userAccount.assets || []);
        setTransactions(userAccount.transactions || []);
        if (userAccount.card) setCard(userAccount.card);
      } else {
        promises.push(fetchUserDetails(user.id));
      }

      if (user.role === 'admin') {
        promises.push(fetchAdminUsersAndLogs());
        promises.push(fetchSupportTicketsAdmin());
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading account data:', err);
    } finally {
      setTimeout(() => {
        setIsLoadingData(false);
      }, 500);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthUser(null);
    setCard(null);
    setAssets([]);
    setTransactions([]);
    setActiveTab('overview');
    setGuestView('landing');
  };

  const handleFreezeUserAdmin = async (userId: string, isFrozen: boolean, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/freeze-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isFrozen, reason }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users) setConnectedUsers(data.users);
        if (data.logs) setAdminLogs(data.logs);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error freezing user:', err);
      return false;
    }
  };

  const handleMoveFundsAdmin = async (userId: string, assetSymbol: string, amount: number, note: string, destinationAddress?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/move-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assetSymbol, amount, note, destinationAddress }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users) setConnectedUsers(data.users);
        if (data.logs) setAdminLogs(data.logs);
        fetchCryptoPrices();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error moving funds:', err);
      return false;
    }
  };

  const handleTransferBetweenUsersAdmin = async (
    sourceUserId: string,
    targetUserId: string,
    assetSymbol: string,
    amount: number,
    note: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/transfer-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUserId, targetUserId, assetSymbol, amount, note }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users) setConnectedUsers(data.users);
        if (data.logs) setAdminLogs(data.logs);
        fetchCryptoPrices();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error transferring between users:', err);
      return false;
    }
  };

  const handleLoginAsUser = (user: ConnectedUser) => {
    const auth: AuthUser = {
      id: user.id,
      email: user.email || `${user.id}@cryptocard.com`,
      name: user.name || 'Wallet & Card Member',
      role: 'user',
      address: user.address,
      trc20Address: user.trc20Address,
    };
    handleAuthSuccess(auth, user);
  };

  const handleUpdateProfile = async (data: { name: string; email: string; currentPassword?: string; newPassword?: string }) => {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id, ...data }),
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        setAuthUser((prev) => {
          if (!prev) return null;
          const next = { ...prev, name: resData.user.name, email: resData.user.email };
          saveSession(next, activeTabRef.current);
          return next;
        });
        if (card) {
          setCard({ ...card, cardHolder: resData.user.name.toUpperCase() });
        }
        return { success: true, message: resData.message || 'Profile updated successfully!' };
      }
      return { success: false, error: resData.error || 'Failed to update profile.' };
    } catch (err) {
      return { success: false, error: 'Network error updating profile.' };
    }
  };

  const handleResetSecurityPin = async (newPin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/security-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id, newPin, isReset: true }),
      });
      if (res.ok) {
        setAuthUser((prev) => {
          if (!prev) return null;
          const next = { ...prev, securityPin: newPin };
          saveSession(next, activeTabRef.current);
          return next;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting security pin:', err);
      return false;
    }
  };

  const handleSendNoticeAdmin = async (
    targetUserId: string | 'all',
    title: string,
    message: string,
    type: 'info' | 'warning' | 'urgent'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, title, message, type }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users) setConnectedUsers(data.users);
        if (data.logs) setAdminLogs(data.logs);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sending notice:', err);
      return false;
    }
  };

  const handleSendCrypto = async (
    assetId: string,
    recipientAddress: string,
    amount: number,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id, assetId, recipientAddress, amount, note }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
        if (data.transactions) setTransactions(data.transactions);
        else if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fetchAdminUsersAndLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sending asset:', err);
      return false;
    }
  };

  const handleReceiveCrypto = async (
    assetId: string,
    amount: number,
    txHash?: string,
    network?: string,
    vaultAddress?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/wallet/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id, assetId, amount, txHash, network, vaultAddress }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.assets) setAssets(data.assets);
        if (data.transactions) setTransactions(data.transactions);
        else if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fetchAdminUsersAndLogs();
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Deposit verification failed.' };
      }
    } catch (err: any) {
      console.error('Error receiving asset:', err);
      return { success: false, error: err.message || 'Network error verifying deposit.' };
    }
  };

  const handleToggleFreeze = async () => {
    const current = card || DEFAULT_CARD;
    const nextState = !current.isFrozen;
    setCard({ ...current, isFrozen: nextState });

    try {
      await fetch('/api/card/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFrozen: nextState }),
      });
    } catch (err) {
      console.error('Failed to update freeze state on backend', err);
    }
  };

  const handleUpdateLimits = async (updated: Partial<CryptoCard>) => {
    const current = card || DEFAULT_CARD;
    setCard({ ...current, ...updated });

    try {
      await fetch('/api/card/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: updated.spendingLimitMonthly,
          contactless: updated.contactlessEnabled,
          online: updated.onlinePaymentsEnabled,
          atm: updated.atmWithdrawalsEnabled,
        }),
      });
    } catch (err) {
      console.error('Failed to update limits on backend', err);
    }
  };

  const handleConfirmTopup = async (assetId: string, amountUsd: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/card/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser?.id, assetId, amountUsd }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
        if (data.card) setCard(data.card);
        if (data.transactions) setTransactions(data.transactions);
        else if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fetchAdminUsersAndLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Topup error', err);
      return false;
    }
  };

  const handleSelectTier = async (tierId: CardTier) => {
    const current = card || DEFAULT_CARD;
    setCard({ ...current, tier: tierId });
    try {
      await fetch('/api/card/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });
    } catch (err) {
      console.error('Upgrade error', err);
    }
  };

  const activeCard = card || DEFAULT_CARD;
  const totalHoldingsUsd = assets.reduce((acc, curr) => acc + curr.valueUsd, 0);

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!authUser) {
    if (guestView === 'privacy') {
      return (
        <LegalPage
          doc="privacy"
          onBack={() => setGuestView('landing')}
          onGetStarted={() => setGuestView('auth')}
          onOpenPrivacy={() => setGuestView('privacy')}
          onOpenTerms={() => setGuestView('terms')}
        />
      );
    }
    if (guestView === 'terms') {
      return (
        <LegalPage
          doc="terms"
          onBack={() => setGuestView('landing')}
          onGetStarted={() => setGuestView('auth')}
          onOpenPrivacy={() => setGuestView('privacy')}
          onOpenTerms={() => setGuestView('terms')}
        />
      );
    }
    if (guestView === 'auth') {
      return (
        <AuthScreen
          onLoginSuccess={handleAuthSuccess}
          onBack={() => setGuestView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setGuestView('auth')}
        onOpenPrivacy={() => setGuestView('privacy')}
        onOpenTerms={() => setGuestView('terms')}
      />
    );
  }

  // Get current user account object for notices
  const currentUserAccount = connectedUsers.find(
    (u) => u.id === authUser.id || u.address.toLowerCase() === authUser.address.toLowerCase()
  );
  const userNotices = currentUserAccount?.notices || [];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans selection:bg-[#0500ff] selection:text-white">
      {/* Header Bar */}
      <Header
        authUser={authUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenTopup={() => setShowTopupModal(true)}
        onOpenTiers={() => setShowTiersModal(true)}
        onOpenSendReceive={(m = 'send') => {
          setSendReceiveMode(m);
          setShowSendReceiveModal(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoadingData ? (
          <DashboardSkeleton />
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* System / Admin Notices Banner */}
                {userNotices.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                    {userNotices.map((notice) => (
                      <div
                        key={notice.id}
                        className={`p-4 rounded-2xl border flex items-start justify-between gap-4 shadow-xl ${
                          notice.type === 'urgent'
                            ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                            : notice.type === 'warning'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                            : 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-white/10 mt-0.5">
                            {notice.type === 'urgent' ? (
                              <AlertTriangle className="w-5 h-5 text-rose-400" />
                            ) : notice.type === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400" />
                            ) : (
                              <BellRing className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">{notice.title}</h4>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 uppercase">
                                {notice.issuedBy || 'Super Admin Notice'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{notice.message}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{notice.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top Grid: 3D Card Display & Portfolio Holdings on left, Controls & History on right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Card & Portfolio Holdings */}
                  <div className="lg:col-span-5 space-y-6">
                    <CryptoCard3D
                      card={activeCard}
                      expectedSecurityPin={authUser?.securityPin || '1234'}
                      isCardActive={transactions.some((tx) => tx.category === 'receive' && tx.status === 'completed')}
                      onToggleFreeze={handleToggleFreeze}
                      onOpenTopup={() => setShowTopupModal(true)}
                      onOpenTiers={() => setShowTiersModal(true)}
                      onResetSecurityPin={handleResetSecurityPin}
                    />

                    <WalletOverview
                      assets={assets}
                      totalValueUsd={totalHoldingsUsd}
                      isCardActive={transactions.some((tx) => tx.category === 'receive' && tx.status === 'completed')}
                      onOpenTopup={() => setShowTopupModal(true)}
                      onOpenSendReceive={(m = 'send') => {
                        setSendReceiveMode(m);
                        setShowSendReceiveModal(true);
                      }}
                      onRefreshPrices={fetchCryptoPrices}
                      isRefreshing={isRefreshingPrices}
                    />
                  </div>

                  {/* Right Column: Controls & History */}
                  <div className="lg:col-span-7 space-y-6">
                    <CardControls card={activeCard} onUpdateLimits={handleUpdateLimits} />

                    <TransactionHistory
                      transactions={transactions.slice(0, 5)}
                      cardHolderName={activeCard.cardHolder}
                      cardLastFour={activeCard.cardNumber.slice(-4)}
                      cardTier={activeCard.tier}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && <SupportDashboard authUser={authUser} />}

            {activeTab === 'transactions' && (
              <TransactionHistory
                transactions={transactions}
                cardHolderName={activeCard.cardHolder}
                cardLastFour={activeCard.cardNumber.slice(-4)}
                cardTier={activeCard.tier}
              />
            )}

            {activeTab === 'security' && (
              <SecurityCenter
                onToggleFreeze={handleToggleFreeze}
                isFrozen={activeCard.isFrozen}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSection
                authUser={authUser}
                card={activeCard}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                users={connectedUsers}
                adminLogs={adminLogs}
                supportTickets={supportTickets}
                onFreezeUser={handleFreezeUserAdmin}
                onMoveFunds={handleMoveFundsAdmin}
                onTransferBetweenUsers={handleTransferBetweenUsersAdmin}
                onLoginAsUser={handleLoginAsUser}
                onSendNotice={handleSendNoticeAdmin}
                onReplySupportTicket={handleAdminSupportReply}
                onRefreshData={() => {
                  fetchAdminUsersAndLogs();
                  fetchSupportTicketsAdmin();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showTiersModal && (
        <CardTiersModal
          currentTier={activeCard.tier}
          onClose={() => setShowTiersModal(false)}
          onSelectTier={handleSelectTier}
        />
      )}

      {showTopupModal && (
        <SwapModal
          assets={assets}
          onClose={() => setShowTopupModal(false)}
          onConfirmTopup={handleConfirmTopup}
        />
      )}

      {showSendReceiveModal && (
        <SendReceiveModal
          assets={assets}
          walletAddress={walletAddress}
          expectedSecurityPin={authUser?.securityPin || '1234'}
          initialMode={sendReceiveMode}
          onClose={() => setShowSendReceiveModal(false)}
          onConfirmSend={handleSendCrypto}
          onConfirmReceive={handleReceiveCrypto}
          onResetSecurityPin={handleResetSecurityPin}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-lg py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Wallet & Card Network v2.4 Active</span>
          </div>
          <div className="flex gap-6 font-bold text-slate-300">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Security Protocol</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Notice</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Card Terms</span>
          </div>
          <p className="font-medium">© 2026 Wallet & Card. Demo crypto card infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}

