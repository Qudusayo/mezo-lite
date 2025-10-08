import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTokenBalance } from '../context/global-context';
import Shimmer from './shimmer';
import { ReloadIcon } from './icons';

const TokenBalanceDisplay = () => {
  const { balance, balanceLoading, balanceError, retryBalance } = useTokenBalance();

  if (balanceLoading)
    return (
      <View>
        <Shimmer width={100} height={35} radius={8} />
      </View>
    );
  if (balanceError)
    return (
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={retryBalance}>
          <ReloadIcon color="white" width={35} height={35} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    );
  if (!balance) return <Text>No balance data</Text>;

  return (
    <View>
      <Text className="font-satoshiBold text-4xl text-white">${balance.formatted}</Text>
    </View>
  );
};

export default TokenBalanceDisplay;
