import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BackspaceIcon } from 'components/icons';
import { cn } from 'utils';
import WithArrowBack from 'layout/WithArrowBack';
import { router, useLocalSearchParams } from 'expo-router';
import { useTokenBalance } from 'context/global-context';

export default function AmountInput() {
  const { balance } = useTokenBalance();
  const [amount, setAmount] = useState('0');
  const localSearchParams = useLocalSearchParams();

  const cashLink = localSearchParams.cashLink;

  const handleNumberPress = async (num: string) => {
    // Trigger light haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.selectionAsync();
    }

    setAmount((prev) => {
      // Check if there's a decimal point
      if (prev.includes('.')) {
        // If decimal exists, check if we already have 2 digits after it
        const decimalPart = prev.split('.')[1];
        if (decimalPart && decimalPart.length >= 2) {
          // Already have 2 digits after decimal, don't add more
          // Trigger error haptic feedback to indicate input was blocked
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          return prev;
        }
      } else {
        // No decimal point, check if we already have 6 digits before decimal
        const integerPart = prev === '0' ? '' : prev;
        if (integerPart.length >= 6) {
          // Already have 6 digits before decimal, don't add more numbers
          // Trigger error haptic feedback to indicate input was blocked
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          return prev;
        }
      }

      if (prev === '0') return num;
      return prev + num;
    });
  };

  const handleDecimalPress = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.selectionAsync();
    }

    if (!amount.includes('.')) {
      setAmount((prev) => prev + '.');
    }
  };

  const handleDelete = async () => {
    // Trigger medium haptic feedback for delete
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setAmount((prev) => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleContinue = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (cashLink) {
      router.push('/confirm-cash-link?amount=' + amount);
    }
  };

  const NumberButton = ({ value, onPress }: { value: string; onPress: () => void }) => (
    <TouchableOpacity
      className="h-20 w-20 items-center justify-center"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text className="font-satoshiSemiBold text-4xl text-black">{value}</Text>
    </TouchableOpacity>
  );

  return (
    <WithArrowBack>
      <View className="flex-1 gap-16 pt-4">
        {/* Amount Section */}
        <View className="mb-10">
          <Text className="mb-2 font-satoshiSemiBold text-4xl">Amount</Text>
          <Text className="mb-15 text-base text-gray-500">Balance: ${balance?.formatted}</Text>
        </View>

        <View className="flex-1 justify-between">
          <Text
            className={cn(
              'mb-8 text-center font-satoshiSemiBold text-6xl',
              amount === '0' ? 'text-gray-300' : 'text-black'
            )}
          >
            ${amount}
          </Text>

          {/* Keypad */}
          <View className="">
            <View className="mb-5 flex-row justify-around">
              <NumberButton value="1" onPress={() => handleNumberPress('1')} />
              <NumberButton value="2" onPress={() => handleNumberPress('2')} />
              <NumberButton value="3" onPress={() => handleNumberPress('3')} />
            </View>
            <View className="mb-5 flex-row justify-around">
              <NumberButton value="4" onPress={() => handleNumberPress('4')} />
              <NumberButton value="5" onPress={() => handleNumberPress('5')} />
              <NumberButton value="6" onPress={() => handleNumberPress('6')} />
            </View>
            <View className="mb-5 flex-row justify-around">
              <NumberButton value="7" onPress={() => handleNumberPress('7')} />
              <NumberButton value="8" onPress={() => handleNumberPress('8')} />
              <NumberButton value="9" onPress={() => handleNumberPress('9')} />
            </View>
            <View className="flex-row justify-around">
              <NumberButton value="•" onPress={handleDecimalPress} />
              <NumberButton value="0" onPress={() => handleNumberPress('0')} />
              <TouchableOpacity
                className="h-20 w-20 items-center justify-center"
                onPress={handleDelete}
                activeOpacity={0.6}
              >
                <BackspaceIcon color="black" width={36} height={36} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`items-center rounded-3xl py-4 ${
            amount === '0' ? 'bg-gray-100' : 'bg-primary'
          }`}
          onPress={handleContinue}
          disabled={amount === '0'}
          activeOpacity={0.8}
        >
          <Text
            className={cn(
              'font-satoshiMedium text-lg',
              amount === '0' ? 'text-gray-300' : 'text-black'
            )}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </WithArrowBack>
  );
}
