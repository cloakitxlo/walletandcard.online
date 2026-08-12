import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Transaction } from '../types';
import { FileText, Download, X, Calendar, CheckCircle2, ShieldCheck, Sparkles, Filter, FileSpreadsheet } from 'lucide-react';

interface ExportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  cardHolderName?: string;
  cardLastFour?: string;
  cardTier?: string;
}

export const ExportStatementModal: React.FC<ExportStatementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  cardHolderName = 'WALLET & CARD MEMBER',
  cardLastFour = '4532',
  cardTier = 'BLACK TIER',
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('august-2026');
  const [fileFormat, setFileFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeCashback, setIncludeCashback] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccessUrl, setDownloadSuccessUrl] = useState<string | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string>('');

  if (!isOpen) return null;

  // Filter transactions by selected period
  const getFilteredTransactions = () => {
    if (selectedMonth === 'all') return transactions;
    // For demo purposes, map mock month filters or filter by date substring
    if (selectedMonth === 'august-2026') {
      return transactions.filter(
        (tx) => tx.date.includes('2026-08') || tx.date.includes('Aug') || tx.date.includes('Today') || tx.date.includes('2026')
      );
    }
    if (selectedMonth === 'july-2026') {
      return transactions.filter((tx) => tx.date.includes('2026-07') || tx.date.includes('Jul'));
    }
    return transactions;
  };

  const filteredTxs = getFilteredTransactions();

  const totalSpent = filteredTxs
    .filter((t) => t.category === 'purchase' || t.category === 'swap')
    .reduce((sum, t) => sum + t.amountUsd, 0);

  const totalTopups = filteredTxs
    .filter((t) => t.category === 'topup')
    .reduce((sum, t) => sum + t.amountUsd, 0);

  const totalCashback = filteredTxs.reduce((sum, t) => sum + (t.cashbackEarnedUsd || 0), 0);

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    setDownloadSuccessUrl(null);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const primaryColor = [30, 58, 138]; // Dark Blue
        const darkTextColor = [30, 41, 59]; // Slate 800
        const lightGrayColor = [241, 245, 249]; // Slate 100

        // Header Banner
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 32, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('WALLET & CARD FINANCIAL STATEMENT', 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Monthly Account Summary', 14, 26);

        // Date generated on top right
        const formattedDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        doc.setFontSize(9);
        doc.text(`Generated: ${formattedDate}`, 150, 20);

        // Account / Card details box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 38, 182, 28, 3, 3, 'FD');

        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Cardholder Name: ${cardHolderName.toUpperCase()}`, 18, 46);
        doc.text(`Card Tier: ${cardTier.toUpperCase()}`, 18, 54);
        doc.text(`Card Number: •••• •••• •••• ${cardLastFour}`, 18, 62);

        const monthLabel =
          selectedMonth === 'august-2026'
            ? 'August 2026'
            : selectedMonth === 'july-2026'
            ? 'July 2026'
            : 'All Time';
        doc.text(`Statement Period: ${monthLabel}`, 120, 46);
        doc.text(`Account Status: VERIFIED & ACTIVE`, 120, 54);

        // Summary Statistics Box
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(14, 72, 182, 22, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(30, 58, 138);
        doc.text(`Total Purchases: $${totalSpent.toFixed(2)} USD`, 20, 85);
        doc.text(`Total Top-Ups: $${totalTopups.toFixed(2)} USD`, 80, 85);
        if (includeCashback) {
          doc.text(`Cashback Earned: $${totalCashback.toFixed(2)} USD`, 140, 85);
        }

        // Table Header
        let yPos = 104;
        doc.setFillColor(30, 58, 138);
        doc.rect(14, yPos - 6, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        doc.text('Date', 18, yPos);
        doc.text('Description', 45, yPos);
        doc.text('Category', 115, yPos);
        doc.text('Amount (USD)', 150, yPos);
        doc.text('Status', 180, yPos);

        yPos += 8;

        // Table Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);

        filteredTxs.forEach((tx, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, yPos - 5, 182, 7, 'F');
          }

          doc.setTextColor(51, 65, 85);
          doc.text(tx.date.substring(0, 10), 18, yPos);

          const truncatedTitle = tx.title.length > 32 ? tx.title.substring(0, 30) + '..' : tx.title;
          doc.text(truncatedTitle, 45, yPos);

          doc.text(tx.category.toUpperCase(), 115, yPos);

          const isCredit = tx.category === 'topup' || tx.category === 'reward';
          const amtStr = `${isCredit ? '+' : '-'}$${tx.amountUsd.toFixed(2)}`;
          doc.text(amtStr, 150, yPos);

          doc.setTextColor(16, 185, 129);
          doc.text('SETTLED', 180, yPos);

          yPos += 7;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Wallet & Card Financial Statement • End-to-End Encrypted • Official Record', 14, 285);

        const filename = `CryptoCard_Statement_${monthLabel.replace(/\s+/g, '_')}.pdf`;
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Auto download trigger
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        link.click();

        setDownloadSuccessUrl(pdfUrl);
        setGeneratedFilename(filename);
        setIsGenerating(false);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setIsGenerating(false);
      }
    }, 600);
  };

  const handleGenerateCSV = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const headers = 'ID,Date,Merchant/Title,Category,Amount USD,Cashback USD,Status\n';
      const rows = filteredTxs
        .map(
          (t) =>
            `"${t.id}","${t.date}","${t.title}","${t.category}",${t.amountUsd},${
              t.cashbackEarnedUsd || 0
            },"Completed"`
        )
        .join('\n');

      const monthLabel =
        selectedMonth === 'august-2026'
          ? 'August_2026'
          : selectedMonth === 'july-2026'
          ? 'July_2026'
          : 'All_Time';
      const filename = `CryptoCard_Statement_${monthLabel}.csv`;
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      setDownloadSuccessUrl(url);
      setGeneratedFilename(filename);
      setIsGenerating(false);
    }, 400);
  };

  const handleExport = () => {
    if (fileFormat === 'pdf') {
      handleGeneratePDF();
    } else {
      handleGenerateCSV();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card border border-white/10 rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl space-y-5 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl trust-gradient text-white shadow-lg shadow-blue-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">Export Account Statements</h3>
              <p className="text-xs text-slate-400 font-medium">Generate official PDF or CSV financial statements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Statement Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
            <span>Cardholder:</span>
            <span className="text-slate-100 font-bold">{cardHolderName.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-2">
            <span>Card Number:</span>
            <span className="text-slate-200">•••• •••• •••• {cardLastFour}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Purchases</span>
              <span className="text-slate-100 font-extrabold">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Top-ups</span>
              <span className="text-emerald-400 font-extrabold">${totalTopups.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Cashback</span>
              <span className="text-amber-400 font-extrabold">${totalCashback.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Export Form Options */}
        <div className="space-y-4">
          {/* Select Period */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
              Statement Period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'august-2026', label: 'August 2026' },
                { id: 'july-2026', label: 'July 2026' },
                { id: 'all', label: 'All History' },
              ].map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setSelectedMonth(period.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedMonth === period.id
                      ? 'trust-gradient text-white border-blue-500 shadow-md'
                      : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-slate-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select Format */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
              Document Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFileFormat('pdf')}
                className={`p-3 rounded-2xl flex items-center gap-3 border transition-all ${
                  fileFormat === 'pdf'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${fileFormat === 'pdf' ? 'trust-gradient text-white' : 'bg-slate-900'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs block">Official PDF Statement</span>
                  <span className="text-[10px] text-slate-400">Branded PDF document</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`p-3 rounded-2xl flex items-center gap-3 border transition-all ${
                  fileFormat === 'csv'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${fileFormat === 'csv' ? 'bg-emerald-600 text-white' : 'bg-slate-900'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-xs block">CSV Spreadsheet</span>
                  <span className="text-[10px] text-slate-400">Excel / Numbers raw data</span>
                </div>
              </button>
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">Include Cashback Breakdown</span>
            <input
              type="checkbox"
              checked={includeCashback}
              onChange={(e) => setIncludeCashback(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 cursor-pointer"
            />
          </div>
        </div>

        {/* Download Link Success Banner */}
        {downloadSuccessUrl && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[220px]">{generatedFilename} Ready!</span>
            </div>
            <a
              href={downloadSuccessUrl}
              download={generatedFilename}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-2xl glass-card text-slate-300 hover:text-white text-xs font-extrabold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating}
            className="w-2/3 py-3 rounded-2xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Generating {fileFormat.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate & Download Statement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
