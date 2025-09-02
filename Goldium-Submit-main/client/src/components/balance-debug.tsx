import { useExternalWallets } from '@/hooks/use-external-wallets';
import { useExternalWalletBalances } from '@/hooks/use-external-wallet-balances';

export function BalanceDebug() {
  const wallet = useExternalWallets();
  const { data: balances } = useExternalWalletBalances();
  
  return (
    <div className="p-4 bg-gray-800 text-white text-xs font-mono">
      <h3 className="font-bold mb-2">Balance Debug Info:</h3>
      <div>Wallet Connected: {wallet.connected ? 'YES' : 'NO'}</div>
      <div>Selected Wallet: {wallet.selectedWallet || 'NONE'}</div>
      <div>Wallet Balance: {wallet.balance}</div>
      <div>Public Key: {wallet.publicKey?.toString() || 'NONE'}</div>
      <div>Address: {wallet.address || 'NONE'}</div>
      <div>Balances SOL: {balances?.sol || 0}</div>
      <div>Connecting: {wallet.connecting ? 'YES' : 'NO'}</div>
    </div>
  );
}