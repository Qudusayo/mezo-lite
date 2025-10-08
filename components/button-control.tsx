import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { SvgProps } from 'react-native-svg';

const ButtonControl = ({ icon, label }: { icon: React.ComponentType<SvgProps>; label: string }) => {
  const Icon = icon;
  return (
    <View className="items-center gap-2">
      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-light size-12 items-center justify-center rounded-full">
        <Icon color="white" width={24} height={24} />
      </TouchableOpacity>
      <Text className="font-satoshiMedium text-sm text-white">{label}</Text>
    </View>
  );
};

export default ButtonControl;
