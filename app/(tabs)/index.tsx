import React, { useMemo } from 'react';
import { TouchableOpacity, Text, Image, View } from 'react-native';
import { dynamicClient } from 'utils/config';
import { Link } from 'expo-router';
import { ArrowUpIcon, PlusIcon, QrCodeIcon, RepeatIcon, ScanIcon } from 'components/icons';
import ButtonControl from 'components/button-control';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import TokenBalanceDisplay from 'components/token-balance';
import TokenTransactions from 'components/token-transactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomSheetContext } from 'context/bottom-sheet';

export default function App() {
  const { auth } = useReactiveClient(dynamicClient);
  const insets = useSafeAreaInsets();
  const user = useMemo(() => auth.authenticatedUser, [auth.authenticatedUser]);
  const username = useMemo(() => {
    return user?.metadata && ((user?.metadata as Record<string, string>)['Username'] as string);
  }, [user]);
  const { open } = useBottomSheetContext();

  return (
    <View
      className="relative flex-1 bg-primary"
      style={{
        paddingTop: insets.top,
      }}>
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
            <Text className="font-satoshiSemiBold text-lg capitalize text-white">
              Welcome {username}!
            </Text>
          </TouchableOpacity>
          <Link href="/qr" asChild>
            <TouchableOpacity activeOpacity={0.8} className="flex-row items-center justify-end">
              <QrCodeIcon color="white" width={32} height={32} />
            </TouchableOpacity>
          </Link>
        </View>
        <View>
          <Text className="font-satoshiMedium text-lg text-white">Your Assets</Text>
          <TokenBalanceDisplay />
        </View>

        <View className="flex-row justify-around gap-4">
          <ButtonControl icon={ScanIcon} label="Scan QR" href="/scan" />
          <ButtonControl icon={PlusIcon} label="Deposit" href={() => open('depositOptions')} />
          <ButtonControl icon={ArrowUpIcon} label="Withdraw" href="/amount" />
          <ButtonControl icon={RepeatIcon} label="History" href="/history" />
        </View>
      </View>
      <View className="flex-1 rounded-t-3xl bg-white">
        <View className="bg-transparent p-4">
          <Text className="font-satoshiSemiBold text-xl">Recent Activity</Text>
        </View>
        <TokenTransactions containerClassName="flex-1 h-full" />
      </View>
    </View>
  );
}
