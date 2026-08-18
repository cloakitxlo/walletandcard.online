---
name: popup
description: >-
  Wire the saved First Transaction Hold popup for Wallet & Card. Use when the
  user says "popup setup", "popup live", "wo popup laga do", "popup live krdo",
  or asks to enable/mount the VerifyHoldPopup. Do NOT enable until explicitly asked.
---

# First Transaction Hold Popup (THIS project only)

## Hard isolation

- Work **only** in this workspace (`wallet-and-card`).
- Do **not** open, edit, commit, push, or deploy `/Users/altmash/Projects/robin-card`.
- Do **not** touch GitHub `cloakitxlo/rob-car` or `cloakitxlo/robin-card`.
- Do **not** change colors, fonts, landing/auth copy, or overall design. Reuse this project's existing modal/button classes.

## Current state (default)

- Popup component exists at: `src/popups/FirstTransactionHold/VerifyHoldPopup.tsx`
- It is **NOT** imported or mounted anywhere.
- Live **Verify & Credit Deposit** must **credit** the wallet (normal success flow).
- Min deposit is **11 USDT** (client + server). Invalid/missing 64-char TxHash = error, no credit.

## Triggers (enable popup)

When the user says any of:

- `popup setup`
- `popup live`
- `wo popup laga do`
- `popup live krdo`

…implement the LIVE flow below. Until then, leave the popup unmounted.

## LIVE flow (only after explicit ask)

1. **Who sees it**
   - Only users who submitted a valid **≥ 11 USDT** amount + valid **64-char TxHash** and clicked **Verify & Credit Deposit**.
   - After that click: **DO NOT credit** the deposit. Show `VerifyHoldPopup` immediately.
   - Lock `firstTransactionHold` on that user profile on the server via `POST /api/wallet/lock-first-hold`.
   - Reload, Log out, or login in another browser: this user still sees the same popup (account-level, not only localStorage).
   - New users / never deposited / never reached this click: keep normal credit flow.
   - **Admin never** sees this popup.

2. **Wire UI**
   - Import `VerifyHoldPopup` from `src/popups/FirstTransactionHold/VerifyHoldPopup.tsx`.
   - Mount it when the current user has `firstTransactionHold === true` (from session restore / user details / receive response).
   - In receive handler: if hold should trigger, skip credit UI success; show popup; call lock endpoint.
   - Popup is blocking: no close button, no backdrop close, no Escape.

3. **Server**
   - Add/persist `firstTransactionHold` on the user record.
   - `POST /api/wallet/lock-first-hold` with `{ userId }` sets the flag permanently for that account.
   - On auth/login and `/api/user/details`, return the flag so the client can re-show the popup.
   - Do **not** credit when locking / showing hold for that first verify click.

4. **Copy (keep exact)**

- Title label: `First transaction hold`
- Heading: `Your card is on hold to verify your first transaction.`
- Body: `Please call this number to verify your deposit and activate your card.`
- Button: `Call Now: +1-866-557-3615`
- Hint: `Click the above button to call and verify your deposit and card.`
- tel: `tel:+18665573615`

5. **Git / Railway**

- Commit/push only if the user asks, and only to **this** project's remote.
- Never push to `cloakitxlo/rob-car` or robin-card.
