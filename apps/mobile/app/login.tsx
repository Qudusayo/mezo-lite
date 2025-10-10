import { Image, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dynamicClient } from 'utils/config';

const Login = () => {
  return (
    <SafeAreaView className="relative flex-1 items-start justify-end gap-3 p-4">
      <Image
        source={require('../assets/overlays/top-overlay.png')}
        className="absolute left-0 top-0 w-screen"
      />
      <Image
        source={require('../assets/overlays/bottom-overlay.png')}
        className="absolute bottom-0 left-0 w-screen"
      />
      <Image
        source={require('../assets/splash.png')}
        className="absolute bottom-0 left-0 w-screen h-screen -z-10"
      />
      <View>
        <Text className="font-satoshiSemiBold text-4xl capitalize text-white">Your ultimate</Text>
        <Text className="font-satoshiSemiBold text-4xl capitalize text-white">Financial partner</Text>
      </View>
      <Text className="font-satoshi text-xl text-white">Your complete all-in-one solution.</Text>
      <TouchableOpacity
        className="mx-auto w-full rounded-xl bg-white p-3"
        onPress={() => dynamicClient.ui.auth.show()}>
        <Text className="font-satoshiMedium text-center text-lg text-black">Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Login;
