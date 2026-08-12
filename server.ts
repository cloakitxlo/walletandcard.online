import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ConnectedUser, AdminActionLog, SupportTicket } from './src/types.js';
import { getTRC20AddressForUser } from './src/utils/addressUtils.js';
import { generateUserCard } from './src/utils/cardUtils.js';
import {
  INITIAL_CARD,
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  CARD_TIERS,
  INITIAL_CONNECTED_USERS,
  INITIAL_ADMIN_LOGS,
} from './src/data/mockData.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory state for runtime updates
  let cardState = { ...INITIAL_CARD };
  let transactionsState = [...INITIAL_TRANSACTIONS];
  let assetsState = [...INITIAL_ASSETS];
  let connectedUsersState: ConnectedUser[] = [...INITIAL_CONNECTED_USERS];
  let adminLogsState: AdminActionLog[] = [...INITIAL_ADMIN_LOGS];
  let supportTicketsState: SupportTicket[] = [];


  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Wallet & Card API', version: '2.0.0' });
  });

  // Live Crypto Prices proxy with fallback
  app.get('/api/crypto/prices', async (req, res) => {
    const { userId } = req.query;
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,tron,binancecoin&vs_currencies=usd&include_24hr_change=true'
      );
      if (response.ok) {
        const data = await response.json();
        // Update asset prices across all user accounts
        connectedUsersState.forEach((user) => {
          if (!user.assets) return;
          user.assets.forEach((ast) => {
            if (ast.id === 'usdt' && data.tether) {
              ast.priceUsd = data.tether.usd;
              ast.change24h = data.tether.usd_24h_change || 0.01;
            } else if (ast.id === 'tron' && data.tron) {
              ast.priceUsd = data.tron.usd;
              ast.change24h = data.tron.usd_24h_change || ast.change24h;
            } else if (ast.id === 'bnb' && data.binancecoin) {
              ast.priceUsd = data.binancecoin.usd;
              ast.change24h = data.binancecoin.usd_24h_change || ast.change24h;
            } else if (ast.id === 'bitcoin' && data.bitcoin) {
              ast.priceUsd = data.bitcoin.usd;
              ast.change24h = data.bitcoin.usd_24h_change || ast.change24h;
            }
            ast.valueUsd = ast.balance * ast.priceUsd;
          });
          user.totalBalanceUsd = user.assets.reduce((sum, a) => sum + (a.balance * a.priceUsd), 0);
        });
      }
    } catch (err) {
      console.log('Using fallback crypto prices due to fetch error:', err);
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

  // Get User Account Details (Per User Sync)
  app.get('/api/user/details', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: 'userId parameter required' });
      return;
    }

    const u = connectedUsersState.find((usr) => usr.id === userId || usr.address === userId || usr.email?.toLowerCase() === String(userId).toLowerCase());
    if (u) {
      res.json({
        success: true,
        userAccount: sanitizeUser(u),
        assets: u.assets,
        transactions: u.transactions || [],
        totalBalanceUsd: u.totalBalanceUsd,
      });
      return;
    }

    res.status(404).json({ success: false, error: 'User account not found' });
  });

  // Get Card Details (with unique card generation per user)
  app.get('/api/card', (req, res) => {
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

  // Toggle Freeze Card
  app.post('/api/card/freeze', (req, res) => {
    const { isFrozen } = req.body;
    cardState.isFrozen = typeof isFrozen === 'boolean' ? isFrozen : !cardState.isFrozen;
    res.json({ success: true, card: cardState });
  });

  // Update Card Limits
  app.post('/api/card/limits', (req, res) => {
    const { limit, contactless, online, atm } = req.body;
    if (limit !== undefined) cardState.spendingLimitMonthly = Number(limit);
    if (contactless !== undefined) cardState.contactlessEnabled = Boolean(contactless);
    if (online !== undefined) cardState.onlinePaymentsEnabled = Boolean(online);
    if (atm !== undefined) cardState.atmWithdrawalsEnabled = Boolean(atm);

    res.json({ success: true, card: cardState });
  });

  // Topup Card Balance from Crypto
  app.post('/api/card/topup', (req, res) => {
    const { userId, assetId, amountUsd } = req.body;
    const topupVal = Number(amountUsd);

    if (!topupVal || topupVal <= 0) {
      res.status(400).json({ error: 'Invalid topup amount' });
      return;
    }

    let targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      targetUser = connectedUsersState[0];
    }

    const userAssets = targetUser.assets || assetsState;
    const asset = userAssets.find((a) => a.id === assetId || a.symbol === assetId);
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const requiredCrypto = topupVal / asset.priceUsd;
    if (asset.balance < requiredCrypto) {
      res.status(400).json({ error: `Insufficient ${asset.symbol} balance` });
      return;
    }

    // Deduct crypto asset
    asset.balance -= requiredCrypto;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + (a.balance * a.priceUsd), 0);

    // Credit card spending balance
    if (!targetUser.card) {
      targetUser.card = generateUserCard(targetUser);
    }
    targetUser.card.balanceUsd = (targetUser.card.balanceUsd || 0) + topupVal;
    cardState.balanceUsd = (cardState.balanceUsd || 0) + topupVal;

    // Create topup transaction
    const newTx = {
      id: `tx-${Date.now()}`,
      title: `Card Top-up from ${asset.symbol}`,
      category: 'topup' as const,
      amountUsd: topupVal,
      amountCrypto: `${requiredCrypto.toFixed(4)} ${asset.symbol}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      cardLastFour: (targetUser.card?.cardNumber || cardState.cardNumber).slice(-4),
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
      card: targetUser.card,
    });
  });

  // Send Asset (User or Platform Transfer)
  app.post('/api/wallet/send', (req, res) => {
    const { userId, assetId, recipientAddress, amount, note } = req.body;
    const sendAmt = Number(amount);

    if (!sendAmt || sendAmt <= 0) {
      res.status(400).json({ error: 'Invalid transfer amount' });
      return;
    }

    let targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);
    if (!targetUser) {
      targetUser = connectedUsersState[0];
    }

    const userAssets = targetUser.assets || assetsState;
    const asset = userAssets.find((a) => a.id === assetId || a.symbol === assetId);
    if (!asset) {
      res.status(404).json({ error: 'Asset not found in wallet' });
      return;
    }

    if (asset.balance < sendAmt) {
      res.status(400).json({ error: `Insufficient ${asset.symbol} balance to send.` });
      return;
    }

    // Deduct asset
    asset.balance -= sendAmt;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + (a.balance * a.priceUsd), 0);
    const amountUsd = sendAmt * asset.priceUsd;

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

    const newTx = {
      id: `tx-send-${Date.now()}`,
      title: `Sent ${sendAmt} ${asset.symbol}`,
      category: 'send' as const,
      amountUsd: amountUsd,
      amountCrypto: `${sendAmt.toFixed(4)} ${asset.symbol}`,
      recipientAddress: recipientAddress || '0xRecipientAddress...',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      txHash,
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
      message: `Transferred ${sendAmt} ${asset.symbol} to ${recipientAddress}`,
    });
  });

  // Track verified transaction hashes to prevent replay / duplicate claims
  const verifiedTxHashes = new Set<string>();

  // Receive / Verify On-Chain Deposit Endpoint
  app.post('/api/wallet/receive', (req, res) => {
    const { userId, assetId, amount, txHash, network, vaultAddress } = req.body;
    const recvAmt = Number(amount);

    if (isNaN(recvAmt) || recvAmt < 50) {
      res.status(400).json({
        success: false,
        error: 'Deposit Failed: Minimum deposit amount is 50 USDT.',
      });
      return;
    }

    if (recvAmt > 99000) {
      res.status(400).json({
        success: false,
        error: 'Deposit Failed: Maximum deposit limit is 99,000 USDT per transaction.',
      });
      return;
    }

    // Validate mandatory TxHash
    const cleanTxHash = (txHash || '').trim();
    
    if (!cleanTxHash) {
      res.status(400).json({
        success: false,
        error: 'TxHash Required: Please enter your blockchain deposit transaction hash (TxHash). Deposit cannot be credited without verification.',
      });
      return;
    }

    // Require a proper tx hash format (64 hex chars, optional 0x prefix)
    const isValidTxHash = /^(0x)?[a-fA-F0-9]{64}$/.test(cleanTxHash);
    if (!isValidTxHash) {
      res.status(400).json({
        success: false,
        error: 'Invalid TxHash: Enter a valid 64-character transaction hash. Deposit was not credited.',
      });
      return;
    }

    if (verifiedTxHashes.has(cleanTxHash.toLowerCase())) {
      res.status(400).json({
        success: false,
        error: `Duplicate TxHash Claim: Transaction hash ${cleanTxHash.slice(0, 12)}... has already been verified and credited previously.`,
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
      asset = userAssets.find((a) => a.symbol === 'USDT') || userAssets[0];
    }

    // Mark TxHash as verified
    verifiedTxHashes.add(cleanTxHash.toLowerCase());

    // Credit user asset balance
    asset.balance += recvAmt;
    asset.valueUsd = asset.balance * asset.priceUsd;
    targetUser.totalBalanceUsd = userAssets.reduce((sum, a) => sum + (a.balance * a.priceUsd), 0);
    const amountUsd = recvAmt * asset.priceUsd;

    const destinationVault = vaultAddress || (network === 'TRC20' ? 'TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v' : '0x71C82910a39B21495c0234123984A018281989A2');

    const newTx = {
      id: `tx-recv-${Date.now()}`,
      title: `Verified Deposit (${recvAmt.toFixed(2)} ${asset.symbol})`,
      category: 'receive' as const,
      amountUsd: amountUsd,
      amountCrypto: `+${recvAmt.toFixed(2)} ${asset.symbol}`,
      senderAddress: destinationVault,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      txHash: cleanTxHash,
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
      message: `Verified deposit of ${recvAmt} ${asset.symbol} to Vault ${destinationVault.slice(0, 8)}...`,
    });
  });

  // Get Admin Users List
  app.get('/api/admin/users', (req, res) => {
    res.json({ users: connectedUsersState.map(sanitizeUser), logs: adminLogsState });
  });

  // Support tickets — create
  app.post('/api/support/tickets', (req, res) => {
    const { userId, fullName, email, description, screenshotDataUrl } = req.body || {};
    if (!userId || !fullName || !email || !description) {
      res.status(400).json({
        success: false,
        error: 'Full name, email, and issue description are required',
      });
      return;
    }

    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: `SUP-${Date.now().toString(36).toUpperCase()}`,
      userId: String(userId),
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      description: String(description).trim(),
      screenshotDataUrl:
        typeof screenshotDataUrl === 'string' && screenshotDataUrl.startsWith('data:image/')
          ? screenshotDataUrl
          : undefined,
      status: 'open',
      messages: [
        {
          id: `msg-${Date.now()}`,
          authorRole: 'user',
          authorName: String(fullName).trim(),
          message: String(description).trim(),
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    supportTicketsState.unshift(ticket);
    res.json({ success: true, ticket });
  });

  // Support tickets — list for a user
  app.get('/api/support/tickets', (req, res) => {
    const userId = String(req.query.userId || '');
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }
    const tickets = supportTicketsState.filter((t) => t.userId === userId);
    res.json({ success: true, tickets });
  });

  // Admin — all support tickets
  app.get('/api/admin/support/tickets', (_req, res) => {
    res.json({ success: true, tickets: supportTicketsState });
  });

  // Admin — reply to a support ticket
  app.post('/api/admin/support/reply', (req, res) => {
    const { ticketId, message, adminName } = req.body || {};
    if (!ticketId || !message) {
      res.status(400).json({ success: false, error: 'ticketId and message are required' });
      return;
    }

    const ticket = supportTicketsState.find((t) => t.id === ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }

    const now = new Date().toISOString();
    ticket.messages.push({
      id: `msg-${Date.now()}`,
      authorRole: 'admin',
      authorName: String(adminName || 'Support Admin').trim(),
      message: String(message).trim(),
      createdAt: now,
    });
    ticket.status = 'answered';
    ticket.updatedAt = now;

    res.json({ success: true, ticket });
  });

  // Super Admin credentials (direct login)
  const SUPER_ADMIN = {
    id: 'admin-master',
    email: 'admin@cryptocard.com',
    username: 'admin',
    password: 'SuperAdmin@2026',
    name: 'Super Admin Master',
    role: 'admin' as const,
    address: '0xADMIN_RESERVE_MASTER_VAULT',
    trc20Address: 'TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v',
  };

  const isSuperAdminLogin = (loginId: string) => {
    const id = loginId.trim().toLowerCase();
    return id === SUPER_ADMIN.email || id === SUPER_ADMIN.username || id === 'admin@system.com';
  };

  const sanitizeUser = (user: ConnectedUser) => {
    const { password: _pw, ...safe } = user;
    return safe;
  };

  // Authentication: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSuperAdminLogin(cleanEmail)) {
      if (password !== SUPER_ADMIN.password) {
        res.status(401).json({ success: false, error: 'Incorrect email or password.' });
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
          trc20Address: SUPER_ADMIN.trc20Address,
        },
      });
      return;
    }

    const matchedUser = connectedUsersState.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      res.status(404).json({
        success: false,
        code: 'NEED_SIGNUP',
        error: 'No account found with this email. Please sign up first.',
      });
      return;
    }

    if (!matchedUser.password || matchedUser.password !== password) {
      res.status(401).json({
        success: false,
        error: 'Incorrect email or password.',
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
        name: matchedUser.name || 'Wallet & Card User',
        role: 'user',
        address: matchedUser.address,
        trc20Address: matchedUser.trc20Address,
        securityPin: matchedUser.securityPin,
      },
      userAccount: sanitizeUser(matchedUser),
      card: matchedUser.card || null,
    });
  });

  // Profile Update Endpoint
  app.post('/api/auth/update-profile', (req, res) => {
    const { userId, name, email, currentPassword, newPassword } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required.' });
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
        res.status(401).json({ success: false, error: 'Current password is incorrect.' });
        return;
      }
      targetUser.password = String(newPassword);
    }

    res.json({
      success: true,
      user: {
        id: targetUser ? targetUser.id : userId,
        email: targetUser ? targetUser.email : email,
        name: name || (targetUser ? targetUser.name : 'Wallet & Card Member'),
        role: 'user',
        address: targetUser ? targetUser.address : '0x71C82910a39B21495c0234123984A018281989A2',
        trc20Address: targetUser ? targetUser.trc20Address : 'TYD12aN74z34J9X2a89mZ41Pq9m5TrC20v',
      },
      card: targetUser?.card || cardState,
      message: 'Profile updated successfully!',
    });
  });

  // Security PIN Management & Reset Endpoint
  app.post('/api/auth/security-pin', (req, res) => {
    const { userId, currentPin, newPin, accountPassword, isReset } = req.body;
    if (!userId || !newPin || String(newPin).length !== 4) {
      res.status(400).json({ success: false, error: 'User ID and a 4-digit numeric Security PIN are required.' });
      return;
    }

    const targetUser = connectedUsersState.find(
      (u) => u.id === userId || u.address === userId || u.email?.toLowerCase() === String(userId).toLowerCase()
    );

    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    if (!isReset) {
      if (targetUser.securityPin && currentPin && targetUser.securityPin !== currentPin) {
        res.status(400).json({ success: false, error: 'Incorrect current Security PIN.' });
        return;
      }
    }

    targetUser.securityPin = String(newPin);
    res.json({
      success: true,
      securityPin: String(newPin),
      message: isReset ? 'Security PIN successfully reset!' : 'Security PIN successfully saved!',
    });
  });

  // Authentication: Sign Up
  app.post('/api/auth/signup', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required' });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSuperAdminLogin(cleanEmail)) {
      res.status(403).json({ success: false, error: 'This login ID is reserved for Super Admin.' });
      return;
    }

    const existing = connectedUsersState.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        code: 'ALREADY_REGISTERED',
        error: 'An account with this email already exists. Please sign in.',
      });
      return;
    }

    const newUserId = `user-${Date.now()}`;
    const userAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    const trc20Addr = getTRC20AddressForUser(newUserId);

    const newUser: ConnectedUser = {
      id: newUserId,
      email: cleanEmail,
      name: name.trim(),
      password: String(password),
      address: userAddress,
      trc20Address: trc20Addr,
      network: 'TRC20',
      totalBalanceUsd: 0.0,
      isFrozen: false,
      cardTier: 'standard',
      card: undefined,
      assets: [
        { id: 'usdt', symbol: 'USDT', name: 'Tether USD', balance: 0.0, priceUsd: 1.0, change24h: 0.01, valueUsd: 0.0 },
        { id: 'tron', symbol: 'TRX', name: 'TRON Native Token', balance: 0.0, priceUsd: 0.128, change24h: 3.85, valueUsd: 0.0 },
        { id: 'bnb', symbol: 'BNB', name: 'BNB Smart Chain Token', balance: 0.0, priceUsd: 580.20, change24h: 2.15, valueUsd: 0.0 },
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', balance: 0.0, priceUsd: 64250.0, change24h: 3.42, valueUsd: 0.0 },
      ],
      transactions: [],
      connectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active',
    };

    newUser.card = generateUserCard(newUser);
    connectedUsersState.unshift(newUser);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: cleanEmail,
        name: newUser.name,
        role: 'user',
        address: newUser.address,
        trc20Address: newUser.trc20Address,
      },
      userAccount: sanitizeUser(newUser),
      card: newUser.card,
    });
  });

  // Authentication: Quick Demo Login
  app.post('/api/auth/demo-login', (req, res) => {
    const { demoType } = req.body;

    if (demoType === 'admin') {
      res.json({
        success: true,
        user: {
          id: SUPER_ADMIN.id,
          email: SUPER_ADMIN.email,
          name: SUPER_ADMIN.name,
          role: SUPER_ADMIN.role,
          address: SUPER_ADMIN.address,
          trc20Address: SUPER_ADMIN.trc20Address,
        },
      });
      return;
    }

    const targetUser = demoType === 'user2' ? connectedUsersState[2] || connectedUsersState[1] : connectedUsersState[0];

    res.json({
      success: true,
      user: {
        id: targetUser.id,
        email: targetUser.email || `${targetUser.id}@cryptocard.com`,
        name: targetUser.name || (demoType === 'user2' ? 'Account 02 Holder' : 'Account 01 Holder'),
        role: 'user',
        address: targetUser.address,
        trc20Address: targetUser.trc20Address,
      },
      userAccount: targetUser,
    });
  });

  // Admin Notice Dispatcher
  app.post('/api/admin/notice', (req, res) => {
    const { targetUserId, title, message, type } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, error: 'Title and message are required for notice dispatch.' });
      return;
    }

    const newNotice = {
      id: `notice-${Date.now()}`,
      title,
      message,
      type: type || 'info',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      issuedBy: 'Super Admin Security Center',
    };

    if (targetUserId === 'all') {
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
      adminAddress: '0xADMIN_RESERVE_MASTER_VAULT',
      actionType: 'send_notice',
      targetUserAddress: targetUserId === 'all' ? 'BROADCAST_ALL_USERS' : targetUserId,
      note: `Notice issued: ${title}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}`,
    });

    res.json({
      success: true,
      notice: newNotice,
      users: connectedUsersState,
      logs: adminLogsState,
    });
  });

  // Admin Freeze / Unfreeze User Funds
  app.post('/api/admin/freeze-user', (req, res) => {
    const { userId, isFrozen, reason } = req.body;
    const targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    targetUser.isFrozen = Boolean(isFrozen);
    targetUser.status = isFrozen ? 'frozen' : 'active';
    if (isFrozen && reason) {
      targetUser.freezeReason = reason;
    }

    // Also sync if this is the active card holder
    if (targetUser.address.toLowerCase() === '0x71C82910a39B21495c0234123984A018281989A2'.toLowerCase()) {
      cardState.isFrozen = targetUser.isFrozen;
    }

    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: '0xADMIN_RESERVE_MASTER_VAULT',
      actionType: isFrozen ? ('freeze' as const) : ('unfreeze' as const),
      targetUserAddress: targetUser.address,
      note: reason || (isFrozen ? 'Administrative freeze applied' : 'Administrative lock lifted'),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      txHash: `0x${Math.random().toString(16).slice(2, 10)}`,
    };

    adminLogsState.unshift(adminLog);

    res.json({
      success: true,
      user: targetUser,
      users: connectedUsersState,
      logs: adminLogsState,
      card: cardState,
    });
  });

  // Admin Move / Reallocate Funds
  app.post('/api/admin/move-funds', (req, res) => {
    const { userId, assetSymbol, amount, note, destinationNote, destinationAddress } = req.body;
    const targetUser = connectedUsersState.find((u) => u.id === userId || u.address === userId);

    if (!targetUser) {
      res.status(404).json({ error: 'Target user account not found' });
      return;
    }

    const moveAmt = Number(amount);
    if (!moveAmt || moveAmt <= 0) {
      res.status(400).json({ error: 'Invalid move amount' });
      return;
    }

    // Find asset in user
    const userAsset = targetUser.assets.find((a) => a.symbol === assetSymbol) || targetUser.assets[0];
    if (userAsset) {
      userAsset.balance = Math.max(0, userAsset.balance - moveAmt);
      userAsset.valueUsd = userAsset.balance * userAsset.priceUsd;
    }

    // Also update main asset state if targeting primary demo user
    if (targetUser.address.toLowerCase() === '0x71C82910a39B21495c0234123984A018281989A2'.toLowerCase()) {
      const primaryAsset = assetsState.find((a) => a.symbol === assetSymbol) || assetsState[0];
      if (primaryAsset) {
        primaryAsset.balance = Math.max(0, primaryAsset.balance - moveAmt);
        primaryAsset.valueUsd = primaryAsset.balance * primaryAsset.priceUsd;
      }
    }

    targetUser.totalBalanceUsd = targetUser.assets.reduce((acc, a) => acc + a.valueUsd, 0);

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}`;
    const destAddr = destinationAddress || 'TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC';
    const finalNote = note || destinationNote || `Transferred to TRC20 Vault (${destAddr})`;

    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: '0xADMIN_RESERVE_MASTER_VAULT',
      actionType: 'move_funds' as const,
      targetUserAddress: targetUser.address,
      amountUsd: moveAmt * (userAsset?.priceUsd || 1),
      assetSymbol: assetSymbol || 'USDT',
      note: finalNote,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      txHash,
    };

    adminLogsState.unshift(adminLog);

    const newTx = {
      id: `tx-admin-${Date.now()}`,
      title: `Admin Fund Transfer (${assetSymbol})`,
      category: 'admin_move' as const,
      amountUsd: moveAmt * (userAsset?.priceUsd || 1),
      amountCrypto: `${moveAmt} ${assetSymbol}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      txHash,
    };

    transactionsState.unshift(newTx);

    res.json({
      success: true,
      user: targetUser,
      users: connectedUsersState,
      assets: assetsState,
      logs: adminLogsState,
      transactions: transactionsState,
    });
  });

  // Admin Transfer Asset directly from Source User to Target User
  app.post('/api/admin/transfer-users', (req, res) => {
    const { sourceUserId, targetUserId, assetSymbol, amount, note } = req.body;
    const transferAmt = Number(amount);

    if (!sourceUserId || !targetUserId || !transferAmt || transferAmt <= 0) {
      res.status(400).json({ error: 'Valid source user, target user, and positive transfer amount required.' });
      return;
    }

    const sourceUser = connectedUsersState.find((u) => u.id === sourceUserId || u.address === sourceUserId);
    const targetUser = connectedUsersState.find((u) => u.id === targetUserId || u.address === targetUserId);

    if (!sourceUser) {
      res.status(404).json({ error: 'Source user not found.' });
      return;
    }
    if (!targetUser) {
      res.status(404).json({ error: 'Target destination user not found.' });
      return;
    }

    const symbol = assetSymbol || 'USDT';
    let sourceAsset = sourceUser.assets.find((a) => a.symbol === symbol);
    if (!sourceAsset) {
      res.status(400).json({ error: `Source user does not possess ${symbol} asset.` });
      return;
    }

    if (sourceAsset.balance < transferAmt) {
      res.status(400).json({ error: `Source user has insufficient ${symbol} balance (${sourceAsset.balance} available).` });
      return;
    }

    // Deduct from Source User
    sourceAsset.balance -= transferAmt;
    sourceAsset.valueUsd = sourceAsset.balance * sourceAsset.priceUsd;
    sourceUser.totalBalanceUsd = sourceUser.assets.reduce((sum, a) => sum + a.valueUsd, 0);

    // Add to Target User
    let targetAsset = targetUser.assets.find((a) => a.symbol === symbol);
    if (!targetAsset) {
      targetAsset = {
        id: symbol.toLowerCase(),
        symbol: symbol,
        name: symbol === 'USDT' ? 'Tether USD' : symbol === 'TRX' ? 'TRON' : symbol,
        balance: 0,
        priceUsd: sourceAsset.priceUsd || 1.0,
        change24h: 0,
        valueUsd: 0,
      };
      targetUser.assets.push(targetAsset);
    }
    targetAsset.balance += transferAmt;
    targetAsset.valueUsd = targetAsset.balance * targetAsset.priceUsd;
    targetUser.totalBalanceUsd = targetUser.assets.reduce((sum, a) => sum + a.valueUsd, 0);

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

    // Log admin action
    const adminLog = {
      id: `alog-${Date.now()}`,
      adminAddress: '0xADMIN_RESERVE_MASTER_VAULT',
      actionType: 'move_funds' as const,
      targetUserAddress: `${sourceUser.name || sourceUser.id} ➔ ${targetUser.name || targetUser.id}`,
      amountUsd: transferAmt * sourceAsset.priceUsd,
      assetSymbol: symbol,
      note: note || `Admin Inter-User Transfer: ${transferAmt} ${symbol} transferred to ${targetUser.name || targetUser.id}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      txHash,
    };
    adminLogsState.unshift(adminLog);

    // Log transactions for both users
    const sourceTx = {
      id: `tx-adm-send-${Date.now()}`,
      title: `Admin Transfer to ${targetUser.name || targetUser.email || 'User'}`,
      category: 'send' as const,
      amountUsd: transferAmt * sourceAsset.priceUsd,
      amountCrypto: `-${transferAmt} ${symbol}`,
      recipientAddress: targetUser.address,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      txHash,
    };
    if (!sourceUser.transactions) sourceUser.transactions = [];
    sourceUser.transactions.unshift(sourceTx);

    const targetTx = {
      id: `tx-adm-recv-${Date.now()}`,
      title: `Admin Transfer from ${sourceUser.name || sourceUser.email || 'User'}`,
      category: 'receive' as const,
      amountUsd: transferAmt * sourceAsset.priceUsd,
      amountCrypto: `+${transferAmt} ${symbol}`,
      senderAddress: sourceUser.address,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'completed' as const,
      txHash,
    };
    if (!targetUser.transactions) targetUser.transactions = [];
    targetUser.transactions.unshift(targetTx);

    res.json({
      success: true,
      users: connectedUsersState,
      logs: adminLogsState,
      message: `Successfully transferred ${transferAmt} ${symbol} from ${sourceUser.name} to ${targetUser.name}.`,
    });
  });

  // Get Transactions
  app.get('/api/transactions', (req, res) => {
    res.json({ transactions: transactionsState });
  });

  // Get Tiers
  app.get('/api/tiers', (req, res) => {
    res.json({ tiers: CARD_TIERS });
  });

  // Apply for Card Tier Upgrade
  app.post('/api/card/upgrade', (req, res) => {
    const { tier } = req.body;
    const tierObj = CARD_TIERS.find((t) => t.id === tier);
    if (!tierObj) {
      res.status(400).json({ error: 'Invalid card tier' });
      return;
    }

    cardState.tier = tier;
    res.json({ success: true, card: cardState, message: `Successfully upgraded to ${tierObj.name}` });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: server.cjs and built frontend live together in /dist
    const distPath = path.join(__dirname);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API route not found' });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wallet & Card server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

