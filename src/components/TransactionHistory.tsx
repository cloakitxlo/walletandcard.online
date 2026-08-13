import React, { useState } from 'react';
import { Transaction } from '../types';
import { ShoppingBag, RefreshCw, ArrowUpRight, Gift, Search, Download, CheckCircle2, Receipt, FileText } from 'lucide-react';
import { ExportStatementModal } from './ExportStatementModal';

interface TransactionHistoryProps {
  transactions: Transaction[];
  cardHolderName?: string;
  cardLastFour?: string;
  cardTier?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  cardHolderName,
  cardLastFour,
  cardTier,
}) => {
  const [filter, setFilter] = useState<'all' | 'purchase' | 'topup' | 'swap' | 'reward'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const filteredTxs = transactions.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.category === filter;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.merchantName && tx.merchantName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getCategoryBadge = (category: Transaction['category']) => {
    switch (category) {
      case 'purchase':
        return { icon: ShoppingBag, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'topup':
        return { icon: RefreshCw, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'swap':
        return { icon: ArrowUpRight, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'reward':
        return { icon: Gift, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      default:
        return { icon: ShoppingBag, color: 'text-slate-400 bg-slate-900' };
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Date,Title,Category,Amount USD,Cashback USD\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.title}","${t.category}",${t.amountUsd},${
            t.cashbackEarnedUsd || 0
          }`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CryptoCard_Statement_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <h3 className="font-extrabold text-base text-slate-100">Activity & Transaction History</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time feed of card purchases, top-ups, and instant cashback rewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Statements (PDF / CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs focus:outline-none font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'purchase', label: 'Purchases' },
            { id: 'topup', label: 'Top-ups' },
            { id: 'reward', label: 'Cashback' },
            { id: 'swap', label: 'Swaps' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat.id
                  ? 'trust-gradient text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filteredTxs.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-white/5 text-slate-400 text-xs font-medium">
            No transactions match your search filter.
          </div>
        ) : (
          filteredTxs.map((tx) => {
            const badge = getCategoryBadge(tx.category);
            const Icon = badge.icon;
            const isCredit = tx.category === 'topup' || tx.category === 'reward';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900/80 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${badge.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-100 group-hover:text-blue-400 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>{tx.date}</span>
                      {tx.cardLastFour && <span>• Card •••• {tx.cardLastFour}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-mono font-extrabold text-xs ${
                      isCredit ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isCredit ? '+' : '-'}${tx.amountUsd.toFixed(2)}
                  </p>
                  {tx.cashbackEarnedUsd && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-0.5 font-bold">
                      +${tx.cashbackEarnedUsd.toFixed(2)} Cashback
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-100">Transaction Details</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-4 bg-slate-950/80 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1 font-bold">
                Amount Settled
              </span>
              <span className="text-2xl font-extrabold text-slate-100 font-mono">
                ${selectedTx.amountUsd.toFixed(2)} USD
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                <span>Merchant/Title:</span>
                <span className="text-slate-100 font-bold">{selectedTx.title}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                <span>Transaction ID:</span>
                <span className="text-slate-200">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                <span>Timestamp:</span>
                <span className="text-slate-200">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                <span>Category:</span>
                <span className="text-blue-400 font-bold uppercase">{selectedTx.category}</span>
              </div>
              {selectedTx.cashbackEarnedUsd && (
                <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                  <span>Cashback Earned:</span>
                  <span className="text-amber-400 font-bold">
                    +${selectedTx.cashbackEarnedUsd.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Completed & Verified
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all border border-white/10"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Export Statement Modal */}
      {showExportModal && (
        <ExportStatementModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          transactions={transactions}
          cardHolderName={cardHolderName}
          cardLastFour={cardLastFour}
          cardTier={cardTier}
        />
      )}
    </div>
  );
};
