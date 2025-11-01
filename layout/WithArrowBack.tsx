import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from 'components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { cn } from 'utils';

export default function WithArrowBack({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className={cn('flex-1 px-4', className)}>
        <View>
          <TouchableOpacity className="justify-center" onPress={() => router.back()}>
            <ArrowLeftIcon color="black" width={30} height={30} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}
