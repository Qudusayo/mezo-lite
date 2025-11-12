import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from 'components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useSegments } from 'expo-router';
import { cn } from 'utils';

export default function WithArrowBack({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();

  const handleBack = () => {
    // If this screen was opened from a deep link (indicated by fromDeepLink param)
    // or if we're at root level, navigate to home instead of going back
    const fromDeepLink = params.fromDeepLink === 'true';
    const isAtRoot = segments.length <= 1;
    
    if (fromDeepLink || isAtRoot) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className={cn('flex-1 px-4', className)}>
        <View>
          <TouchableOpacity className="justify-center" onPress={handleBack}>
            <ArrowLeftIcon color="black" width={30} height={30} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}
