import { Text, SafeAreaView } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

const PayPhoneNumber = () => {
  const { number } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="font-satoshiMedium text-2xl">Pay Phone Number: {number}</Text>
    </SafeAreaView>
  );
};

export default PayPhoneNumber;
