import { MultiWalletProvider } from './multi-wallet-provider';
import { ReactNode } from 'react';

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <MultiWalletProvider>
      {children}
    </MultiWalletProvider>
  );
}
