import { Text, SafeAreaView, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { AtIcon, LoacationDollarIcon, PhoneIcon } from 'components/icons';
import { router } from 'expo-router';

const Pay = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="mb-6 font-satoshiSemiBold text-3xl">Pay Via</Text>
        <View className="gap-0.5">
          <View className="flex-row items-center gap-4 rounded-t-xl bg-[#7978770c] p-4">
            <PhoneIcon color="black" width={24} height={24} />
            <View>
              <Text className="font-satoshiMedium text-xl">Phone Number</Text>
              <Text className="font-sans text-base leading-5">To any of your contacts</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/cash-link')}
            className="flex-row items-center gap-4 bg-[#7978770c] p-4">
            <LoacationDollarIcon color="black" width={24} height={24} />
            <View>
              <Text className="font-satoshiMedium text-xl">Shareable Cash Link</Text>
              <Text className="font-sans text-base leading-5">To any one not on Mezo lite yet</Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-4 rounded-b-xl bg-[#7978770c] p-4">
            <AtIcon color="black" width={24} height={24} />
            <View>
              <Text className="font-satoshiMedium text-xl">Username</Text>
              <Text className="font-sans text-base leading-5">To any Mezo lite user</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Pay;
