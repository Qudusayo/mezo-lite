import { Stack } from 'expo-router';
import React from 'react';

const PaymentLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phone/[number]" />
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default PaymentLayout;
