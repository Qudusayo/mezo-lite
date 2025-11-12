import { Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import { QrCodeSvg } from 'react-native-qr-svg';
import { dynamicClient } from 'utils/config';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import WithArrowBack from 'layout/WithArrowBack';

const SIZE = 250;

const Qr = () => {
  const { auth } = useReactiveClient(dynamicClient);
  const user = useMemo(() => auth.authenticatedUser, [auth.authenticatedUser]);

  return (
    <WithArrowBack>
      <View className="mt-2 flex-1 items-center justify-center gap-4">
          <View
            style={{
              height: SIZE + 45
            }}
          >
            <QrCodeSvg
              style={{
                padding: 10,
                borderRadius: 20,
                backgroundColor: '#FFBB00',
                borderWidth: 8
              }}
              value={user?.email || ''}
              frameSize={SIZE}
              contentCells={4}
              dotColor="#000000"
              content={
                <Image
                  source={require('../assets/images/qr-logo.png')}
                  style={{
                    width: 65,
                    height: 65,
                    alignSelf: 'center',
                    marginTop: -5,
                    marginLeft: -5
                  }}
                />
              }
            />
          </View>
          <Text className="mb-4 font-satoshiMedium text-2xl tracking-widest">
            {user?.email}
          </Text>
          <View className="w-9/12 flex-row gap-4">
            <ControlButton>Copy</ControlButton>
            <ControlButton>Share</ControlButton>
          </View>
        </View>
    </WithArrowBack>
  );
};

const ControlButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <TouchableOpacity className="flex-1 rounded-xl bg-light p-3" activeOpacity={0.8}>
      <Text className="text-center font-satoshiMedium text-base uppercase">{children}</Text>
    </TouchableOpacity>
  );
};

export default Qr;
