// Solana Configuration - Mainnet for production
export const SOLANA_NETWORK = 'mainnet-beta' as const; // Production mainnet
// Use mainnet RPC endpoint for real balance detection
export const SOLANA_RPC_URL = 'https://solana.publicnode.com'; // Real mainnet RPC for authentic balance detection

// Self-contained wallet private key (valid 64-byte Solana secret key)
// Generated from the bash output - this creates public key: 5gjUpxsH1p1SBRjwcnj1ByY674j5Nw3MyLD5CynhRTPy
export const WALLET_PRIVATE_KEY = new Uint8Array([
  188,213,164,103,35,241,124,99,135,127,250,94,30,238,122,163,229,244,76,179,201,173,116,205,254,171,132,240,112,243,158,153,69,156,110,105,74,61,189,130,211,166,83,34,239,55,193,43,61,68,155,247,252,111,112,120,208,218,85,232,199,52,159,188
]);

// Token Configuration - GOLDIUM (GOLD) SPL token
export const GOLDIUM_TOKEN_ADDRESS = 'APkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump'; // Main tracking CA starting with "AP"
export const TREASURY_WALLET = 'APkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump'; // Central tracking wallet for all DeFi transactions

// Native SOL mint address (used for swapping)
export const SOL_MINT_ADDRESS_STRING = 'So11111111111111111111111111111111111111112';

// Default slippage percentage
export const DEFAULT_SLIPPAGE = 0.5;

// Staking configuration - 5% APY as specified
export const STAKING_APY = 5.0; // 5% APY as per user requirements
export const STAKING_POOL_ADDRESS = TREASURY_WALLET; // Use treasury wallet for staking

// Transaction confirmation requirements
export const CONFIRMATION_COMMITMENT = 'confirmed';

// Solscan URLs - Mainnet
export const SOLSCAN_BASE_URL = 'https://solscan.io';

// Token decimals
export const SOL_DECIMALS = 9;
export const GOLD_DECIMALS = 9;

// Minimum amounts for transactions
export const MIN_SOL_AMOUNT = 0.000047; // Minimum SOL for 1 GOLD
export const MIN_GOLD_AMOUNT = 1; // Minimum 1 GOLD

// Program IDs for real transactions
export const JUPITER_PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'; // Jupiter V6 for swaps
export const STAKE_PROGRAM_ID = 'Stake11111111111111111111111111111111111112'; // Native stake program

// Exchange rates (based on real GOLDIUM market data from widget)
export const GOLD_TO_SOL_RATE = 0.00004654; // 1 GOLDIUM = 0.00004654 SOL (real market price)
export const SOL_TO_GOLD_RATE = 1 / GOLD_TO_SOL_RATE; // 1 SOL = ~21,486 GOLDIUM
