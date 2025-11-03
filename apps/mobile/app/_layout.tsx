import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { dynamicClient } from 'utils/config';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { GlobalProvider } from '../context/global-context';
import '../global.css';
import { BottomSheetProvider } from 'context/bottom-sheet';
import TransactionBottomSheet from 'components/bottom-sheets/tx-bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { signInUser, signOutUser } from 'services/auth';
import DepositOptionsBottomSheet from 'components/bottom-sheets/deposit-options-bottom-sheet';

SplashScreen.setOptions({
  duration: 1000,
  fade: true
});

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const { sdk, auth, wallets } = useReactiveClient(dynamicClient);

  useEffect(() => {
    if (sdk.loaded) {
      // auth.refreshUser()
      SplashScreen.hideAsync();
    }

    const handleAuthSuccess = async (user: any) => {
      const { metadata, phoneNumber } = user;
      const username = metadata['Username'] as string;
      const wallet = wallets.primary?.address as string;
      const userData = {
        username,
        phoneNumber,
        walletAddress: wallet
      };
      await signInUser(userData);
    };
    const handleLoggedOut = () => {
      signOutUser();
    };

    auth.on('authSuccess', handleAuthSuccess);
    auth.on('loggedOut', handleLoggedOut);

    return () => {
      auth.off('authSuccess', handleAuthSuccess);
      auth.off('loggedOut', handleLoggedOut);
    };
  }, [sdk.loaded, auth]);

  return (
    <>
      <dynamicClient.reactNative.WebView />
      <GlobalProvider>
        <BottomSheetProvider>
          <GestureHandlerRootView className="flex-2">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!!wallets.primary}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="qr" />
                <Stack.Screen name="claim-cash-link" />
                <Stack.Screen name="scan" />
              </Stack.Protected>
              <Stack.Protected guard={!wallets.primary}>
                <Stack.Screen name="login" />
              </Stack.Protected>
            </Stack>
            <TransactionBottomSheet />
            <DepositOptionsBottomSheet />
          </GestureHandlerRootView>
        </BottomSheetProvider>
      </GlobalProvider>
    </>
  );
};

export default Layout;
