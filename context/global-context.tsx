import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode
} from 'react';
import { ethers } from 'ethers';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from '../utils/config';
import { mezoApi } from '../utils/api';
import { makeAuthenticatedRequest, getSessionToken } from '../services/auth';
import { GlobalContextType, TokenBalance, Transaction, CashLink } from '../types';

// Create Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider Component
interface GlobalProviderProps {
  children: ReactNode;
  initialRpcUrl?: string;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({
  children,
  initialRpcUrl = 'https://rpc.test.mezo.org'
}) => {
  // Dynamic wallet integration
  const { auth, wallets } = useReactiveClient(dynamicClient);

  // State
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>(
    '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503'
  ); // Default token
  const [rpcUrl, setRpcUrl] = useState(initialRpcUrl);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [transactionRefreshTrigger, setTransactionRefreshTrigger] = useState(0);
  const balanceLoadingRef = useRef(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true);
  const [transactionsRefreshing, setTransactionsRefreshing] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // CashLinks state
  const [cashlinks, setCashlinks] = useState<CashLink[]>([]);
  const [cashlinksLoading, setCashlinksLoading] = useState<boolean>(false);
  const [cashlinksError, setCashlinksError] = useState<string | null>(null);

  // Auto-extract wallet address from Dynamic
  const walletAddress = wallets.primary?.address || null;
  const isConnected = !!auth.authenticatedUser;
  const user = auth.authenticatedUser;

  // Initialize token contract when addresses change
  useEffect(() => {
    if (walletAddress && tokenAddress && rpcUrl) {
      // Create provider with better configuration
      const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
        polling: true,
        pollingInterval: 4000,
        batchMaxCount: 1,
        batchMaxSize: 1024,
        batchStallTime: 100
      });

      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ],
        provider
      );
      setTokenContract(contract);
    } else {
      setTokenContract(null);
      clearBalance();
    }
  }, [walletAddress, tokenAddress, rpcUrl]);

  // Fetch balance function with retry logic
  const fetchBalance = useCallback(
    async (retryCount = 0) => {
      if (!tokenContract || !walletAddress) {
        setBalanceError('Contract or wallet address not available');
        return;
      }

      const maxRetries = 3;
      const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

      try {
        setBalanceLoading(true);
        balanceLoadingRef.current = true;
        setBalanceError(null);

        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });

        const balancePromise = Promise.all([
          tokenContract.balanceOf(walletAddress),
          tokenContract.decimals(),
          tokenContract.symbol()
        ]);

        const [balanceRaw, decimals, symbol] = (await Promise.race([
          balancePromise,
          timeoutPromise
        ])) as [bigint, number, string];

        const formatted = ethers.formatUnits(balanceRaw, decimals);
        setBalance({
          formatted,
          symbol,
          raw: balanceRaw.toString()
        });
      } catch (err) {
        console.error(`Balance fetch attempt ${retryCount + 1} failed:`, err);

        if (retryCount < maxRetries) {
          // Retry with exponential backoff
          setTimeout(() => {
            fetchBalance(retryCount + 1);
          }, retryDelay);
          return;
        }

        // Preserve last known balance on error for silent updates
        setBalanceError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setBalanceLoading(false);
        balanceLoadingRef.current = false;
      }
    },
    [tokenContract, walletAddress]
  );

  // Refresh balance function
  const refreshBalance = async () => {
    await fetchBalance();
  };

  // Retry balance function (force retry even if there's an error)
  const retryBalance = async () => {
    setBalanceError(null);
    await fetchBalance();
  };

  // Clear balance function
  const clearBalance = () => {
    setBalance(null);
    setBalanceError(null);
    setBalanceLoading(false);
  };

  // Trigger transaction refresh function
  const triggerTransactionRefresh = useCallback(() => {
    setTransactionRefreshTrigger((prev) => prev + 1);
  }, []);

  // CashLink management functions
  const addCashLink = useCallback((cashlink: CashLink) => {
    setCashlinks((prev) => [...prev, cashlink]);
  }, []);

  const updateCashLink = useCallback((transactionHash: string, updates: Partial<CashLink>) => {
    setCashlinks((prev) =>
      prev.map((cashlink) =>
        cashlink.transactionHash === transactionHash ? { ...cashlink, ...updates } : cashlink
      )
    );
  }, []);

  // Fetch cashlinks from API
  const fetchCashLinks = useCallback(async () => {
    try {
      setCashlinksLoading(true);
      setCashlinksError(null);

      const response = await makeAuthenticatedRequest('/api/cash-link', {
        method: 'GET'
      });

      // Convert the response format {<txHash>: <cashLink>} to CashLink array
      const cashlinksArray: CashLink[] = Object.entries(response).map(([txHash, cashLinkCode]) => ({
        transactionHash: txHash,
        code: String(cashLinkCode)
      }));

      setCashlinks(cashlinksArray);
    } catch (err) {
      console.error('Error fetching cashlinks:', err);
      setCashlinksError(
        err instanceof Error ? err.message : 'An error occurred while fetching cashlinks'
      );
    } finally {
      setCashlinksLoading(false);
    }
  }, []);

  // Auto-fetch cashlinks when user is authenticated and session is ready
  useEffect(() => {
    if (!isConnected) return;

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // Check if session token is available before making request
    const checkSessionAndFetch = async () => {
      const sessionToken = await getSessionToken();
      if (cancelled) return;
      
      if (sessionToken) {
        fetchCashLinks();
      } else {
        // If session token is not ready yet, retry after a short delay
        retryTimeout = setTimeout(async () => {
          if (cancelled) return;
          const retryToken = await getSessionToken();
          if (retryToken && !cancelled) {
            fetchCashLinks();
          }
        }, 500);
      }
    };

    checkSessionAndFetch();

    // Cleanup function
    return () => {
      cancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [isConnected, fetchCashLinks]);

  // Fetch transactions function
  const refreshTransactions = useCallback(
    async (isRefresh = false) => {
      if (!walletAddress || !tokenAddress) {
        setTransactionsLoading(false);
        setTransactionsRefreshing(false);
        return;
      }

      try {
        if (isRefresh) {
          setTransactionsRefreshing(true);
        } else {
          setTransactionsLoading(true);
        }
        setTransactionsError(null);

        const response = await mezoApi.getTokenTransfers(walletAddress, tokenAddress);
        const processedTxs = mezoApi.processTransactions(response.items, walletAddress);
        processedTxs.sort((a: Transaction, b: Transaction) => b.blockNumber - a.blockNumber);
        setTransactions(processedTxs);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactionsError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setTransactionsLoading(false);
        setTransactionsRefreshing(false);
      }
    },
    [walletAddress, tokenAddress]
  );

  // Initial transactions fetch
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Refetch transactions when balance changes signal comes in
  useEffect(() => {
    if (transactionRefreshTrigger > 0 && walletAddress && tokenAddress) {
      const timer = setTimeout(() => {
        refreshTransactions(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transactionRefreshTrigger, walletAddress, tokenAddress, refreshTransactions]);

  // Set up event listeners when contract is available
  useEffect(() => {
    if (!tokenContract || !walletAddress) return;

    // Set up event listeners for transfers
    const filterTo = tokenContract.filters.Transfer(null, walletAddress);
    const filterFrom = tokenContract.filters.Transfer(walletAddress, null);

    const handleTransfer = () => {
      fetchBalance();
      // Trigger transaction refresh when balance updates
      triggerTransactionRefresh();
    };

    tokenContract.on(filterTo, handleTransfer);
    tokenContract.on(filterFrom, handleTransfer);

    // Initial balance fetch
    fetchBalance();

    // Set up periodic balance refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      // Only fetch if not currently loading to avoid overlapping requests
      if (!balanceLoadingRef.current) {
        fetchBalance();
      }
    }, 30000);

    // Cleanup
    return () => {
      tokenContract.removeAllListeners();
      clearInterval(intervalId);
    };
  }, [tokenContract, walletAddress, fetchBalance, triggerTransactionRefresh]);

  // Context value
  const contextValue: GlobalContextType = {
    // State
    balance,
    balanceLoading,
    balanceError,
    walletAddress,
    tokenAddress,
    rpcUrl,

    // Dynamic Wallet State
    isConnected,
    user,

    // Actions
    setTokenAddress,
    setRpcUrl,
    refreshBalance,
    clearBalance,
    retryBalance,

    // Transaction refresh
    transactionRefreshTrigger,
    triggerTransactionRefresh,

    // Transactions
    transactions,
    transactionsLoading,
    transactionsRefreshing,
    transactionsError,
    refreshTransactions,

    // CashLinks
    cashlinks,
    cashlinksLoading,
    cashlinksError,
    addCashLink,
    updateCashLink,
    fetchCashLinks
  };

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

// Custom hook to use the context
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

// Specific hooks for balance management
export const useTokenBalance = () => {
  const { balance, balanceLoading, balanceError, refreshBalance, clearBalance, retryBalance } =
    useGlobalContext();
  return {
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,
    clearBalance,
    retryBalance
  };
};

export const useWallet = () => {
  const {
    walletAddress,
    tokenAddress,
    rpcUrl,
    setTokenAddress,
    setRpcUrl,
    isConnected,
    user,
    transactionRefreshTrigger,
    triggerTransactionRefresh
  } = useGlobalContext();
  return {
    walletAddress,
    tokenAddress,
    rpcUrl,
    setTokenAddress,
    setRpcUrl,
    isConnected,
    user,
    transactionRefreshTrigger,
    triggerTransactionRefresh
  };
};

export const useCashLinks = () => {
  const {
    cashlinks,
    cashlinksLoading,
    cashlinksError,
    addCashLink,
    updateCashLink,
    fetchCashLinks
  } = useGlobalContext();
  return {
    cashlinks,
    cashlinksLoading,
    cashlinksError,
    addCashLink,
    updateCashLink,
    fetchCashLinks
  };
};

export default GlobalContext;
