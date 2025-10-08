/**
 * Global Context for Token Balance Management
 * 
 * This context provides centralized state management for token balances,
 * automatically extracting wallet information from Dynamic wallet integration.
 * 
 * Features:
 * - Auto-extracts wallet address from Dynamic wallet
 * - Manages token balance state globally
 * - Real-time balance updates via event listeners
 * - Simplified component usage (no props needed)
 * 
 * Usage Examples:
 * 
 * 1. Using the TokenBalanceDisplay component (no props needed):
 *    <TokenBalanceDisplay />
 * 
 * 2. Using hooks directly in components:
 *    const { balance, balanceLoading, refreshBalance } = useTokenBalance();
 *    const { walletAddress, isConnected, user } = useWallet();
 * 
 * 3. Changing token address (optional):
 *    const { setTokenAddress } = useWallet();
 *    setTokenAddress("0x456...");
 *    await refreshBalance();
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { dynamicClient } from '../utils/config';

// Types
interface TokenBalance {
  formatted: string;
  symbol: string;
  raw: string;
}

interface GlobalContextType {
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
}

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
  const [tokenAddress, setTokenAddress] = useState<string>('0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503'); // Default token
  const [rpcUrl, setRpcUrl] = useState(initialRpcUrl);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [transactionRefreshTrigger, setTransactionRefreshTrigger] = useState(0);
  const balanceLoadingRef = useRef(false);
  
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
        batchStallTime: 100,
      });
      
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'event Transfer(address indexed from, address indexed to, uint256 value)',
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
  const fetchBalance = useCallback(async (retryCount = 0) => {
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
        tokenContract.symbol(),
      ]);

      const [balanceRaw, decimals, symbol] = await Promise.race([
        balancePromise,
        timeoutPromise
      ]) as [bigint, number, string];

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
      
      setBalanceError(err instanceof Error ? err.message : 'An unknown error occurred');
      setBalance(null);
    } finally {
      setBalanceLoading(false);
      balanceLoadingRef.current = false;
    }
  }, [tokenContract, walletAddress]);

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
    setTransactionRefreshTrigger(prev => prev + 1);
  }, []);

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
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
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
  const { balance, balanceLoading, balanceError, refreshBalance, clearBalance, retryBalance } = useGlobalContext();
  return { balance, balanceLoading, balanceError, refreshBalance, clearBalance, retryBalance };
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

export default GlobalContext;
