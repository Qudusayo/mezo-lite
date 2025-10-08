import React, { useState, useEffect, useCallback } from 'react';
import { Text, FlatList, View } from 'react-native';
import { TransactionCard, TransactionShimmer } from './transaction-card';
import { useWallet } from '../context/global-context';
import { mezoApi } from '../utils/api';

interface Transaction {
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

const TokenTransactions = ({
  containerClassName,
  headerText,
}: {
  containerClassName?: string;
  headerText?: string;
}) => {
  const { walletAddress, tokenAddress, transactionRefreshTrigger } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions using the API
  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (!walletAddress || !tokenAddress) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch token transfers from API
      const response = await mezoApi.getTokenTransfers(walletAddress, tokenAddress);
      
      // Process the transactions
      const processedTxs = mezoApi.processTransactions(response.items, walletAddress);
      
      // Sort by block number (newest first)
      processedTxs.sort((a, b) => b.blockNumber - a.blockNumber);
      
      setTransactions(processedTxs);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [walletAddress, tokenAddress]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Refetch when balance updates (background refresh)
  useEffect(() => {
    if (transactionRefreshTrigger > 0 && walletAddress && tokenAddress) {
      // Small delay to allow balance update to complete
      const timer = setTimeout(() => {
        fetchTransactions(true); // Pass true to indicate this is a refresh
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [transactionRefreshTrigger, walletAddress, tokenAddress, fetchTransactions]);

  const renderTransaction = ({ item: tx }: { item: Transaction }) => (
    <TransactionCard
      isReceiving={tx.isReceiving}
      amount={Number(tx.value)}
      timestamp={tx.timestamp}
      address={tx.isReceiving ? tx.from : tx.to}
      decimals={tx.tokenInfo.decimals}
      symbol={tx.tokenInfo.symbol}
    />
  );

  const renderHeader = () => {
    if (!headerText) return null;
    return (
      <View className="bg-white py-4">
        <Text className="font-satoshiSemiBold text-xl">{headerText}</Text>
      </View>
    );
  };

  const renderLoadingShimmer = () => (
    <FlatList
      className={containerClassName}
      data={Array.from({ length: 7 })}
      keyExtractor={(_, index) => `shimmer-${index}`}
      renderItem={() => <TransactionShimmer />}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
      bounces={true}
      bouncesZoom={false}
      alwaysBounceVertical={false}
      stickyHeaderIndices={headerText ? [0] : []}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
    />
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    if (error) return <Text className="font-satoshi text-error text-center">Error: {error}</Text>;
    return <Text className="font-satoshi text-center text-gray-400">No transactions found</Text>;
  };

  const keyExtractor = (item: Transaction, index: number) => `${item.hash}-${index}`;

  // Only show shimmer on initial load when there's no data
  if (loading && transactions.length === 0) return renderLoadingShimmer();

  return (
    <FlatList
      className={containerClassName || 'flex-1'}
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderTransaction}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      bouncesZoom={false}
      alwaysBounceVertical={false}
      stickyHeaderIndices={headerText ? [0] : []}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      refreshing={refreshing}
      onRefresh={() => fetchTransactions(true)}
    />
  );
};

export default TokenTransactions;
