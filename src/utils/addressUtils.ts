// Unique TRC20 address generator per user
export function getTRC20AddressForUser(userIdOrAddress?: string): string {
  // Always return the single static TRC20 deposit address as required
  return 'TEYgjP8nFzAbSX1qnH8iDVBd6UsZTpDnqC';
}

export function getBEP20AddressForUser(userIdOrAddress: string): string {
  if (userIdOrAddress.startsWith('0x') && userIdOrAddress.length === 42) {
    return userIdOrAddress;
  }
  return '0x71C82910a39B21495c0234123984A018281989A2';
}

export function getBTCAddressForUser(userIdOrAddress: string): string {
  return 'bc1q9x2a89mz41pq9m5trc20v38a1t8z34j';
}
