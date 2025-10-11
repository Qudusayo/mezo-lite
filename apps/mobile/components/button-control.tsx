import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { SvgProps } from 'react-native-svg';
import { Link } from 'expo-router';

const ButtonControl = ({
  icon,
  label,
  href
}: {
  icon: React.ComponentType<SvgProps>;
  label: string;
  href: string;
}) => {
  const Icon = icon;
  return (
    <View className="items-center gap-2">
      <TouchableOpacity
        activeOpacity={0.8}
        className="size-12 items-center justify-center rounded-full bg-light"
      >
        <Link href={href} asChild>
          <Icon color="white" width={24} height={24} />
        </Link>
      </TouchableOpacity>
      <Text className="font-satoshiMedium text-sm text-white">{label}</Text>
    </View>
  );
};

export default ButtonControl;
