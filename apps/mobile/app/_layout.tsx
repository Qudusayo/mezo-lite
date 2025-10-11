import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { dynamicClient } from 'utils/config';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { GlobalProvider } from '../context/global-context';
import '../global.css';
import { BottomSheetProvider } from 'context/bottom-sheet';
import TransactionBottomSheet from 'components/bottom-sheets/tx-bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.setOptions({
  duration: 1000,
  fade: true
});

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const { sdk, auth, wallets } = useReactiveClient(dynamicClient);

  useEffect(() => {
    if (sdk.loaded) {
      console.log('USER AUTH', auth.token?.slice(0, 50));
      // auth.refreshUser()
      SplashScreen.hideAsync();
    }

    // const handleAuthSuccess = () => router.push('/');
    const handleLoggedOut = () => router.push('/login');

    // auth.on('authSuccess', handleAuthSuccess);
    auth.on('loggedOut', handleLoggedOut);

    auth.once('authInit', () => {
      console.log(`
==========================================
AUTH INIT
==========================================
        `);
    });

    return () => {
      // auth.off('authSuccess', handleAuthSuccess);
      auth.off('loggedOut', handleLoggedOut);
    };
  }, [sdk.loaded, auth]);

  return (
    <>
      <dynamicClient.reactNative.WebView />
      <BottomSheetProvider>
        <GestureHandlerRootView className="flex-2">
          <GlobalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!!wallets.primary}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="qr" />
                <Stack.Screen name="scan" />
              </Stack.Protected>
              <Stack.Protected guard={!wallets.primary}>
                <Stack.Screen name="login" />
              </Stack.Protected>
            </Stack>
          </GlobalProvider>
          <TransactionBottomSheet />
        </GestureHandlerRootView>
      </BottomSheetProvider>
    </>
  );
};

export default Layout;
