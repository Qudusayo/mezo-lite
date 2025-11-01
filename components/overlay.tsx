import { Canvas, DiffRect, rect, rrect } from '@shopify/react-native-skia';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import { XIcon } from 'components/icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const innerDimension = 300;

const outer = rrect(rect(0, 0, width, height), 0, 0);
const inner = rrect(
  rect(
    width / 2 - innerDimension / 2,
    height / 2 - innerDimension / 2,
    innerDimension,
    innerDimension
  ),
  20,
  20
);

export const Overlay = () => {
  const router = useRouter();

  return (
    <View
      style={Platform.OS === 'android' ? { flex: 1 } : StyleSheet.absoluteFillObject}
      pointerEvents="box-none"
    >
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
      </Canvas>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="absolute right-5 top-5 size-11 items-center justify-center rounded-full bg-white shadow"
      >
        <XIcon color="#111827" width={20} height={20} />
      </Pressable>
    </View>
  );
};
