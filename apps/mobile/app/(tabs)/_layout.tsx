import { Tabs } from 'expo-router';
import React from 'react';
import { Alert, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';

import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LoginRequiredModal } from '@/components/login-required-modal';

export default function TabLayout() {
  const { colorScheme, themePreference } = useTheme();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  // ... (existing code)

  console.log('Rendering TabLayout');

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 5,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderRadius: 25,
            height: 70,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            paddingBottom: 0,
            paddingTop: 10,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          listeners={{
            tabPress: (e) => {
              console.log('Post tab pressed. User:', user);
              if (!user) {
                console.log('Opening login modal...');
                e.preventDefault();
                setIsLoginModalVisible(true);
              }
            },
          }}
          options={{
            title: 'Post',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 38 : 32}
                name="plus.circle.fill"
                color={focused ? Colors[colorScheme ?? 'light'].tint : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.fill" color={color} />,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <LoginRequiredModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      />
    </>
  );
}
