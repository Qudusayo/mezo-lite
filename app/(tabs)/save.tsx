import { Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';

const Savings = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text className="font-satoshiSemiBold text-7xl text-center mb-4">
            Coming
          </Text>
          <Text className="font-satoshiSemiBold text-7xl text-center">
            Soon!
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Savings;
