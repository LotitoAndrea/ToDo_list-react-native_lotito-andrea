// Layout con tab bar — Board e Membri

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0079BF',
        tabBarInactiveTintColor: '#7A869A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#DFE1E6',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 60,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="boards/index"
        options={{
          title: 'Board',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📋" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members/index"
        options={{
          title: 'Membri',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="👥" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="boards/[boardId]"
        options={{
          title: 'Board Selezionata',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📍" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === '#0079BF' ? 1 : 0.5 }}>{emoji}</Text>;
}
