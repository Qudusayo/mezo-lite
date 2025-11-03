import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import WithArrowBack from '@/layout/WithArrowBack';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRightIcon, QrCodeIcon, UserIcon } from '@/components/icons';
import { makeAuthenticatedRequest } from '@/services/auth';

const Recipient = () => {
  const localSearchParams = useLocalSearchParams();
  const payload = localSearchParams.payload;
  const [recipient, setRecipient] = useState(payload as string);
  console.log('payload', payload);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolveUser = async () => {
    try {
      setLoading(true);
      const data = await makeAuthenticatedRequest('/api/resolve-user', {
        method: 'POST',
        body: { payload: recipient },
      });
      console.log('Resolve user response:', data);
      router.push({
        pathname: '/amount',
        params: { recipient: data.user.phoneNumber, address: data.user.walletAddress },
      });
    } catch (error) {
      console.error('Error resolving user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithArrowBack>
      <View className="flex-1 gap-16 bg-white pt-4">
        <View className="flex-1">
          <View className="mb-8">
            <Text className="font-satoshiSemiBold text-4xl">Enter Recipient</Text>
            <Text className="font-satoshiRegular text-base text-gray-500">
              Enter the recipient&apos;s phone number to send money to
            </Text>
          </View>

          <View className="mb-6 flex-row items-center justify-between gap-2">
            <TextInput
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Username or Phone Number"
              className="font-satoshiRegular flex-1 rounded-lg border border-gray-300 p-4 text-base leading-tight text-black"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Link href="/scan" asChild>
              <TouchableOpacity
                activeOpacity={0.8}
                className="items-center justify-center rounded-lg border border-gray-300 p-0.5">
                <QrCodeIcon color="black" width={40} height={40} />
              </TouchableOpacity>
            </Link>
          </View>
          {recipient && recipient.length > 4 ? (
            <View className="flex-row items-center gap-4">
              <View className="flex-1 flex-row items-center gap-2">
                <View className="size-12 items-center justify-center rounded-full bg-gray-300">
                  <UserIcon color="black" width={24} height={24} fill="#9CA3AF" />
                </View>
                <View>
                  <Text className="font-satoshiSemiBold text-base leading-tight">Recipient</Text>
                  <Text className="font-satoshiSemiBold text-lg leading-tight">{recipient}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleResolveUser} activeOpacity={0.8} disabled={loading}>
                <View className="">
                  {loading ? (
                    <ActivityIndicator size="small" color="black" />
                  ) : (
                    <ArrowRightIcon color="black" width={24} height={24} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </WithArrowBack>
  );
};

export default Recipient;
