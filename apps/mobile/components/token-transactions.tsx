import React, { useMemo } from 'react';
import { Text, FlatList, View } from 'react-native';
import { TransactionCard, TransactionShimmer } from './transaction-card';
import { useGlobalContext } from '../context/global-context';
import { Transaction } from '../types';

const TokenTransactions = ({
  containerClassName,
  headerText,
}: {
  containerClassName?: string;
  headerText?: string;
}) => {
  const { transactions, transactionsLoading, transactionsError } = useGlobalContext();

  const listData = useMemo(() => transactions.slice(0, 10), [transactions]);

  const renderTransaction = ({ item: tx }: { item: Transaction }) => (
    <TransactionCard
      isReceiving={tx.isReceiving}
      amount={Number(tx.value)}
      timestamp={tx.timestamp}
      address={tx.isReceiving ? tx.from : tx.to}
      decimals={tx.tokenInfo.decimals}
      symbol={tx.tokenInfo.symbol}
      transaction={tx}
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
    if (transactionsLoading) return null;
    if (transactionsError)
      return (
        <Text className="text-center font-satoshi text-error">Error: {transactionsError}</Text>
      );
    return <Text className="text-center font-satoshi text-gray-400">No transactions found</Text>;
  };

  const keyExtractor = (item: any, index: number) => `${item.hash}-${index}`;

  // Only show shimmer on initial load when there's no data
  if (transactionsLoading && transactions.length === 0) return renderLoadingShimmer();

  return (
    <FlatList
      className={containerClassName || 'flex-1'}
      data={listData}
      keyExtractor={keyExtractor}
      renderItem={renderTransaction}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      bounces={false}
      stickyHeaderIndices={headerText ? [0] : []}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
};

export default TokenTransactions;
