import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTokenBalance } from '../context/global-context';
import Shimmer from './shimmer';
import { ReloadIcon } from './icons';

const TokenBalanceDisplay = () => {
  const { balance, balanceLoading, balanceError, retryBalance } = useTokenBalance();

  // Show shimmer only on first load when there's no balance yet
  if (!balance && balanceLoading) {
    return (
      <View>
        <Shimmer width={100} height={35} radius={8} />
      </View>
    );
  }

  // If there's an error but we already have a balance, keep showing the last known balance (silent)
  if (balanceError && !balance) {
    return (
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={retryBalance}>
          <ReloadIcon color="white" width={35} height={35} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    );
  }

  if (!balance) {
    return (
      <View>
        <Shimmer width={100} height={35} radius={8} />
      </View>
    );
  }

  return (
    <View>
      <Text className="font-satoshiBold text-4xl text-white">${balance.formatted}</Text>
    </View>
  );
};

export default TokenBalanceDisplay;
