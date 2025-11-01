import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppState, Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Overlay } from 'components/overlay';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

export default function Scan() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Request permission automatically on mount if not granted
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  if (!permission?.granted) {
    return <SafeAreaView style={StyleSheet.absoluteFillObject} />;
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              router.push(`/(pay)/phone/${data}`);
            }, 500);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}
