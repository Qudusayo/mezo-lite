import React from 'react';
import { Tabs } from 'expo-router';
import { BoltIcon, DiamondIcon, WalletIcon } from 'components/icons';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffbb00'
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <WalletIcon color={color} width={size} height={size} />
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          tabBarIcon: ({ color, size }) => <BoltIcon color={color} width={size} height={size} />
        }}
      />
      <Tabs.Screen
        name="save"
        options={{
          title: 'Save',
          tabBarIcon: ({ color, size }) => <DiamondIcon color={color} width={size} height={size} />
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
