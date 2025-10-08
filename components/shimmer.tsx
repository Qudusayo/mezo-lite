import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

const Shimmer = ({
  width,
  height,
  radius = 8,
}: {
  width: number | string;
  height: number;
  radius: number;
}) => {
  const numericWidth = typeof width === 'string' ? 200 : width;
  const translateX = useRef(new Animated.Value(-numericWidth)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: numericWidth,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX, numericWidth]);

  return (
    <View
      style={{
        width: typeof width === 'string' ? (width as any) : width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
      }}>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}>
        <LinearGradient
          colors={['#E5E7EB00', '#F3F4F6', '#E5E7EB00']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export default Shimmer;
