import { CryptoCard, CardTier } from '../types';

interface UserForCard {
  id: string;
  name?: string;
  email?: string;
  address: string;
  cardTier?: CardTier;
  securityPin?: string;
}

// Generate deterministic unique card details per user
export function generateUserCard(user: UserForCard): CryptoCard {
  const userIdStr = user.id + (user.address || '');
  let hash = 0;
  for (let i = 0; i < userIdStr.length; i++) {
    hash = (hash << 5) - hash + userIdStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Generate 16-digit card number (starting with 4532 or 4921)
  const prefix = posHash % 2 === 0 ? '4532' : '4921';
  const middle = String(posHash).padStart(8, '7').slice(-8);
  const lastFour = String((posHash * 13) % 10000).padStart(4, '8');
  const cardNumber = `${prefix}${middle}${lastFour}`;

  // Generate unique expiry date (between 01/28 and 12/31)
  const month = String((posHash % 12) + 1).padStart(2, '0');
  const year = String(28 + (posHash % 4));
  const expiryDate = `${month}/${year}`;

  // Generate unique CVV (3 digits)
  const cvv = String((posHash % 900) + 100);

  // Generate unique ATM Card PIN (4 digits)
  const cardPin = String((posHash * 7 % 9000) + 1000);

  const cardHolderName = user.name && user.name.trim() ? user.name.trim() : 'Wallet & Card Member';

  return {
    id: `card-${user.id}`,
    cardNumber,
    cardHolder: cardHolderName.toUpperCase(),
    expiryDate,
    cvv,
    cardPin,
    tier: user.cardTier || 'black',
    spendingLimitMonthly: 15000,
    spentThisMonth: (posHash % 3000) + 250,
    isFrozen: false,
    contactlessEnabled: true,
    onlinePaymentsEnabled: true,
    atmWithdrawalsEnabled: true,
    autoTopupEnabled: true,
    autoTopupThreshold: 100,
    autoTopupAmount: 500,
    balanceUsd: 0,
  };
}
