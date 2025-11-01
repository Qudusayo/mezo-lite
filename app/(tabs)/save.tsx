import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

const Savings = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="mb-6 font-satoshiSemiBold text-3xl">Savings</Text>
      </View>
    </SafeAreaView>
  );
};

export default Savings;
