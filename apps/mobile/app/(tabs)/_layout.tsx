import React from 'react';
import { NativeTabs, Icon, Label, Badge } from 'expo-router';

const TabsLayout = () => {
  return (
    <NativeTabs backgroundColor="black">
      <NativeTabs.Trigger name="index">
        <Label>Wallet</Label>
        <Icon sf="wallet.bifold.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pay">
        <Label>Pay</Label>
        <Icon sf="bolt.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="save">
        <Label>Save</Label>
        <Icon sf="lock.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="more"
        options={{
          role: 'more'
        }}
      >
        <Label>More</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
