import React, { useState, useEffect } from 'react';
import { Text, FlatList, View } from 'react-native';
import { ethers } from 'ethers';
import { TransactionCard, TransactionShimmer } from './transaction-card';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  timestamp: number;
  isReceiving: boolean;
}

interface TokenInfo {
  decimals: number;
  symbol: string;
}

const TokenTransactions = ({
  walletAddress,
  tokenAddress,
  rpcUrl = 'https://rpc.test.mezo.org',
  containerClassName,
  headerText,
}: {
  walletAddress: string;
  tokenAddress: string;
  rpcUrl?: string;
  containerClassName?: string;
  headerText?: string;
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ],
      provider
    );

    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Get token info
        const [decimals, symbol] = await Promise.all([
          tokenContract.decimals(),
          tokenContract.symbol(),
        ]);
        setTokenInfo({ decimals, symbol });

        // Get current block number
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10000 blocks

        // Get incoming and outgoing transfers
        const filterTo = tokenContract.filters.Transfer(null, walletAddress);
        const filterFrom = tokenContract.filters.Transfer(walletAddress, null);

        const [incomingLogs, outgoingLogs] = await Promise.all([
          tokenContract.queryFilter(filterTo, fromBlock, currentBlock),
          tokenContract.queryFilter(filterFrom, fromBlock, currentBlock),
        ]);

        // Combine and process all transactions
        const allLogs = [...incomingLogs, ...outgoingLogs];

        // Get block timestamps for each transaction
        const txsWithDetails = await Promise.all(
          allLogs.map(async (log) => {
            const block = await provider.getBlock(log.blockNumber);
            if (!block) throw new Error('Block not found');

            const logArgs = (log as any).args;
            const isReceiving = logArgs.to.toLowerCase() === walletAddress.toLowerCase();

            return {
              hash: log.transactionHash,
              from: logArgs.from,
              to: logArgs.to,
              value: logArgs.value,
              blockNumber: log.blockNumber,
              timestamp: block.timestamp,
              isReceiving,
            };
          })
        );

        // Sort by block number (newest first)
        txsWithDetails.sort((a, b) => b.blockNumber - a.blockNumber);

        setTransactions(txsWithDetails);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Set up listeners for new transactions
    const filterTo = tokenContract.filters.Transfer(null, walletAddress);
    const filterFrom = tokenContract.filters.Transfer(walletAddress, null);

    const handleNewTransfer = async (from: string, to: string, value: bigint, event: any) => {
      try {
        // Validate event object
        if (!event || !event.blockNumber || !event.transactionHash) {
          console.warn('Invalid event object received:', event);
          return;
        }

        const block = await provider.getBlock(event.blockNumber);
        if (!block) return; // Skip if block not found

        const isReceiving = to.toLowerCase() === walletAddress.toLowerCase();

        const newTx: Transaction = {
          hash: event.transactionHash,
          from,
          to,
          value,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
          isReceiving,
        };

        // Add new transaction to the top of the list
        setTransactions((prev) => {
          // Avoid duplicates
          const exists = prev.some((tx) => tx.hash === newTx.hash);
          if (exists) return prev;
          return [newTx, ...prev];
        });
      } catch (err) {
        console.error('Error processing new transfer:', err);
      }
    };

    tokenContract.on(filterTo, handleNewTransfer);
    tokenContract.on(filterFrom, handleNewTransfer);

    // Cleanup listeners on unmount
    return () => {
      tokenContract.removeAllListeners();
    };
  }, [walletAddress, tokenAddress, rpcUrl]);

  const renderTransaction = ({ item: tx }: { item: Transaction }) => (
    <TransactionCard
      isReceiving={tx.isReceiving}
      amount={Number(tx.value)}
      timestamp={tx.timestamp}
      address={tx.isReceiving ? tx.from : tx.to}
      decimals={tokenInfo?.decimals || 0}
      symbol={tokenInfo?.symbol || ''}
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
      bounces={false}
      stickyHeaderIndices={headerText ? [0] : []}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    if (error) return <Text className="font-satoshi text-error text-center">Error: {error}</Text>;
    return <Text className="font-satoshi text-center text-gray-400">No transactions found</Text>;
  };

  const keyExtractor = (item: Transaction, index: number) => `${item.hash}-${index}`;

  if (loading) return renderLoadingShimmer();

  return (
    <FlatList
      className={containerClassName || 'flex-1'}
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderTransaction}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      bounces={false}
      stickyHeaderIndices={headerText ? [0] : []}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
};

export default TokenTransactions;
