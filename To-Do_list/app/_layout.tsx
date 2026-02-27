import { Stack } from 'expo-router';
import { BoardProvider } from '../context/BoardContext';

export default function RootLayout() {
  return (
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
      <Stack.Screen
        name="board/index"
        options={{ title: '📋 Board', headerShown: false }}
      />
      <Stack.Screen
        name="card/[id]"
        options={{
          title: 'Dettaglio',
          headerBackTitle: 'Board',
        }}
      />
    </Stack>
    </BoardProvider>
  );
}
