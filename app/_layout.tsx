import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { dynamicClient } from 'utils/config';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import '../global.css';

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const { sdk, auth, wallets } = useReactiveClient(dynamicClient);

  useEffect(() => {
    if (sdk.loaded) {
      console.log("USER AUTH", auth.token);
      // auth.refreshUser()
      SplashScreen.hideAsync();
    }

    // const handleAuthSuccess = () => router.push('/');
    const handleLoggedOut = () => router.push('/login');

    // auth.on('authSuccess', handleAuthSuccess);
    auth.on('loggedOut', handleLoggedOut);

    return () => {
      // auth.off('authSuccess', handleAuthSuccess);
      auth.off('loggedOut', handleLoggedOut);
    };
  }, [sdk.loaded]);

  return (
    <>
      <dynamicClient.reactNative.WebView />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!auth.authenticatedUser}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="qr" />
          <Stack.Screen name="scan" />
        </Stack.Protected>
        <Stack.Protected guard={!auth.authenticatedUser}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
};

export default Layout;
