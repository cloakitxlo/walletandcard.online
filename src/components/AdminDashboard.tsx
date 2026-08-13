import React, { useState } from 'react';
import { ConnectedUser, AdminActionLog, CryptoAsset, SupportTicket } from '../types';
import {
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  ArrowRightLeft,
  DollarSign,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Building2,
  Sliders,
  History,
  Shield,
  Zap,
  LogIn,
  SendHorizontal,
  Headphones,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  users: ConnectedUser[];
  adminLogs: AdminActionLog[];
  supportTickets?: SupportTicket[];
  onFreezeUser: (userId: string, isFrozen: boolean, reason?: string) => Promise<boolean>;
  onMoveFunds: (userId: string, assetSymbol: string, amount: number, note: string, destinationAddress?: string) => Promise<boolean>;
  onTransferBetweenUsers?: (sourceUserId: string, targetUserId: string, assetSymbol: string, amount: number, note: string) => Promise<boolean>;
  onLoginAsUser?: (user: ConnectedUser) => void;
  onSendNotice?: (targetUserId: string | 'all', title: string, message: string, type: 'info' | 'warning' | 'urgent') => Promise<boolean>;
  onReplySupportTicket?: (ticketId: string, message: string) => Promise<boolean>;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  adminLogs,
  supportTickets = [],
  onFreezeUser,
  onMoveFunds,
  onTransferBetweenUsers,
  onLoginAsUser,
  onSendNotice,
  onReplySupportTicket,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [selectedUserForMove, setSelectedUserForMove] = useState<ConnectedUser | null>(null);
  const [selectedUserForFreeze, setSelectedUserForFreeze] = useState<ConnectedUser | null>(null);
  const [selectedUserForNotice, setSelectedUserForNotice] = useState<ConnectedUser | null | 'all'>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);

  // Transfer Between Users State
  const [transferSourceUser, setTransferSourceUser] = useState<ConnectedUser | null>(null);
  const [transferTargetUserId, setTransferTargetUserId] = useState<string>('');
  const [transferAssetSymbol, setTransferAssetSymbol] = useState<string>('USDT');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('Admin Direct Inter-Account Transfer');
  const [isProcessingTransfer, setIsProcessingTransfer] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);

  // Freeze Modal State
  const [freezeReason, setFreezeReason] = useState<string>('Risk Assessment / Compliance Hold');
  const [isProcessingFreeze, setIsProcessingFreeze] = useState<boolean>(false);

  // Notice Dispatch State
  const [noticeTitle, setNoticeTitle] = useState<string>('Important Security Notice');
  const [noticeMessage, setNoticeMessage] = useState<string>('Your account has been audited by Super Admin. All features are operating normally.');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isSendingNotice, setIsSendingNotice] = useState<boolean>(false);
  const [noticeSuccess, setNoticeSuccess] = useState<boolean>(false);

  // Move Funds Modal State
  const [moveAssetSymbol, setMoveAssetSymbol] = useState<string>('USDT');
  const [moveAmount, setMoveAmount] = useState<string>('');
  const [moveDestinationAddress, setMoveDestinationAddress] = useState<string>('TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC');
  const [moveNote, setMoveNote] = useState<string>('Administrative sweep to TRC20 Vault');
  const [isProcessingMove, setIsProcessingMove] = useState<boolean>(false);
  const [moveSuccess, setMoveSuccess] = useState<boolean>(false);

  // Dispatch Liquidity State
  const [dispatchTarget, setDispatchTarget] = useState<string>('');
  const [dispatchAmount, setDispatchAmount] = useState<string>('');
  const [dispatchNote, setDispatchNote] = useState<string>('Liquidity Grant / Market Making Support');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Calculations
  const totalTvlUsd = users.reduce((acc, u) => acc + u.totalBalanceUsd, 0);
  const frozenCount = users.filter((u) => u.isFrozen).length;
  const activeCount = users.filter((u) => !u.isFrozen).length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.network.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'frozen'
        ? u.isFrozen
        : !u.isFrozen;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmFreezeToggle = async () => {
    if (!selectedUserForFreeze) return;
    setIsProcessingFreeze(true);
    const nextState = !selectedUserForFreeze.isFrozen;
    await onFreezeUser(selectedUserForFreeze.id, nextState, freezeReason);
    setIsProcessingFreeze(false);
    setSelectedUserForFreeze(null);
  };

  const handleConfirmMoveFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForMove) return;
    const numAmt = parseFloat(moveAmount);
    if (!numAmt || numAmt <= 0) return;

    setIsProcessingMove(true);
    const success = await onMoveFunds(
      selectedUserForMove.id,
      moveAssetSymbol,
      numAmt,
      moveNote,
      moveDestinationAddress.trim() || 'TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC'
    );
    setIsProcessingMove(false);

    if (success) {
      setMoveSuccess(true);
      setTimeout(() => {
        setMoveSuccess(false);
        setSelectedUserForMove(null);
        setMoveAmount('');
      }, 1500);
    }
  };

  const handleConfirmInterUserTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceUser || !transferTargetUserId) return;
    const numAmt = parseFloat(transferAmount);
    if (!numAmt || numAmt <= 0) return;

    setIsProcessingTransfer(true);
    let success = false;
    if (onTransferBetweenUsers) {
      success = await onTransferBetweenUsers(
        transferSourceUser.id,
        transferTargetUserId,
        transferAssetSymbol,
        numAmt,
        transferNote
      );
    } else {
      success = await onMoveFunds(
        transferSourceUser.id,
        transferAssetSymbol,
        numAmt,
        `Admin Inter-User Transfer to ${transferTargetUserId}`
      );
    }
    setIsProcessingTransfer(false);

    if (success) {
      setTransferSuccess(true);
      setTimeout(() => {
        setTransferSuccess(false);
        setTransferSourceUser(null);
        setTransferAmount('');
      }, 1500);
    }
  };

  const handleDispatchLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(dispatchAmount);
    if (!numAmt || numAmt <= 0 || !dispatchTarget) return;

    setIsDispatching(true);
    // Find or target user
    const target = users.find((u) => u.address.toLowerCase() === dispatchTarget.toLowerCase()) || users[0];
    await onMoveFunds(target.id, 'USDT', numAmt, dispatchNote);
    setIsDispatching(false);
    setDispatchAmount('');
  };

  const handleSendNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMessage) return;

    setIsSendingNotice(true);
    const targetId = selectedUserForNotice === 'all' ? 'all' : selectedUserForNotice?.id || 'all';

    if (onSendNotice) {
      await onSendNotice(targetId, noticeTitle, noticeMessage, noticeType);
    }

    setIsSendingNotice(false);
    setNoticeSuccess(true);
    setTimeout(() => {
      setNoticeSuccess(false);
      setSelectedUserForNotice(null);
    }, 1500);
  };

  const handleReplyTicket = async (ticketId: string) => {
    const message = (replyDrafts[ticketId] || '').trim();
    if (!message || !onReplySupportTicket) return;
    setReplyingTicketId(ticketId);
    const ok = await onReplySupportTicket(ticketId, message);
    setReplyingTicketId(null);
    if (ok) {
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
    }
  };

  const openTicketsCount = supportTickets.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Admin Master Controls */}
      <div className="glass-card border border-rose-500/30 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                    Master Admin Control Vault
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-widest">
                    SUPERADMIN ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Manage connected Web3 wallets, freeze/unfreeze user funds, and sweep liquidity reserves
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedUserForNotice('all')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Issue Notice / Broadcast</span>
            </button>
            <button
              onClick={onRefreshData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-white/10 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Refresh Vault State</span>
            </button>
          </div>
        </div>

        {/* Master Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Vault TVL</p>
            <p className="text-2xl font-extrabold text-blue-400 font-mono">
              ${totalTvlUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Across all connected Web3 accounts</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Connected Accounts</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-100 font-mono">{users.length}</span>
              <span className="text-xs text-emerald-400 font-bold">({activeCount} Active)</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Ethereum, BNB, Polygon, Arbitrum</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Frozen Accounts</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-400 font-mono">{frozenCount}</span>
              <span className="text-xs text-rose-400 font-bold">Locked Funds</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Compliance & Risk Suspensions</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Master Treasury Reserve</p>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">$1,250,000.00</p>
            <p className="text-[11px] text-slate-500 font-medium">Liquidity reserve coverage</p>
          </div>
        </div>
      </div>

      {/* Support Tickets raised by users */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-100">User Support Tickets</h2>
              <p className="text-xs text-slate-400 font-medium">
                See which user raised what issue and reply on the same ticket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {openTicketsCount} open
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/15 text-slate-300 border border-white/10">
              {supportTickets.length} total
            </span>
          </div>
        </div>

        {supportTickets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No support tickets yet.</p>
        ) : (
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {supportTickets.map((ticket) => {
              const open = expandedTicketId === ticket.id;
              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTicketId(open ? null : ticket.id)}
                    className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              ticket.status === 'answered'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : ticket.status === 'closed'
                                ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-100">
                          {ticket.fullName}{' '}
                          <span className="font-medium text-slate-400">· {ticket.email}</span>
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-2">{ticket.description}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-bold shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket.messages.length} msgs
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-white/10 p-4 space-y-4 bg-slate-950/40">
                      {ticket.screenshotDataUrl && (
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Screenshot
                          </p>
                          <img
                            src={ticket.screenshotDataUrl}
                            alt="User screenshot"
                            className="max-h-52 rounded-lg border border-white/10 object-contain bg-black/40 w-full"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Conversation
                        </p>
                        {ticket.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-xl p-3 border text-xs ${
                              msg.authorRole === 'admin'
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100'
                                : 'bg-slate-900/80 border-white/10 text-slate-300'
                            }`}
                          >
                            <div className="flex justify-between gap-2 mb-1">
                              <span className="font-extrabold">
                                {msg.authorRole === 'admin' ? 'Admin Reply' : msg.authorName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Reply to this user
                        </label>
                        <textarea
                          value={replyDrafts[ticket.id] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                          }
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-rose-500/40 resize-y"
                          placeholder="Type your reply for this ticket..."
                        />
                        <button
                          type="button"
                          disabled={replyingTicketId === ticket.id || !(replyDrafts[ticket.id] || '').trim()}
                          onClick={() => handleReplyTicket(ticket.id)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold disabled:opacity-50 transition-all"
                        >
                          <SendHorizontal className="w-3.5 h-3.5" />
                          {replyingTicketId === ticket.id ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Section: Connected User Accounts & Funds Table */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-100">Connected User Accounts & Fund Controls</h2>
              <p className="text-xs text-slate-400 font-medium">
                View balances, execute administrative fund sweeps, and freeze/unfreeze account access
              </p>
            </div>
          </div>

          {/* Search & Filter controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wallet address..."
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
              {(['all', 'active', 'frozen'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'trust-gradient text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-2">Connected Address</th>
                <th className="px-4 py-2">Network</th>
                <th className="px-4 py-2">Total Funds (USD)</th>
                <th className="px-4 py-2">Asset Holdings</th>
                <th className="px-4 py-2">Card Tier</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="bg-slate-950/60 hover:bg-slate-900/80 border border-white/5 rounded-2xl transition-all"
                >
                  <td className="px-4 py-3.5 rounded-l-2xl font-mono text-slate-200">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>{u.address.slice(0, 10)}...{u.address.slice(-6)}</span>
                      </div>
                      <div className="text-[10px] text-rose-400 font-mono font-extrabold flex items-center gap-1">
                        <span>TRC20:</span>
                        <span>{u.trc20Address || u.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-300">{u.network}</td>
                  <td className="px-4 py-3.5 font-mono font-extrabold text-blue-400 text-sm">
                    ${u.totalBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.assets.map((a) => (
                        <span
                          key={a.id}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-300"
                        >
                          {a.balance.toFixed(2)} {a.symbol}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize font-extrabold text-slate-200 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10">
                      {u.cardTier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.isFrozen ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-extrabold w-fit">
                        <Lock className="w-3 h-3" />
                        <span>FROZEN</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Login As User Button */}
                      {onLoginAsUser && (
                        <button
                          onClick={() => onLoginAsUser(u)}
                          title="Login to this user account"
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold transition-all flex items-center gap-1 text-[11px]"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Login As</span>
                        </button>
                      )}

                      {/* Issue Notice Button */}
                      <button
                        onClick={() => setSelectedUserForNotice(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 font-extrabold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <Send className="w-3 h-3" />
                        <span>Notice</span>
                      </button>

                      {/* Direct Inter-User Transfer */}
                      <button
                        onClick={() => {
                          setTransferSourceUser(u);
                          const target = users.find((usr) => usr.id !== u.id);
                          if (target) setTransferTargetUserId(target.id);
                        }}
                        title="Transfer funds directly to another user account"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <SendHorizontal className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>

                      {/* Move Funds Button */}
                      <button
                        onClick={() => setSelectedUserForMove(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 font-extrabold transition-all flex items-center gap-1 text-[11px]"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Sweep</span>
                      </button>

                      {/* Freeze / Unfreeze Toggle */}
                      <button
                        onClick={() => setSelectedUserForFreeze(u)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold transition-all flex items-center gap-1 ${
                          u.isFrozen
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.isFrozen ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Unfreeze</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Freeze</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Admin Treasury Dispatch & Admin Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Treasury Grant Dispatch */}
        <div className="lg:col-span-5 glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Dispatch Treasury Reserve</h3>
              <p className="text-xs text-slate-400 font-medium">Credit user accounts directly from Admin Treasury</p>
            </div>
          </div>

          <form onSubmit={handleDispatchLiquidity} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                Target User Wallet Address
              </label>
              <input
                type="text"
                value={dispatchTarget}
                onChange={(e) => setDispatchTarget(e.target.value)}
                placeholder="0x71C82910a39B21495c0234123984A018281989A2"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                Grant / Liquidity Amount (USDT)
              </label>
              <input
                type="number"
                value={dispatchAmount}
                onChange={(e) => setDispatchAmount(e.target.value)}
                placeholder="1000"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                Allocation Note / Justification
              </label>
              <input
                type="text"
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isDispatching || !dispatchTarget || !dispatchAmount}
              className="w-full py-3 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isDispatching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Liquidity Grant</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Real-time Admin Audit Trail */}
        <div className="lg:col-span-7 glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-100">Admin Audit & Move Logs</h3>
                <p className="text-xs text-slate-400 font-medium">Real-time record of all freeze & sweep events</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {adminLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`font-extrabold px-2 py-0.5 rounded-md uppercase text-[10px] ${
                      log.actionType === 'freeze'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : log.actionType === 'unfreeze'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {log.actionType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                </div>

                <p className="text-slate-300 font-medium">{log.note}</p>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>Target: {log.targetUserAddress.slice(0, 12)}...</span>
                  <span className="text-blue-400">Tx: {log.txHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Freeze Confirmation Modal */}
      {selectedUserForFreeze && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 text-rose-400 border-b border-white/10 pb-4">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-slate-100">
                {selectedUserForFreeze.isFrozen ? 'Unfreeze Account Funds' : 'Freeze User Funds & Account'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Target Address:{' '}
              <span className="font-mono font-bold text-slate-100">{selectedUserForFreeze.address}</span>
            </p>

            {!selectedUserForFreeze.isFrozen && (
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                  Freeze Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setSelectedUserForFreeze(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFreezeToggle}
                disabled={isProcessingFreeze}
                className={`w-1/2 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-lg ${
                  selectedUserForFreeze.isFrozen
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {isProcessingFreeze ? 'Updating...' : selectedUserForFreeze.isFrozen ? 'Confirm Unfreeze' : 'Confirm Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Funds Modal */}
      {selectedUserForMove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-blue-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-slate-100">Move / Sweep User Funds</h3>
              </div>
              <button
                onClick={() => setSelectedUserForMove(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {moveSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-slate-100 text-sm">Funds Moved & Swept to Treasury!</h4>
              </div>
            ) : (
              <form onSubmit={handleConfirmMoveFunds} className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Target User Wallet:</p>
                  <p className="text-xs font-mono font-bold text-slate-200">{selectedUserForMove.address}</p>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Select Asset
                  </label>
                  <select
                    value={moveAssetSymbol}
                    onChange={(e) => setMoveAssetSymbol(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    {selectedUserForMove.assets.map((a) => (
                      <option key={a.id} value={a.symbol} className="bg-slate-900 text-slate-200">
                        {a.symbol} (Available: {a.balance} {a.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Amount to Move/Sweep
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={moveAmount}
                    onChange={(e) => setMoveAmount(e.target.value)}
                    placeholder="0.5"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Destination TRC20 Address
                  </label>
                  <input
                    type="text"
                    value={moveDestinationAddress}
                    onChange={(e) => setMoveDestinationAddress(e.target.value)}
                    placeholder="TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-400 font-bold focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Admin can specify any valid TRC20 destination address for sweep/transfer.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Destination Note / Sweep Reason
                  </label>
                  <input
                    type="text"
                    value={moveNote}
                    onChange={(e) => setMoveNote(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForMove(null)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingMove || !moveAmount}
                    className="w-1/2 py-2.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isProcessingMove ? 'Executing Sweep...' : 'Confirm Fund Sweep'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Issue / Broadcast Notice Modal */}
      {selectedUserForNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full bg-slate-950 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base">
                  {selectedUserForNotice === 'all' ? 'Broadcast Notice to All Users' : 'Dispatch User Notice'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedUserForNotice === 'all'
                    ? 'Broadcast official notice to all registered account dashboards'
                    : `Target User: ${(selectedUserForNotice as ConnectedUser).address.slice(0, 10)}...`}
                </p>
              </div>
            </div>

            {noticeSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-slate-100 text-sm">Official Notice Dispatched & Logged!</h4>
              </div>
            ) : (
              <form onSubmit={handleSendNoticeSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Notice Type / Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'info', label: 'Info Alert' },
                      { id: 'warning', label: 'Warning' },
                      { id: 'urgent', label: 'Urgent Action' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNoticeType(t.id as any)}
                        className={`py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          noticeType === t.id
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-900 text-slate-400 border-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Notice Headline
                  </label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Security Compliance Update"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Detailed Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Enter official notice details to display on user dashboard..."
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForNotice(null)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingNotice || !noticeTitle || !noticeMessage}
                    className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                  >
                    {isSendingNotice ? 'Dispatching...' : 'Dispatch Notice'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Inter-User Transfer Modal */}
      {transferSourceUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full bg-slate-950 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <SendHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base">Direct Inter-User Transfer</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Source: <span className="text-emerald-400 font-bold">{transferSourceUser.name || transferSourceUser.address.slice(0, 10)}</span>
                </p>
              </div>
            </div>

            {transferSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-slate-100 text-sm">Inter-User Transfer Completed & Recorded!</h4>
              </div>
            ) : (
              <form onSubmit={handleConfirmInterUserTransfer} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Select Recipient Target User
                  </label>
                  <select
                    value={transferTargetUserId}
                    onChange={(e) => setTransferTargetUserId(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none bg-slate-900"
                  >
                    {users
                      .filter((u) => u.id !== transferSourceUser.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email || u.address} ({u.totalBalanceUsd ? `$${u.totalBalanceUsd.toFixed(2)}` : '$0.00'})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                      Asset Token
                    </label>
                    <select
                      value={transferAssetSymbol}
                      onChange={(e) => setTransferAssetSymbol(e.target.value)}
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none bg-slate-900"
                    >
                      {transferSourceUser.assets.map((a) => (
                        <option key={a.id} value={a.symbol}>
                          {a.symbol} ({a.balance.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase block mb-1">
                    Transfer Audit Note
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Admin Direct Transfer Note"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferSourceUser(null)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingTransfer || !transferAmount || !transferTargetUserId}
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                  >
                    {isProcessingTransfer ? 'Transferring...' : 'Execute Transfer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
