import { View, Text } from 'react-native';
import React from 'react';
import { ArrowBigDownLinesIcon, ArrowBigUpLinesIcon } from './icons';
import Shimmer from './shimmer';
import { cn, formatAddress, formatAmount, formatDate } from 'utils';

const TransactionCard = ({
  isReceiving,
  amount,
  timestamp,
  address,
  decimals,
  symbol,
}: {
  isReceiving: boolean;
  amount: number;
  timestamp: number;
  address: string;
  decimals: number;
  symbol: string;
}) => {
  return (
    <View className="mt-4 flex-row items-center justify-between gap-4">
      <View
        className={cn(
          'size-12 flex-row items-center justify-center rounded-full',
          isReceiving ? 'bg-success/25' : 'bg-error/25'
        )}>
        {isReceiving ? (
          <ArrowBigDownLinesIcon color="#4CAF50" />
        ) : (
          <ArrowBigUpLinesIcon color="#F44336" />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-satoshiSemiBold text-lg">{formatAddress(address)}</Text>
        <Text className="-top-1 font-satoshi text-sm text-gray-400">{formatDate(timestamp)}</Text>
      </View>
      <View>
        <Text
          className={cn(
            'font-satoshiSemiBold text-lg',
            isReceiving ? 'text-success' : 'text-error'
          )}>
          {isReceiving ? '+' : '-'}${Number(formatAmount(amount, decimals)).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const TransactionShimmer = () => {
  return (
    <View className="mt-4 flex-row items-center justify-between gap-4">
      <Shimmer width={42} height={42} radius={9999} />

      <View className="flex-1">
        <View className="mb-1">
          <Shimmer width="70%" height={16} radius={6} />
        </View>
        <Shimmer width="40%" height={12} radius={6} />
      </View>

      <Shimmer width={50} height={16} radius={6} />
    </View>
  );
};

export { TransactionCard, TransactionShimmer };
