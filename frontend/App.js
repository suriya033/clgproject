import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        {!splashFinished ? (
          <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />
        ) : (
          <AppNavigator />
        )}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
