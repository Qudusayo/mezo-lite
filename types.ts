// Types
export interface TokenBalance {
  formatted: string;
  symbol: string;
  raw: string;
}

// Transaction type shared across app
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  isReceiving: boolean;
  tokenInfo: {
    decimals: number;
    symbol: string;
    name: string;
  };
}

export interface GlobalContextType {
  // Token Balance State
  balance: TokenBalance | null;
  balanceLoading: boolean;
  balanceError: string | null;

  // Wallet State (auto-extracted from Dynamic)
  walletAddress: string | null;
  tokenAddress: string;
  rpcUrl: string;

  // Dynamic Wallet State
  isConnected: boolean;
  user: any;

  // Actions
  setTokenAddress: (address: string) => void;
  setRpcUrl: (url: string) => void;
  refreshBalance: () => Promise<void>;
  clearBalance: () => void;
  retryBalance: () => Promise<void>;

  // Transaction refresh trigger
  transactionRefreshTrigger: number;
  triggerTransactionRefresh: () => void;

  // Transactions State
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsRefreshing: boolean;
  transactionsError: string | null;
  refreshTransactions: (isRefresh?: boolean) => Promise<void>;
}
