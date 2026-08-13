export type CardTier = 'standard' | 'gold' | 'platinum' | 'black';

export interface CryptoCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardPin?: string;
  securityPin?: string;
  tier: CardTier;
  isFrozen: boolean;
  spendingLimitMonthly: number;
  spentThisMonth: number;
  contactlessEnabled: boolean;
  onlinePaymentsEnabled: boolean;
  atmWithdrawalsEnabled: boolean;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  balanceUsd?: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  iconUrl?: string;
  valueUsd: number;
}

export interface Transaction {
  id: string;
  title: string;
  merchantName?: string;
  category: 'purchase' | 'topup' | 'swap' | 'reward' | 'withdrawal' | 'send' | 'receive' | 'admin_move';
  amountUsd: number;
  amountCrypto?: string;
  recipientAddress?: string;
  senderAddress?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'frozen';
  cashbackEarnedUsd?: number;
  cardLastFour?: string;
  iconName?: string;
  txHash?: string;
}

export interface TierInfo {
  id: CardTier;
  name: string;
  colorGradient: string;
  cardImageBg: string;
  cashbackPercent: number;
  stakingRequired: number; // in APEX tokens
  atmLimitMonthly: number;
  perks: string[];
  popular?: boolean;
}

export interface SecurityLog {
  id: string;
  event: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'success' | 'warning';
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  createdAt: string;
  issuedBy: string;
}

export interface ConnectedUser {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  address: string;
  trc20Address?: string;
  network: string;
  totalBalanceUsd: number;
  isFrozen: boolean;
  freezeReason?: string;
  cardTier: CardTier;
  card?: CryptoCard;
  securityPin?: string;
  assets: CryptoAsset[];
  transactions?: Transaction[];
  connectedAt: string;
  status: 'active' | 'frozen' | 'restricted';
  notices?: Notice[];
}

export interface AdminActionLog {
  id: string;
  adminAddress: string;
  actionType: 'freeze' | 'unfreeze' | 'move_funds' | 'dispatch_funds' | 'limit_change' | 'send_notice';
  targetUserAddress: string;
  amountUsd?: number;
  assetSymbol?: string;
  note: string;
  timestamp: string;
  txHash?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  address: string;
  trc20Address?: string;
  securityPin?: string;
}

export interface SupportMessage {
  id: string;
  authorRole: 'user' | 'admin';
  authorName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  description: string;
  screenshotDataUrl?: string;
  status: 'open' | 'answered' | 'closed';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}


