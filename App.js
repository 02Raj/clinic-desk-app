import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import theme, { palette, spacing, radius } from './src/theme/theme';

import TodaysBookingsScreen from './src/screens/TodaysBookingsScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import LiveQueueScreen from './src/screens/LiveQueueScreen';

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const TABS = [
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
];

// ---------------------------------------------------------------------------
// Custom bottom tab bar
// ---------------------------------------------------------------------------

const BottomTabBar = React.memo(({ activeIndex, onTabPress }) => (
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
            size={24}
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

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ActiveScreen = TABS[activeIndex].screen;

  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <View style={styles.screenContainer}>
            <ActiveScreen />
          </View>
          <BottomTabBar
            activeIndex={activeIndex}
            onTabPress={setActiveIndex}
          />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeAreaProvider: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
    ...Platform.select({
      web: { height: '100vh', overflow: 'hidden' },
      default: {},
    }),
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
    zIndex: 0,
  },
  activeIndicator: {
    position: 'absolute',
    top: spacing.xs,
    width: 64,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: palette.primaryLight,
    zIndex: 0,
  },
  tabLabel: {
    marginTop: spacing.xxs,
    zIndex: 1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
