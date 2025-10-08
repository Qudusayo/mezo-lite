import React, { useMemo } from 'react';
import { TouchableOpacity, Text, SafeAreaView, Image, View } from 'react-native';
import { dynamicClient } from 'utils/config';
import { Link, router } from 'expo-router';
import { ArrowUpIcon, PlusIcon, QrCodeIcon, RepeatIcon, ScanIcon } from 'components/icons';
import ButtonControl from 'components/button-control';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import TokenBalanceDisplay from 'components/token-balance';
import TokenTransactions from 'components/token-transactions';

export default function App() {
  const { auth, wallets } = useReactiveClient(dynamicClient);

  const user = useMemo(() => auth.authenticatedUser, [auth.authenticatedUser]);
  const username = useMemo(() => {
    return user?.metadata && ((user?.metadata as Record<string, string>)['Username'] as string);
  }, [user]);

  return (
    <SafeAreaView className="relative flex-1 bg-primary">
      <Image
        source={require('../../assets/images/background.png')}
        className="absolute left-0 top-0 w-screen"
      />
      <View className="gap-6 p-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-min flex-row items-center gap-2 rounded-full bg-light p-1.5 pr-3"
            onPress={() => dynamicClient.ui.auth.show()}>
            <View className="size-9 rounded-full bg-white"></View>
            <Text className="font-satoshiSemiBold text-lg text-white">Welcome {username}!</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} className="flex-row items-center justify-end">
            <Link href="/qr" asChild>
              <QrCodeIcon color="white" width={32} height={32} />
            </Link>
          </TouchableOpacity>
        </View>
        <View>
          <Text className="font-satoshiMedium text-lg text-white">Your Assets</Text>
          <TokenBalanceDisplay
            walletAddress={wallets.primary?.address || '0x0000000000000000000000000000000000000000'}
            tokenAddress="0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
          />
        </View>

        <View className="flex-row justify-around gap-4">
          <ButtonControl icon={ScanIcon} label="Scan QR" href="/scan" />
          <ButtonControl icon={PlusIcon} label="Deposit" href="/deposit" />
          <ButtonControl icon={ArrowUpIcon} label="Withdraw" href="/withdraw" />
          <ButtonControl icon={RepeatIcon} label="History" href="/history" />
        </View>
      </View>
      <TokenTransactions
        walletAddress={wallets.primary?.address || '0x0000000000000000000000000000000000000000'}
        tokenAddress="0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
        containerClassName="flex-1 rounded-t-3xl bg-white"
        headerText="Recent Activity"
      />
    </SafeAreaView>
  );
}
