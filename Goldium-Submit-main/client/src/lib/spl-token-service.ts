import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token';
import { SOLANA_RPC_URL, GOLDIUM_TOKEN_ADDRESS } from './constants';

// SPL Token service for real balance detection
export class SPLTokenService {
  private connection: Connection;
  
  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  // Get SPL token balance for a specific token mint and wallet
  async getTokenBalance(walletPublicKey: PublicKey, mintAddress: string): Promise<number> {
    try {
      if (mintAddress === '[INSERT_GOLDIUM_CA_HERE]') {
        // GOLD token mint not configured yet
        return 0;
      }

      const mintPublicKey = new PublicKey(mintAddress);
      
      // Get associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        walletPublicKey
      );

      // Get token account info
      const tokenAccount = await getAccount(
        this.connection,
        associatedTokenAddress
      );

      // Return balance with proper decimal conversion
      const balance = Number(tokenAccount.amount) / Math.pow(10, 9); // Assuming 9 decimals
      return balance;
      
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        // No token account exists for this mint/wallet combination
        return 0;
      }
      
      console.error(`Error fetching token balance for ${mintAddress}:`, error);
      return 0;
    }
  }

  // Get GOLD token balance specifically
  async getGoldBalance(walletPublicKey: PublicKey): Promise<number> {
    return this.getTokenBalance(walletPublicKey, GOLDIUM_TOKEN_ADDRESS);
  }

  // Check if wallet has any SPL tokens
  async getAllTokenBalances(walletPublicKey: PublicKey): Promise<{ mint: string; balance: number }[]> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(accountInfo => ({
        mint: accountInfo.account.data.parsed.info.mint,
        balance: accountInfo.account.data.parsed.info.tokenAmount.uiAmount || 0
      })).filter(token => token.balance > 0);
      
    } catch (error) {
      console.error('Error fetching all token balances:', error);
      return [];
    }
  }
}

// Export singleton instance
export const splTokenService = new SPLTokenService();