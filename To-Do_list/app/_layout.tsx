// IMPORTANT: react-native-gesture-handler must be the very first import for iOS gestures
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { BoardProvider } from '../context/BoardContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, overflow: 'hidden' }}>
      <BoardProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0079BF' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="ToDo-list" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="board/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="card/[id]"
            options={{
              title: 'Dettaglio card',
              headerBackTitle: 'Board',
            }}
          />
        </Stack>
      </BoardProvider>
    </GestureHandlerRootView>
  );
}

