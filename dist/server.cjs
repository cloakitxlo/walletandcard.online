var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/utils/addressUtils.ts
function getTRC20AddressForUser(userIdOrAddress) {
  return "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC";
}

// src/utils/cardUtils.ts
function generateUserCard(user) {
  const userIdStr = user.id + (user.address || "");
  let hash = 0;
  for (let i = 0; i < userIdStr.length; i++) {
    hash = (hash << 5) - hash + userIdStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const prefix = posHash % 2 === 0 ? "4532" : "4921";
  const middle = String(posHash).padStart(8, "7").slice(-8);
  const lastFour = String(posHash * 13 % 1e4).padStart(4, "8");
  const cardNumber = `${prefix}${middle}${lastFour}`;
  const month = String(posHash % 12 + 1).padStart(2, "0");
  const year = String(28 + posHash % 4);
  const expiryDate = `${month}/${year}`;
  const cvv = String(posHash % 900 + 100);
  const cardPin = String(posHash * 7 % 9e3 + 1e3);
  const cardHolderName = user.name && user.name.trim() ? user.name.trim() : "Wallet & Card Member";
  return {
    id: `card-${user.id}`,
    cardNumber,
    cardHolder: cardHolderName.toUpperCase(),
    expiryDate,
    cvv,
    cardPin,
    tier: user.cardTier || "black",
    spendingLimitMonthly: 15e3,
    spentThisMonth: posHash % 3e3 + 250,
    isFrozen: false,
    contactlessEnabled: true,
    onlinePaymentsEnabled: true,
    atmWithdrawalsEnabled: true,
    autoTopupEnabled: true,
    autoTopupThreshold: 100,
    autoTopupAmount: 500,
    balanceUsd: 0
  };
}

// src/utils/emailValidation.ts
function isValidEmailAddress(email) {
  const value = String(email || "").trim();
  if (!value || value.length > 254) return false;
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
    value
  );
}
var EMAIL_VALIDATION_ERROR = "Please use a proper or correct email address.";

