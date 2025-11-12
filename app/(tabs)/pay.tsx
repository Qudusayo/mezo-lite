import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { LocationDollarIcon, PhoneIcon } from 'components/icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Pay = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="mb-6 font-satoshiSemiBold text-3xl">Pay Via</Text>
        <View className="gap-0.5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/recipient')}
            className="flex-row items-center gap-4 rounded-t-xl bg-[#7978770c] p-4">
            <PhoneIcon color="black" width={24} height={24} />
            <View>
              <Text className="font-satoshiMedium text-xl">Contact</Text>
              <Text className="font-sans text-base leading-5">To any of your contacts</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/cash-link')}
            className="flex-row items-center gap-4 rounded-b-xl bg-[#7978770c] p-4">
            <LocationDollarIcon color="black" width={24} height={24} />
            <View>
              <Text className="font-satoshiMedium text-xl">Shareable Cash Link</Text>
              <Text className="font-sans text-base leading-5">To any one not on Mezo lite yet</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Pay;
