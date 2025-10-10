import { Text, FlatList, View } from 'react-native';
import React, { useMemo } from 'react';
import WithArrowBack from 'layout/WithArrowBack';
import { useGlobalContext } from '../context/global-context';
import { TransactionCard } from '../components/transaction-card';

const History = () => {
  const {
    transactions,
    transactionsLoading,
    transactionsRefreshing,
    transactionsError,
    refreshTransactions,
  } = useGlobalContext();
  const listData = useMemo(() => transactions, [transactions]);

  return (
    <WithArrowBack>
      <View className="bg-white py-4">
        <Text className="font-satoshiSemiBold text-3xl">Payment History</Text>
      </View>
      <FlatList
        className="flex-1"
        data={listData}
        keyExtractor={(item, index) => `${item.hash}-${index}`}
        renderItem={({ item: tx }) => (
          <TransactionCard
            isReceiving={tx.isReceiving}
            amount={Number(tx.value)}
            timestamp={tx.timestamp}
            address={tx.isReceiving ? tx.from : tx.to}
            decimals={tx.tokenInfo.decimals}
            symbol={tx.tokenInfo.symbol}
            transaction={tx}
          />
        )}
        ItemSeparatorComponent={() => <View className="my-0.5 h-px bg-gray-100" />}
        ListEmptyComponent={() => {
          if (transactionsLoading) return null;
          if (transactionsError)
            return (
              <Text className="text-center font-satoshi text-error">
                Error: {transactionsError}
              </Text>
            );
          return (
            <Text className="text-center font-satoshi text-gray-400">No transactions found</Text>
          );
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        bouncesZoom={false}
        alwaysBounceVertical={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={transactionsRefreshing}
        onRefresh={() => refreshTransactions(true)}
      />
    </WithArrowBack>
  );
};

export default History;