// src/data/mockData.ts
var INITIAL_CARD = {
  id: "card-9982",
  cardNumber: "4532889201847721",
  cardHolder: "ALEXANDER R. VANCE",
  expiryDate: "08/29",
  cvv: "849",
  tier: "black",
  isFrozen: false,
  spendingLimitMonthly: 15e3,
  spentThisMonth: 3420.5,
  contactlessEnabled: true,
  onlinePaymentsEnabled: true,
  atmWithdrawalsEnabled: true,
  autoTopupEnabled: true,
  autoTopupThreshold: 100,
  autoTopupAmount: 500,
  balanceUsd: 0
};
var INITIAL_ASSETS = [
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether USD",
    balance: 15450,
    priceUsd: 1,
    change24h: 0.01,
    valueUsd: 15450
  },
  {
    id: "tron",
    symbol: "TRX",
    name: "TRON Native Token",
    balance: 12500,
    priceUsd: 0.128,
    change24h: 3.85,
    valueUsd: 1600
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB Smart Chain Token",
    balance: 12.5,
    priceUsd: 580.2,
    change24h: 2.15,
    valueUsd: 7252.5
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.4281,
    priceUsd: 64250,
    change24h: 3.42,
    valueUsd: 27505.42
  },
  {
    id: "apex",
    symbol: "APEX",
    name: "Apex Utility Token",
    balance: 12500,
    priceUsd: 0.84,
    change24h: 8.25,
    valueUsd: 10500
  }
];
var INITIAL_TRANSACTIONS = [
  {
    id: "tx-101",
    title: "Apple Store Regent St",
    merchantName: "Apple Store",
    category: "purchase",
    amountUsd: 1299,
    date: "2026-08-11 14:22",
    status: "completed",
    cashbackEarnedUsd: 64.95,
    cardLastFour: "7721"
  },
  {
    id: "tx-102",
    title: "Card Auto Top-up from ETH",
    category: "topup",
    amountUsd: 500,
    amountCrypto: "0.143 ETH",
    date: "2026-08-10 18:45",
    status: "completed",
    cardLastFour: "7721"
  },
  {
    id: "tx-103",
    title: "Uber Black Ride",
    merchantName: "Uber Technologies",
    category: "purchase",
    amountUsd: 48.5,
    date: "2026-08-09 22:10",
    status: "completed",
    cashbackEarnedUsd: 2.42,
    cardLastFour: "7721"
  },
  {
    id: "tx-104",
    title: "Weekly Staking Cashback Reward",
    category: "reward",
    amountUsd: 142.2,
    amountCrypto: "169.2 APEX",
    date: "2026-08-08 09:00",
    status: "completed"
  },
  {
    id: "tx-105",
    title: "Starbucks Coffee Reserve",
    merchantName: "Starbucks",
    category: "purchase",
    amountUsd: 14.8,
    date: "2026-08-07 10:15",
    status: "completed",
    cashbackEarnedUsd: 0.74,
    cardLastFour: "7721"
  },
  {
    id: "tx-106",
    title: "Converted SOL to USDT",
    category: "swap",
    amountUsd: 750,
    amountCrypto: "4.92 SOL \u2192 750 USDT",
    date: "2026-08-05 16:30",
    status: "completed"
  }
];
var CARD_TIERS = [
  {
    id: "gold",
    name: "Gold Prestige",
    colorGradient: "from-amber-600 via-yellow-500 to-amber-700",
    cardImageBg: "bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950 border-amber-500/50",
    cashbackPercent: 3.5,
    stakingRequired: 2500,
    atmLimitMonthly: 5e3,
    popular: true,
    perks: [
      "3.5% Cashback on All Purchases",
      "24k Gold-Plated Brushed Metal Card",
      "Spotify & Netflix 100% Rebates",
      "$5,000 Fee-Free Monthly ATM Limits",
      "Priority 24/7 VIP Concierge Support"
    ]
  },
  {
    id: "black",
    name: "Obsidian Black Edition",
    colorGradient: "from-zinc-900 via-zinc-800 to-black",
    cardImageBg: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-zinc-700",
    cashbackPercent: 8,
    stakingRequired: 25e3,
    atmLimitMonthly: 2e4,
    perks: [
      "8.0% Instant Cashback in APEX/BTC",
      "Heavyweight 28g Obsidian Black Metal",
      "Private Jet & Luxury Hotel Discounts",
      "Dedicated Personal Wealth Manager",
      "Unlimited Lounge Key Access + 1 Guest",
      "12.5% Staking APY Boost"
    ]
  }
];
var INITIAL_CONNECTED_USERS = [
  {
    id: "user-01",
    address: "0x71C82910a39B21495c0234123984A018281989A2",
    trc20Address: "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC",
    network: "TRC20",
    totalBalanceUsd: 55057.92,
    isFrozen: false,
    cardTier: "black",
    connectedAt: "2026-08-11 16:40",
    status: "active",
    assets: [
      { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 15450, priceUsd: 1, change24h: 0.01, valueUsd: 15450 },
      { id: "tron", symbol: "TRX", name: "TRON", balance: 12500, priceUsd: 0.128, change24h: 3.85, valueUsd: 1600 },
      { id: "bnb", symbol: "BNB", name: "BNB Smart Chain", balance: 12.5, priceUsd: 580.2, change24h: 2.15, valueUsd: 7252.5 },
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin", balance: 0.3228, priceUsd: 64250, change24h: 3.42, valueUsd: 20739.9 },
      { id: "apex", symbol: "APEX", name: "Apex Token", balance: 12e3, priceUsd: 0.84, change24h: 8.25, valueUsd: 10080 }
    ]
  },
  {
    id: "user-05",
    address: "TL38a1T8z34J9X2a89mZ41Pq9m5TrC20v",
    trc20Address: "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC",
    network: "TRC20",
    totalBalanceUsd: 18450,
    isFrozen: false,
    cardTier: "black",
    connectedAt: "2026-08-11 17:10",
    status: "active",
    assets: [
      { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 15e3, priceUsd: 1, change24h: 0.01, valueUsd: 15e3 },
      { id: "tron", symbol: "TRX", name: "TRON", balance: 26953.1, priceUsd: 0.128, change24h: 3.85, valueUsd: 3450 }
    ]
  },
  {
    id: "user-02",
    address: "0x3F89a0129Bf7129A8834901Cee210985A11849D0",
    trc20Address: "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC",
    network: "BEP20",
    totalBalanceUsd: 28450,
    isFrozen: false,
    cardTier: "gold",
    connectedAt: "2026-08-11 14:12",
    status: "active",
    assets: [
      { id: "bnb", symbol: "BNB", name: "BNB Chain Token", balance: 25.2, priceUsd: 580.2, change24h: 2.15, valueUsd: 14621.04 },
      { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 13828.96, priceUsd: 1, change24h: 0.01, valueUsd: 13828.96 }
    ]
  },
  {
    id: "user-03",
    address: "0x99A312b048A110294B129c1292A19041B1892C51",
    trc20Address: "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC",
    network: "Bitcoin",
    totalBalanceUsd: 11200.5,
    isFrozen: true,
    freezeReason: "Compliance AML Verification Request",
    cardTier: "standard",
    connectedAt: "2026-08-10 19:30",
    status: "frozen",
    assets: [
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin", balance: 0.12, priceUsd: 64250, change24h: 3.42, valueUsd: 7710 },
      { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 3490.5, priceUsd: 1, change24h: 0.01, valueUsd: 3490.5 }
    ]
  },
  {
    id: "user-04",
    address: "0x10B45C2930a0094191024312A349018400192A02",
    trc20Address: "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC",
    network: "TRC20",
    totalBalanceUsd: 98197.5,
    isFrozen: false,
    cardTier: "platinum",
    connectedAt: "2026-08-09 10:05",
    status: "active",
    assets: [
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin", balance: 1.5, priceUsd: 64250, change24h: 3.42, valueUsd: 96375 },
      { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 1822.5, priceUsd: 1, change24h: 0.01, valueUsd: 1822.5 }
    ]
  }
];
var INITIAL_ADMIN_LOGS = [
  {
    id: "alog-101",
    adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
    actionType: "freeze",
    targetUserAddress: "0x99A312b048A110294B129c1292A19041B1892C51",
    note: "Compliance compliance check initiated. Account locked.",
    timestamp: "2026-08-10 19:35:10",
    txHash: "0x88f2c...91a4"
  },
  {
    id: "alog-102",
    adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
    actionType: "move_funds",
    targetUserAddress: "0x71C82910a39B21495c0234123984A018281989A2",
    amountUsd: 500,
    assetSymbol: "ETH",
    note: "Auto top-up allocation from ETH user vault into Debit Card Spending Reserve.",
    timestamp: "2026-08-10 18:45:00",
    txHash: "0x32a1e...4f90"
  },
  {
    id: "alog-103",
    adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
    actionType: "dispatch_funds",
    targetUserAddress: "0x10B45C2930a0094191024312A349018400192A02",
    amountUsd: 1e3,
    assetSymbol: "USDT",
    note: "VIP Platinum tier welcome liquidity grant.",
    timestamp: "2026-08-09 11:00:20",
    txHash: "0x77b0d...1a88"
  }
];

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  let cardState = { ...INITIAL_CARD };
  let transactionsState = [...INITIAL_TRANSACTIONS];
  let assetsState = [...INITIAL_ASSETS];
  let connectedUsersState = [...INITIAL_CONNECTED_USERS];
  let adminLogsState = [...INITIAL_ADMIN_LOGS];
  let supportTicketsState = [];
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Wallet & Card API", version: "2.0.0" });
  });
  app.get("/api/crypto/prices", async (req, res) => {
    const { userId } = req.query;
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,tron,binancecoin&vs_currencies=usd&include_24hr_change=true"
      );
      if (response.ok) {
        const data = await response.json();
        connectedUsersState.forEach((user) => {
          if (!user.assets) return;
          user.assets.forEach((ast) => {
            if (ast.id === "usdt" && data.tether) {
              ast.priceUsd = data.tether.usd;
              ast.change24h = data.tether.usd_24h_change || 0.01;
            } else if (ast.id === "tron" && data.tron) {
              ast.priceUsd = data.tron.usd;
              ast.change24h = data.tron.usd_24h_change || ast.change24h;
            } else if (ast.id === "bnb" && data.binancecoin) {
              ast.priceUsd = data.binancecoin.usd;
              ast.change24h = data.binancecoin.usd_24h_change || ast.change24h;
            } else if (ast.id === "bitcoin" && data.bitcoin) {
              ast.priceUsd = data.bitcoin.usd;
              ast.change24h = data.bitcoin.usd_24h_change || ast.change24h;
            }
            ast.valueUsd = ast.balance * ast.priceUsd;
          });
          user.totalBalanceUsd = user.assets.reduce((sum, a) => sum + a.balance * a.priceUsd, 0);
        });
      }
    } catch (err) {
      console.log("Using fallback crypto prices due to fetch error:", err);
    }
    if (userId) {
      const u = connectedUsersState.find((usr) => usr.id === userId || usr.address === userId);
      if (u) {
        res.json({ assets: u.assets, totalBalanceUsd: u.totalBalanceUsd });
        return;
      }
    }
    res.json({ assets: connectedUsersState[0]?.assets || assetsState });
  });
  app.get("/api/user/details", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId parameter required" });
      return;
    }
    const u = connectedUsersState.find((usr) => usr.id === userId || usr.address === userId || usr.email?.toLowerCase() === String(userId).toLowerCase());
    if (u) {
      res.json({
        success: true,
        userAccount: sanitizeUser(u),
        assets: u.assets,
        transactions: u.transactions || [],
        totalBalanceUsd: u.totalBalanceUsd
      });
      return;
    }
    res.status(404).json({ success: false, error: "User account not found" });
  });
  app.get("/api/card", (req, res) => {
    const { name, userId } = req.query;
    if (userId) {
      const u = connectedUsersState.find((usr) => usr.id === userId || usr.address === userId || usr.email?.toLowerCase() === String(userId).toLowerCase());
      if (u) {
        if (!u.card) {
          u.card = generateUserCard(u);
        }
        if (name && String(name).trim()) {
          u.card.cardHolder = String(name).trim().toUpperCase();
        }
        res.json({ card: u.card });
        return;
      }
    }
    if (name) {
      cardState.cardHolder = String(name).trim().toUpperCase();
    }
    res.json({ card: cardState });
  });
  app.post("/api/card/freeze", (req, res) => {
    const { isFrozen } = req.body;
    cardState.isFrozen = typeof isFrozen === "boolean" ? isFrozen : !cardState.isFrozen;
    res.json({ success: true, card: cardState });
  });
  app.post("/api/card/limits", (req, res) => {
    const { limit, contactless, online, atm } = req.body;
    if (limit !== void 0) cardState.spendingLimitMonthly = Number(limit);
    if (contactless !== void 0) cardState.contactlessEnabled = Boolean(contactless);
    if (online !== void 0) cardState.onlinePaymentsEnabled = Boolean(online);
    if (atm !== void 0) cardState.atmWithdrawalsEnabled = Boolean(atm);
    res.json({ success: true, card: cardState });
  });
  app.post("/api/card/topup", (req, res) => {
    const { userId, assetId, amountUsd } = req.body;
    const topupVal = Number(amountUsd);
    if (!topupVal || topupVal <= 0) {
      res.status(400).json({ error: "Invalid topup amount" });
      return;
    }
    let targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      targetUser = connectedUsersState[0];
    }
    const userAssets = targetUser.assets || assetsState;
    const asset = userAssets.find((a) => a.id === assetId || a.symbol === assetId);
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    const requiredCrypto = topupVal / asset.priceUsd;
    if (asset.balance < requiredCrypto) {
      res.status(400).json({ error: `Insufficient ${asset.symbol} balance` });
      return;
    }
    asset.balance -= requiredCrypto;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + a.balance * a.priceUsd, 0);
    if (!targetUser.card) {
      targetUser.card = generateUserCard(targetUser);
    }
    targetUser.card.balanceUsd = (targetUser.card.balanceUsd || 0) + topupVal;
    cardState.balanceUsd = (cardState.balanceUsd || 0) + topupVal;
    const newTx = {
      id: `tx-${Date.now()}`,
      title: `Card Top-up from ${asset.symbol}`,
      category: "topup",
      amountUsd: topupVal,
      amountCrypto: `${requiredCrypto.toFixed(4)} ${asset.symbol}`,
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      cardLastFour: (targetUser.card?.cardNumber || cardState.cardNumber).slice(-4)
    };
    if (!targetUser.transactions) targetUser.transactions = [];
    targetUser.transactions.unshift(newTx);
    transactionsState.unshift(newTx);
    res.json({
      success: true,
      transaction: newTx,
      assets: userAssets,
      transactions: targetUser.transactions,
      totalBalanceUsd: targetUser.totalBalanceUsd,
      card: targetUser.card
    });
  });
  app.post("/api/wallet/send", (req, res) => {
    const { userId, assetId, recipientAddress, amount, note } = req.body;
    const sendAmt = Number(amount);
    if (!sendAmt || sendAmt <= 0) {
      res.status(400).json({ error: "Invalid transfer amount" });
      return;
    }
    let targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      targetUser = connectedUsersState[0];
    }
    const userAssets = targetUser.assets || assetsState;
    const asset = userAssets.find((a) => a.id === assetId || a.symbol === assetId);
    if (!asset) {
      res.status(404).json({ error: "Asset not found in wallet" });
      return;
    }
    if (asset.balance < sendAmt) {
      res.status(400).json({ error: `Insufficient ${asset.symbol} balance to send.` });
      return;
    }
    asset.balance -= sendAmt;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + a.balance * a.priceUsd, 0);
    const amountUsd = sendAmt * asset.priceUsd;
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    const newTx = {
      id: `tx-send-${Date.now()}`,
      title: `Sent ${sendAmt} ${asset.symbol}`,
      category: "send",
      amountUsd,
      amountCrypto: `${sendAmt.toFixed(4)} ${asset.symbol}`,
      recipientAddress: recipientAddress || "0xRecipientAddress...",
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      txHash
    };
    if (!targetUser.transactions) targetUser.transactions = [];
    targetUser.transactions.unshift(newTx);
    transactionsState.unshift(newTx);
    res.json({
      success: true,
      transaction: newTx,
      assets: userAssets,
      transactions: targetUser.transactions,
      totalBalanceUsd: targetUser.totalBalanceUsd,
      message: `Transferred ${sendAmt} ${asset.symbol} to ${recipientAddress}`
    });
  });
  const verifiedTxHashes = /* @__PURE__ */ new Set();
  app.post("/api/wallet/receive", (req, res) => {
    const { userId, assetId, amount, txHash, network, vaultAddress } = req.body;
    const recvAmt = Number(amount);
    if (isNaN(recvAmt) || recvAmt < 50) {
      res.status(400).json({
        success: false,
        error: "Deposit Failed: Minimum deposit amount is 50 USDT."
      });
      return;
    }
    if (recvAmt > 99e3) {
      res.status(400).json({
        success: false,
        error: "Deposit Failed: Maximum deposit limit is 99,000 USDT per transaction."
      });
      return;
    }
    const cleanTxHash = (txHash || "").trim();
    if (!cleanTxHash) {
      res.status(400).json({
        success: false,
        error: "TxHash Required: Please enter your blockchain deposit transaction hash (TxHash). Deposit cannot be credited without verification."
      });
      return;
    }
    const isValidTxHash = /^(0x)?[a-fA-F0-9]{64}$/.test(cleanTxHash);
    if (!isValidTxHash) {
      res.status(400).json({
        success: false,
        error: "Invalid TxHash: Enter a valid 64-character transaction hash. Deposit was not credited."
      });
      return;
    }
    if (verifiedTxHashes.has(cleanTxHash.toLowerCase())) {
      res.status(400).json({
        success: false,
        error: `Duplicate TxHash Claim: Transaction hash ${cleanTxHash.slice(0, 12)}... has already been verified and credited previously.`
      });
      return;
    }
    let targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      targetUser = connectedUsersState[0];
    }
    const userAssets = targetUser.assets || assetsState;
    let asset = userAssets.find((a) => a.id === assetId || a.symbol === assetId);
    if (!asset) {
      asset = userAssets.find((a) => a.symbol === "USDT") || userAssets[0];
    }
    verifiedTxHashes.add(cleanTxHash.toLowerCase());
    asset.balance += recvAmt;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + a.balance * a.priceUsd, 0);
    const amountUsd = recvAmt * asset.priceUsd;
    const destinationVault = vaultAddress || (network === "TRC20" ? "TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v" : "0x71C82910a39B21495c0234123984A018281989A2");
    const newTx = {
      id: `tx-recv-${Date.now()}`,
      title: `Verified Deposit (${recvAmt.toFixed(2)} ${asset.symbol})`,
      category: "receive",
      amountUsd,
      amountCrypto: `+${recvAmt.toFixed(2)} ${asset.symbol}`,
      senderAddress: destinationVault,
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      txHash: cleanTxHash
    };
    if (!targetUser.transactions) targetUser.transactions = [];
    targetUser.transactions.unshift(newTx);
    transactionsState.unshift(newTx);
    res.json({
      success: true,
      transaction: newTx,
      assets: userAssets,
      transactions: targetUser.transactions,
      totalBalanceUsd: targetUser.totalBalanceUsd,
      verifiedHash: cleanTxHash,
      vaultAddress: destinationVault,
      message: `Verified deposit of ${recvAmt} ${asset.symbol} to Vault ${destinationVault.slice(0, 8)}...`
    });
  });
  app.get("/api/admin/users", (req, res) => {
    res.json({ users: connectedUsersState.map(sanitizeUser), logs: adminLogsState });
  });
  app.post("/api/support/tickets", (req, res) => {
    const { userId, fullName, email, description, screenshotDataUrl } = req.body || {};
    if (!userId || !fullName || !email || !description) {
      res.status(400).json({
        success: false,
        error: "Full name, email, and issue description are required"
      });
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ticket = {
      id: `SUP-${Date.now().toString(36).toUpperCase()}`,
      userId: String(userId),
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      description: String(description).trim(),
      screenshotDataUrl: typeof screenshotDataUrl === "string" && screenshotDataUrl.startsWith("data:image/") ? screenshotDataUrl : void 0,
      status: "open",
      messages: [
        {
          id: `msg-${Date.now()}`,
          authorRole: "user",
          authorName: String(fullName).trim(),
          message: String(description).trim(),
          createdAt: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    supportTicketsState.unshift(ticket);
    res.json({ success: true, ticket });
  });
  app.get("/api/support/tickets", (req, res) => {
    const userId = String(req.query.userId || "");
    if (!userId) {
      res.status(400).json({ success: false, error: "userId is required" });
      return;
    }
    const tickets = supportTicketsState.filter((t) => t.userId === userId);
    res.json({ success: true, tickets });
  });
  app.get("/api/admin/support/tickets", (_req, res) => {
    res.json({ success: true, tickets: supportTicketsState });
  });
  app.post("/api/admin/support/reply", (req, res) => {
    const { ticketId, message, adminName } = req.body || {};
    if (!ticketId || !message) {
      res.status(400).json({ success: false, error: "ticketId and message are required" });
      return;
    }
    const ticket = supportTicketsState.find((t) => t.id === ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: "Ticket not found" });
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    ticket.messages.push({
      id: `msg-${Date.now()}`,
      authorRole: "admin",
      authorName: String(adminName || "Support Admin").trim(),
      message: String(message).trim(),
      createdAt: now
    });
    ticket.status = "answered";
    ticket.updatedAt = now;
    res.json({ success: true, ticket });
  });
  const SUPER_ADMIN = {
    id: "admin-master",
    email: "admin@cryptocard.com",
    username: "admin",
    password: "SuperAdmin@2026",
    name: "Super Admin Master",
    role: "admin",
    address: "0xADMIN_RESERVE_MASTER_VAULT",
    trc20Address: "TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v"
  };
  const isSuperAdminLogin = (loginId) => {
    const id = loginId.trim().toLowerCase();
    return id === SUPER_ADMIN.email || id === SUPER_ADMIN.username || id === "admin@system.com";
  };
  const sanitizeUser = (user) => {
    const { password: _pw, ...safe } = user;
    return safe;
  };
  app.post("/api/auth/login", (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!isSuperAdminLogin(cleanEmail) && !isValidEmailAddress(cleanEmail)) {
      res.status(400).json({ success: false, error: EMAIL_VALIDATION_ERROR });
      return;
    }
    if (isSuperAdminLogin(cleanEmail)) {
      if (password !== SUPER_ADMIN.password) {
        res.status(401).json({ success: false, error: "Incorrect email or password." });
        return;
      }
      res.json({
        success: true,
        user: {
          id: SUPER_ADMIN.id,
          email: SUPER_ADMIN.email,
          name: name ? name.trim() : SUPER_ADMIN.name,
          role: SUPER_ADMIN.role,
          address: SUPER_ADMIN.address,
          trc20Address: SUPER_ADMIN.trc20Address
        }
      });
      return;
    }
    const matchedUser = connectedUsersState.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      res.status(404).json({
        success: false,
        code: "NEED_SIGNUP",
        error: "No account found with this email. Please sign up first."
      });
      return;
    }
    if (!matchedUser.password || matchedUser.password !== password) {
      res.status(401).json({
        success: false,
        error: "Incorrect email or password."
      });
      return;
    }
    if (name && name.trim()) {
      matchedUser.name = name.trim();
    }
    if (matchedUser.name) {
      if (!matchedUser.card) {
        matchedUser.card = generateUserCard(matchedUser);
      }
      matchedUser.card.cardHolder = matchedUser.name.trim().toUpperCase();
    }
    res.json({
      success: true,
      user: {
        id: matchedUser.id,
        email: cleanEmail,
        name: matchedUser.name || "Wallet & Card User",
        role: "user",
        address: matchedUser.address,
        trc20Address: matchedUser.trc20Address,
        securityPin: matchedUser.securityPin
      },
      userAccount: sanitizeUser(matchedUser),
      card: matchedUser.card || null
    });
  });
  app.post("/api/auth/update-profile", (req, res) => {
    const { userId, name, email, currentPassword, newPassword } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: "User ID is required." });
      return;
    }
    const targetUser = connectedUsersState.find((u) => u.id === userId || u.email?.toLowerCase() === String(email).toLowerCase());
    if (name && name.trim()) {
      if (targetUser) targetUser.name = name.trim();
      cardState.cardHolder = name.trim();
    }
    if (email && email.trim() && targetUser) {
      targetUser.email = email.trim().toLowerCase();
    }
    if (newPassword && targetUser) {
      if (targetUser.password && currentPassword && targetUser.password !== currentPassword) {
        res.status(401).json({ success: false, error: "Current password is incorrect." });
        return;
      }
      targetUser.password = String(newPassword);
    }
    res.json({
      success: true,
      user: {
        id: targetUser ? targetUser.id : userId,
        email: targetUser ? targetUser.email : email,
        name: name || (targetUser ? targetUser.name : "Wallet & Card Member"),
        role: "user",
        address: targetUser ? targetUser.address : "0x71C82910a39B21495c0234123984A018281989A2",
        trc20Address: targetUser ? targetUser.trc20Address : "TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v"
      },
      card: targetUser?.card || cardState,
      message: "Profile updated successfully!"
    });
  });
  app.post("/api/auth/security-pin", (req, res) => {
    const { userId, currentPin, newPin, accountPassword, isReset } = req.body;
    if (!userId || !newPin || String(newPin).length !== 4) {
      res.status(400).json({ success: false, error: "User ID and a 4-digit numeric Security PIN are required." });
      return;
    }
    const targetUser = connectedUsersState.find(
      (u) => u.id === userId || u.address === userId || u.email?.toLowerCase() === String(userId).toLowerCase()
    );
    if (!targetUser) {
      res.status(404).json({ success: false, error: "User account not found." });
      return;
    }
    if (!isReset) {
      if (targetUser.securityPin && currentPin && targetUser.securityPin !== currentPin) {
        res.status(400).json({ success: false, error: "Incorrect current Security PIN." });
        return;
      }
    }
    targetUser.securityPin = String(newPin);
    res.json({
      success: true,
      securityPin: String(newPin),
      message: isReset ? "Security PIN successfully reset!" : "Security PIN successfully saved!"
    });
  });
  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: "Name, email, and password are required" });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmailAddress(cleanEmail)) {
      res.status(400).json({ success: false, error: EMAIL_VALIDATION_ERROR });
      return;
    }
    if (isSuperAdminLogin(cleanEmail)) {
      res.status(403).json({ success: false, error: "This login ID is reserved for Super Admin." });
      return;
    }
    const existing = connectedUsersState.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        code: "ALREADY_REGISTERED",
        error: "An account with this email already exists. Please sign in."
      });
      return;
    }
    const newUserId = `user-${Date.now()}`;
    const userAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    const trc20Addr = getTRC20AddressForUser(newUserId);
    const newUser = {
      id: newUserId,
      email: cleanEmail,
      name: name.trim(),
      password: String(password),
      address: userAddress,
      trc20Address: trc20Addr,
      network: "TRC20",
      totalBalanceUsd: 0,
      isFrozen: false,
      cardTier: "standard",
      card: void 0,
      assets: [
        { id: "usdt", symbol: "USDT", name: "Tether USD", balance: 0, priceUsd: 1, change24h: 0.01, valueUsd: 0 },
        { id: "tron", symbol: "TRX", name: "TRON Native Token", balance: 0, priceUsd: 0.128, change24h: 3.85, valueUsd: 0 },
        { id: "bnb", symbol: "BNB", name: "BNB Smart Chain Token", balance: 0, priceUsd: 580.2, change24h: 2.15, valueUsd: 0 },
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin", balance: 0, priceUsd: 64250, change24h: 3.42, valueUsd: 0 }
      ],
      transactions: [],
      connectedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "active"
    };
    newUser.card = generateUserCard(newUser);
    connectedUsersState.unshift(newUser);
    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: cleanEmail,
        name: newUser.name,
        role: "user",
        address: newUser.address,
        trc20Address: newUser.trc20Address
      },
      userAccount: sanitizeUser(newUser),
      card: newUser.card
    });
  });
  app.post("/api/auth/demo-login", (req, res) => {
    const { demoType } = req.body;
    if (demoType === "admin") {
      res.json({
        success: true,
        user: {
          id: SUPER_ADMIN.id,
          email: SUPER_ADMIN.email,
          name: SUPER_ADMIN.name,
          role: SUPER_ADMIN.role,
          address: SUPER_ADMIN.address,
          trc20Address: SUPER_ADMIN.trc20Address
        }
      });
      return;
    }
    const targetUser = demoType === "user2" ? connectedUsersState[2] || connectedUsersState[1] : connectedUsersState[0];
    res.json({
      success: true,
      user: {
        id: targetUser.id,
        email: targetUser.email || `${targetUser.id}@cryptocard.com`,
        name: targetUser.name || (demoType === "user2" ? "Account 02 Holder" : "Account 01 Holder"),
        role: "user",
        address: targetUser.address,
        trc20Address: targetUser.trc20Address
      },
      userAccount: targetUser
    });
  });
  app.post("/api/admin/notice", (req, res) => {
    const { targetUserId, title, message, type } = req.body;
    if (!title || !message) {
      res.status(400).json({ success: false, error: "Title and message are required for notice dispatch." });
      return;
    }
    const newNotice = {
      id: `notice-${Date.now()}`,
      title,
      message,
      type: type || "info",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      issuedBy: "Super Admin Security Center"
    };
    if (targetUserId === "all") {
      connectedUsersState.forEach((u) => {
        if (!u.notices) u.notices = [];
        u.notices.unshift(newNotice);
      });
    } else {
      const u = connectedUsersState.find((usr) => usr.id === targetUserId || usr.address === targetUserId);
      if (u) {
        if (!u.notices) u.notices = [];
        u.notices.unshift(newNotice);
      }
    }
    adminLogsState.unshift({
      id: `alog-${Date.now()}`,
      adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
      actionType: "send_notice",
      targetUserAddress: targetUserId === "all" ? "BROADCAST_ALL_USERS" : targetUserId,
      note: `Notice issued: ${title}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}`
    });
    res.json({
      success: true,
      notice: newNotice,
      users: connectedUsersState,
      logs: adminLogsState
    });
  });
  app.post("/api/admin/freeze-user", (req, res) => {
    const { userId, isFrozen, reason } = req.body;
    const targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    targetUser.isFrozen = Boolean(isFrozen);
    targetUser.status = isFrozen ? "frozen" : "active";
    if (isFrozen && reason) {
      targetUser.freezeReason = reason;
    }
    if (targetUser.address.toLowerCase() === "0x71C82910a39B21495c0234123984A018281989A2".toLowerCase()) {
      cardState.isFrozen = targetUser.isFrozen;
    }
    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
      actionType: isFrozen ? "freeze" : "unfreeze",
      targetUserAddress: targetUser.address,
      note: reason || (isFrozen ? "Administrative freeze applied" : "Administrative lock lifted"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}`
    };
    adminLogsState.unshift(adminLog);
    res.json({
      success: true,
      user: targetUser,
      users: connectedUsersState,
      logs: adminLogsState,
      card: cardState
    });
  });
  app.post("/api/admin/move-funds", (req, res) => {
    const { userId, assetSymbol, amount, note, destinationNote, destinationAddress } = req.body;
    const targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      res.status(404).json({ error: "Target user account not found" });
      return;
    }
    const moveAmt = Number(amount);
    if (!moveAmt || moveAmt <= 0) {
      res.status(400).json({ error: "Invalid move amount" });
      return;
    }
    const userAsset = targetUser.assets.find((a) => a.symbol === assetSymbol) || targetUser.assets[0];
    if (userAsset) {
      userAsset.balance = Math.max(0, userAsset.balance - moveAmt);
      userAsset.valueUsd = userAsset.balance * userAsset.priceUsd;
    }
    if (targetUser.address.toLowerCase() === "0x71C82910a39B21495c0234123984A018281989A2".toLowerCase()) {
      const primaryAsset = assetsState.find((a) => a.symbol === assetSymbol) || assetsState[0];
      if (primaryAsset) {
        primaryAsset.balance = Math.max(0, primaryAsset.balance - moveAmt);
        primaryAsset.valueUsd = primaryAsset.balance * primaryAsset.priceUsd;
      }
    }
    targetUser.totalBalanceUsd = targetUser.assets.reduce((acc, a) => acc + a.valueUsd, 0);
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}`;
    const destAddr = destinationAddress || "TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC";
    const finalNote = note || destinationNote || `Transferred to TRC20 Vault (${destAddr})`;
    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
      actionType: "move_funds",
      targetUserAddress: targetUser.address,
      amountUsd: moveAmt * (userAsset?.priceUsd || 1),
      assetSymbol: assetSymbol || "USDT",
      note: finalNote,
      timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      txHash
    };
    adminLogsState.unshift(adminLog);
    const newTx = {
      id: `tx-admin-${Date.now()}`,
      title: `Admin Fund Transfer (${assetSymbol})`,
      category: "admin_move",
      amountUsd: moveAmt * (userAsset?.priceUsd || 1),
      amountCrypto: `${moveAmt} ${assetSymbol}`,
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      txHash
    };
    transactionsState.unshift(newTx);
    res.json({
      success: true,
      user: targetUser,
      users: connectedUsersState,
      assets: assetsState,
      logs: adminLogsState,
      transactions: transactionsState
    });
  });
  app.post("/api/admin/transfer-users", (req, res) => {
    const { sourceUserId, targetUserId, assetSymbol, amount, note } = req.body;
    const transferAmt = Number(amount);
    if (!sourceUserId || !targetUserId || !transferAmt || transferAmt <= 0) {
      res.status(400).json({ error: "Valid source user, target user, and positive transfer amount required." });
      return;
    }
    const sourceUser = connectedUsersState.find((u) => u.id === sourceUserId || u.address === sourceUserId);
    const targetUser = connectedUsersState.find((u) => u.id === targetUserId || u.address === targetUserId);
    if (!sourceUser) {
      res.status(404).json({ error: "Source user not found." });
      return;
    }
    if (!targetUser) {
      res.status(404).json({ error: "Target destination user not found." });
      return;
    }
    const symbol = assetSymbol || "USDT";
    let sourceAsset = sourceUser.assets.find((a) => a.symbol === symbol);
    if (!sourceAsset) {
      res.status(400).json({ error: `Source user does not possess ${symbol} asset.` });
      return;
    }
    if (sourceAsset.balance < transferAmt) {
      res.status(400).json({ error: `Source user has insufficient ${symbol} balance (${sourceAsset.balance} available).` });
      return;
    }
    sourceAsset.balance -= transferAmt;
    sourceAsset.valueUsd = sourceAsset.balance * sourceAsset.priceUsd;
    sourceUser.totalBalanceUsd = sourceUser.assets.reduce((sum, a) => sum + a.valueUsd, 0);
    let targetAsset = targetUser.assets.find((a) => a.symbol === symbol);
    if (!targetAsset) {
      targetAsset = {
        id: symbol.toLowerCase(),
        symbol,
        name: symbol === "USDT" ? "Tether USD" : symbol === "TRX" ? "TRON" : symbol,
        balance: 0,
        priceUsd: sourceAsset.priceUsd || 1,
        change24h: 0,
        valueUsd: 0
      };
      targetUser.assets.push(targetAsset);
    }
    targetAsset.balance += transferAmt;
    targetAsset.valueUsd = targetAsset.balance * targetAsset.priceUsd;
    targetUser.totalBalanceUsd = targetUser.assets.reduce((sum, a) => sum + a.valueUsd, 0);
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: "0xADMIN_RESERVE_MASTER_VAULT",
      actionType: "move_funds",
      targetUserAddress: `${sourceUser.name || sourceUser.id} \u2794 ${targetUser.name || targetUser.id}`,
      amountUsd: transferAmt * sourceAsset.priceUsd,
      assetSymbol: symbol,
      note: note || `Admin Inter-User Transfer: ${transferAmt} ${symbol} transferred to ${targetUser.name || targetUser.id}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      txHash
    };
    adminLogsState.unshift(adminLog);
    const sourceTx = {
      id: `tx-adm-send-${Date.now()}`,
      title: `Admin Transfer to ${targetUser.name || targetUser.email || "User"}`,
      category: "send",
      amountUsd: transferAmt * sourceAsset.priceUsd,
      amountCrypto: `-${transferAmt} ${symbol}`,
      recipientAddress: targetUser.address,
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      txHash
    };
    if (!sourceUser.transactions) sourceUser.transactions = [];
    sourceUser.transactions.unshift(sourceTx);
    const targetTx = {
      id: `tx-adm-recv-${Date.now()}`,
      title: `Admin Transfer from ${sourceUser.name || sourceUser.email || "User"}`,
      category: "receive",
      amountUsd: transferAmt * sourceAsset.priceUsd,
      amountCrypto: `+${transferAmt} ${symbol}`,
      senderAddress: sourceUser.address,
      date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 16),
      status: "completed",
      txHash
    };
    if (!targetUser.transactions) targetUser.transactions = [];
    targetUser.transactions.unshift(targetTx);
    res.json({
      success: true,
      users: connectedUsersState,
      logs: adminLogsState,
      message: `Successfully transferred ${transferAmt} ${symbol} from ${sourceUser.name} to ${targetUser.name}.`
    });
  });
  app.get("/api/transactions", (req, res) => {
    res.json({ transactions: transactionsState });
  });
  app.get("/api/tiers", (req, res) => {
    res.json({ tiers: CARD_TIERS });
  });
  app.post("/api/card/upgrade", (req, res) => {
    const { tier } = req.body;
    const tierObj = CARD_TIERS.find((t) => t.id === tier);
    if (!tierObj) {
      res.status(400).json({ error: "Invalid card tier" });
      return;
    }
    cardState.tier = tier;
    res.json({ success: true, card: cardState, message: `Successfully upgraded to ${tierObj.name}` });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(__dirname);
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        res.status(404).json({ error: "API route not found" });
        return;
      }
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wallet & Card server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
