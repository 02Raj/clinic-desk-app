import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import theme, { palette, spacing, radius } from './src/theme/theme';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppDataProvider } from './src/context/AppDataContext';
import LoginScreen from './src/screens/LoginScreen';
import TodaysBookingsScreen from './src/screens/TodaysBookingsScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import LiveQueueScreen from './src/screens/LiveQueueScreen';
import WeeklySummaryScreen from './src/screens/WeeklySummaryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface TabConfig {
  key: string;
  title: string;
  icon: IconName;
  activeIcon: IconName;
  screen: React.FC;
}

const TABS: TabConfig[] = [
  {
    key: 'bookings',
    title: 'Bookings',
    icon: 'calendar-check-outline',
    activeIcon: 'calendar-check',
    screen: TodaysBookingsScreen,
  },
  {
    key: 'checkin',
    title: 'Check In',
    icon: 'account-check-outline',
    activeIcon: 'account-check',
    screen: CheckInScreen,
  },
  {
    key: 'queue',
    title: 'Queue',
    icon: 'account-group-outline',
    activeIcon: 'account-group',
    screen: LiveQueueScreen,
  },
  {
    key: 'report',
    title: 'Report',
    icon: 'chart-bar',
    activeIcon: 'chart-bar',
    screen: WeeklySummaryScreen,
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: 'cog-outline',
    activeIcon: 'cog',
    screen: SettingsScreen,
  },
];

interface BottomTabBarProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = React.memo(({ activeIndex, onTabPress }) => (
  <View style={styles.tabBar}>
    {TABS.map((tab, i) => {
      const isActive = i === activeIndex;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(i)}
          activeOpacity={0.7}
          style={styles.tabItem}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={tab.title}
        >
          {isActive && <View style={styles.activeIndicator} />}
          <MaterialCommunityIcons
            name={isActive ? tab.activeIcon : tab.icon}
            size={22}
            color={isActive ? palette.primary : palette.textSecondary}
            style={{ zIndex: 1 }}
          />
          <Text
            variant="labelSmall"
            style={[
              styles.tabLabel,
              { color: isActive ? palette.primary : palette.textSecondary },
              isActive && styles.tabLabelActive,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

const MainApp: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const ActiveScreen = TABS[activeIndex].screen;

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>
      <BottomTabBar activeIndex={activeIndex} onTabPress={setActiveIndex} />
    </View>
  );
};

const AppRoot: React.FC = () => {
  const { isAuthenticated, loading, clinicId } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppDataProvider clinicId={clinicId}>
      <MainApp />
    </AppDataProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppRoot />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaProvider: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
    ...Platform.select({
      web: { height: '100vh', overflow: 'hidden' } as unknown as ViewStyle,
      default: {},
    }),
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
    ...Platform.select({
      web: { boxShadow: '0px -2px 12px rgba(15, 23, 42, 0.06)' } as ViewStyle,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
    zIndex: 0,
    borderRadius: radius.md,
  },
  activeIndicator: {
    position: 'absolute',
    top: spacing.xxs,
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xxs,
    borderRadius: radius.sm,
    backgroundColor: palette.primaryContainer,
    zIndex: 0,
  },
  tabLabel: {
    marginTop: spacing.xxs,
    zIndex: 1,
    fontSize: 10,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
