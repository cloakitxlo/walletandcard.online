import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CryptoAsset } from '../types';
import { Send, ArrowDownLeft, Copy, Check, AlertCircle, RefreshCw, ShieldCheck, Camera, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';
import { SecurityAuthModal } from './SecurityAuthModal';

interface SendReceiveModalProps {
  assets: CryptoAsset[];
  walletAddress: string;
  expectedSecurityPin?: string;
  initialMode?: 'send' | 'receive';
  onClose: () => void;
  onConfirmSend: (assetId: string, recipientAddress: string, amount: number, note?: string) => Promise<boolean>;
  onConfirmReceive?: (
    assetId: string,
    amount: number,
    txHash?: string,
    network?: string,
    vaultAddress?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  onResetSecurityPin?: (newPin: string) => Promise<boolean>;
}

export const SendReceiveModal: React.FC<SendReceiveModalProps> = ({
  assets,
  walletAddress,
  expectedSecurityPin = '1234',
  initialMode = 'send',
  onClose,
  onConfirmSend,
  onConfirmReceive,
  onResetSecurityPin,
}) => {
  const [mode, setMode] = useState<'send' | 'receive'>(initialMode);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(
    assets.find((a) => a.symbol === 'USDT') || assets[0]
  );

  // Send state
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [showSecurityAuth, setShowSecurityAuth] = useState<boolean>(false);

  // Receive state
  const [simAmount, setSimAmount] = useState<string>('50');
  const [customTxHash, setCustomTxHash] = useState<string>('');
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [receiveSuccess, setReceiveSuccess] = useState<boolean>(false);
  const [receiveErrorMsg, setReceiveErrorMsg] = useState<string | null>(null);
  const [showHashHelp, setShowHashHelp] = useState<boolean>(false);

  // Camera QR Scanner Modal Overlay State
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannedNotice, setScannedNotice] = useState<string | null>(null);

  const numericAmt = parseFloat(amount) || 0;
  const totalUsdVal = numericAmt * selectedAsset.priceUsd;

  // Single static TRC20 address for ALL deposits
  const activeDepositAddress = 'TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScanSuccess = (scannedAddress: string) => {
    setShowScanner(false);
    if (mode === 'send') {
      setRecipient(scannedAddress);
      setScannedNotice(`Scanned & applied recipient address: ${scannedAddress.slice(0, 8)}...${scannedAddress.slice(-6)}`);
      setTimeout(() => setScannedNotice(null), 4000);
    } else {
      navigator.clipboard.writeText(scannedAddress);
      setScannedNotice(`Scanned wallet address: ${scannedAddress} (Copied to clipboard!)`);
      setTimeout(() => setScannedNotice(null), 5000);
    }
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanRecipient = recipient.trim();
    if (!cleanRecipient) {
      setErrorMsg('Please enter a valid destination wallet address.');
      return;
    }

    if (numericAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    if (numericAmt > selectedAsset.balance) {
      setErrorMsg(
        `Insufficient ${selectedAsset.symbol} balance. Maximum available: ${selectedAsset.balance.toFixed(
          2
        )} ${selectedAsset.symbol}`
      );
      return;
    }

    // Require Security PIN auth
    setShowSecurityAuth(true);
  };

  const handleExecuteSend = async () => {
    setShowSecurityAuth(false);
    const cleanRecipient = recipient.trim();
    setLoading(true);
    const success = await onConfirmSend(selectedAsset.id, cleanRecipient, numericAmt, note);
    setLoading(false);

    if (success) {
      setSendSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setErrorMsg('Transaction rejected or network error. Please try again.');
    }
  };

  const handleVerifyDepositClick = async () => {
    setReceiveErrorMsg(null);
    const num = parseFloat(simAmount) || 0;

    if (num < 50) {
      setReceiveErrorMsg('Deposit Threshold Warning: Minimum deposit amount is 50 USDT.');
      return;
    }

    const trimmedHash = customTxHash.trim();
    if (!trimmedHash) {
      setReceiveErrorMsg('TxHash Required: Enter a valid transaction hash to verify your deposit.');
      return;
    }

    const isValidTxHash = /^(0x)?[a-fA-F0-9]{64}$/.test(trimmedHash);
    if (!isValidTxHash) {
      setReceiveErrorMsg('Invalid TxHash: Enter a valid 64-character transaction hash. Deposit was not credited.');
      return;
    }

    if (!onConfirmReceive) {
      setReceiveErrorMsg('Receive handler unavailable.');
      return;
    }

    setIsReceiving(true);
    const result = await onConfirmReceive(selectedAsset.id, num, trimmedHash, 'TRC20', activeDepositAddress);
    setIsReceiving(false);

    if (result.success) {
      setReceiveSuccess(true);
      setTimeout(() => onClose(), 1800);
    } else {
      setReceiveErrorMsg(result.error || result.message || 'Deposit verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Tabs */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setMode('send');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'send' ? 'trust-gradient text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Asset</span>
            </button>
            <button
              onClick={() => {
                setMode('receive');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'receive' ? 'trust-gradient text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Receive / Deposit</span>
            </button>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Scanned Notice Banner */}
        {scannedNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{scannedNotice}</span>
          </div>
        )}

        {sendSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-base font-extrabold text-slate-100">Asset Sent Successfully!</h4>
            <p className="text-xs text-slate-400 font-medium">
              Transferred {numericAmt} {selectedAsset.symbol} (${totalUsdVal.toFixed(2)} USD) to{' '}
              {recipient.slice(0, 8)}...{recipient.slice(-6)}.
            </p>
          </div>
        ) : mode === 'send' ? (
          <form onSubmit={handleSendSubmit} className="space-y-4">
            {/* Asset Picker */}
            <div>
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                Select Asset to Send
              </label>
              <div className="grid grid-cols-3 gap-2">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAsset(a)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedAsset.id === a.id
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold shadow-md'
                        : 'bg-slate-950/40 border-white/5 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{a.symbol}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {a.balance.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Recipient Wallet Address
                </label>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Scan Camera QR</span>
                </button>
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="TRC20 Address (TEYgjP... or TR7NH...) or 0x..."
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Transfer Amount ({selectedAsset.symbol})</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Available: {selectedAsset.balance.toFixed(2)} {selectedAsset.symbol}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-transparent font-mono text-2xl font-extrabold text-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAmount(selectedAsset.balance.toString())}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-extrabold uppercase border border-blue-500/30"
                >
                  MAX
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs font-mono text-slate-400">
                <span>Estimated Value:</span>
                <span className="font-bold text-slate-200">
                  ${totalUsdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-bold">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || numericAmt <= 0}
              className={`w-full py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                numericAmt <= 0
                  ? 'bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'trust-gradient text-white shadow-blue-600/25 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm & Send {selectedAsset.symbol}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Receive Mode - Strictly USDT (TRC20) */
          <div className="space-y-5 text-center">
            {/* Deposit Method Lock Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Deposit Network: USDT (TRC20)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Exclusive Method
              </span>
            </div>

            {/* Real QR Code graphic corresponding to static TRC20 address */}
            <div className="p-4 rounded-2xl bg-white text-slate-950 inline-block shadow-2xl border-4 border-blue-500/30">
              <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center">
                <QRCodeSVG
                  value={activeDepositAddress}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#020617"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="text-[10px] font-extrabold font-mono text-slate-900 mt-2 block uppercase tracking-wider">
                USDT (TRC20) Deposit QR
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-extrabold text-slate-300 uppercase tracking-wider text-left">
                  Official TRC20 Deposit Address
                </p>
                {copied && (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                    Address Copied to Clipboard!
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-950/90 border border-white/10 font-mono text-xs text-slate-200 shadow-inner">
                <span className="truncate font-extrabold text-amber-400 select-all self-center text-center sm:text-left px-1">
                  {activeDepositAddress}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shrink-0 border shadow-md active:scale-95 ${
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/20'
                      : 'trust-gradient text-white border-blue-500 hover:trust-gradient-hover shadow-blue-600/25'
                  }`}
                  title="Copy TRC20 address to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Camera QR Code Scanner Overlay Button */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 group"
            >
              <Camera className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Scan Address QR with Camera</span>
            </button>

            {/* Deposit Amount Input & Presets */}
            <div className="text-left space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-extrabold text-slate-300 uppercase tracking-wider block">
                  Deposit Amount (USDT)
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-extrabold">
                  Minimum: $50 USDT
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={50}
                  value={simAmount}
                  onChange={(e) => {
                    setSimAmount(e.target.value);
                    setReceiveErrorMsg(null);
                  }}
                  placeholder="Enter amount (min 50)"
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3 pr-16 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500 transition-all"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 font-mono">
                  USDT
                </span>
              </div>

              {/* Preset Amount Options: 50, 100, 150, 250, 500, 1000 */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {['50', '100', '150', '250', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setSimAmount(val);
                      setReceiveErrorMsg(null);
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      simAmount === val
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Blockchain TxHash Input Field */}
            <div className="text-left space-y-1.5 pt-1">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Blockchain TxHash <span className="text-rose-400 font-bold">*REQUIRED</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHashHelp((v) => !v)}
                    className="text-[10px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Where to find hash?</span>
                    {showHashHelp ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = (await navigator.clipboard.readText()).trim();
                        if (!text) {
                          setReceiveErrorMsg('Clipboard is empty. Copy your TxHash first, then click Paste Hash.');
                          return;
                        }
                        setCustomTxHash(text);
                        setReceiveErrorMsg(null);
                      } catch {
                        setReceiveErrorMsg('Could not read clipboard. Please paste your TxHash manually into the field.');
                      }
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Paste Hash</span>
                  </button>
                </div>
              </div>

              {showHashHelp && (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2.5 text-left">
                  <p className="text-[11px] font-extrabold text-amber-200 uppercase tracking-wider">
                    How to find your transaction hash (TxHash)
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                    <li>
                      After you send USDT to the deposit address, open the <span className="text-white font-bold">same wallet / exchange</span> you used to send.
                    </li>
                    <li>
                      Go to <span className="text-white font-bold">History</span>, <span className="text-white font-bold">Activity</span>, or <span className="text-white font-bold">Transactions</span>.
                    </li>
                    <li>
                      Tap the transfer you just made (to this vault address).
                    </li>
                    <li>
                      Look for <span className="text-white font-bold">TxHash</span>, <span className="text-white font-bold">Transaction ID</span>, <span className="text-white font-bold">Hash</span>, or <span className="text-white font-bold">TxID</span>.
                    </li>
                    <li>
                      Tap <span className="text-white font-bold">Copy</span>, then come back here and click <span className="text-blue-300 font-bold">Paste Hash</span>.
                    </li>
                  </ol>
                  <div className="pt-1 border-t border-white/10 space-y-1">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      <span className="text-slate-200 font-bold">Trust Wallet / MetaMask:</span> Wallet → History / Activity → open the send → Copy transaction hash.
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      <span className="text-slate-200 font-bold">Exchange (Binance, etc.):</span> Wallet → Withdrawal history → open the withdrawal → copy TxID / TxHash.
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      A valid hash is usually a long string of letters and numbers (about 64 characters).
                    </p>
                  </div>
                </div>
              )}

              <input
                type="text"
                value={customTxHash}
                onChange={(e) => {
                  setCustomTxHash(e.target.value);
                  setReceiveErrorMsg(null);
                }}
                placeholder="Paste 64-character transaction hash here..."
                className={`w-full bg-slate-950/80 border ${
                  !customTxHash.trim()
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : /^(0x)?[a-fA-F0-9]{64}$/.test(customTxHash.trim())
                    ? 'border-emerald-500/40'
                    : 'border-rose-500/40 bg-rose-500/5'
                } rounded-2xl p-3 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              <p className="text-[10px] text-slate-400 font-mono">
                Enter a valid 64-character TxHash. Invalid or missing hash will show an error.
              </p>
            </div>

            {/* Error Banner */}
            {receiveErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold text-left flex items-start gap-2.5 animate-fade-in shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{receiveErrorMsg}</span>
              </div>
            )}

            {/* Deposit Action Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleVerifyDepositClick}
                disabled={isReceiving || receiveSuccess}
                className="w-full py-3.5 rounded-xl trust-gradient hover:trust-gradient-hover text-white text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>
                  {isReceiving
                    ? 'Verifying Deposit...'
                    : receiveSuccess
                    ? 'Deposit Credited'
                    : `Verify & Credit Deposit ($${simAmount || '50'} USDT)`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera QR Code Scanner Overlay */}
      {showScanner && (
        <QRScannerModal
          title={mode === 'send' ? 'Scan Recipient Wallet QR' : 'Scan Wallet QR Code with Camera'}
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Security Auth Modal for Sending Crypto */}
      {showSecurityAuth && (
        <SecurityAuthModal
          isOpen={showSecurityAuth}
          actionTitle={`Authorize Transfer (${amount} ${selectedAsset.symbol})`}
          actionDescription={`Enter your 4-digit Security PIN to send ${amount} ${selectedAsset.symbol} to ${recipient.slice(0, 8)}...`}
          expectedPin={expectedSecurityPin}
          onSuccess={handleExecuteSend}
          onCancel={() => setShowSecurityAuth(false)}
          onResetPin={onResetSecurityPin}
        />
      )}
    </div>
  );
};
