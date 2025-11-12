import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { dynamicClient } from 'utils/config';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { GlobalProvider } from '../context/global-context';
import '../global.css';
import { BottomSheetProvider } from 'context/bottom-sheet';
import TransactionBottomSheet from 'components/bottom-sheets/tx-bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { signInUser, signOutUser } from 'services/auth';
import DepositOptionsBottomSheet from 'components/bottom-sheets/deposit-options-bottom-sheet';
import DonationsBottomSheet from 'components/bottom-sheets/donations-bottom-sheet';
import * as Linking from 'expo-linking';

SplashScreen.setOptions({
  duration: 1000,
  fade: true
});

SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const { sdk, auth, wallets } = useReactiveClient(dynamicClient);
  const router = useRouter();
  const pendingTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (sdk.loaded) {
      // auth.refreshUser()
      SplashScreen.hideAsync();
    }

    const handleAuthSuccess = async (user: any) => {
      const { metadata, email } = user;
      console.log("USER:", JSON.stringify(user));
      const username = metadata['Username'] as string;
      const wallet = wallets.primary?.address as string;
      const userData = {
        username,
        email,
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
  }, [sdk.loaded, auth, wallets.primary, router]);

  // Handle deep links for mezolite://token:<TOKEN>
  useEffect(() => {
    const navigateToClaimCashLink = (token: string) => {
      // Navigate to home first to ensure proper back stack
      router.replace('/(tabs)');
      // Use requestAnimationFrame to ensure navigation completes before pushing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.push({
            pathname: '/claim-cash-link',
            params: { token, fromDeepLink: 'true' },
          });
        });
      });
    };

    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      
      // Parse mezolite://token:<TOKEN> pattern
      const tokenMatch = url.match(/mezolite:\/\/token:(.+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        
        // If wallet is connected, navigate immediately
        if (wallets.primary) {
          navigateToClaimCashLink(token);
        } else {
          // Store token for later navigation after authentication
          pendingTokenRef.current = token;
        }
      }
    };

    // Handle initial URL (when app is opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [wallets.primary, router]);

  // Navigate to claim-cash-link when wallet becomes available and there's a pending token
  useEffect(() => {
    if (wallets.primary && pendingTokenRef.current) {
      const token = pendingTokenRef.current;
      pendingTokenRef.current = null;
      
      // Navigate to home first to ensure proper back stack
      router.replace('/(tabs)');
      // Use requestAnimationFrame to ensure navigation completes before pushing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.push({
            pathname: '/claim-cash-link',
            params: { token, fromDeepLink: 'true' },
          });
        });
      });
    }
  }, [wallets.primary, router]);

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
            <DonationsBottomSheet />
          </GestureHandlerRootView>
        </BottomSheetProvider>
      </GlobalProvider>
    </>
  );
};

export default Layout;
