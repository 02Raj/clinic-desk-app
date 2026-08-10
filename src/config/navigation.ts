import type React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TodaysBookingsScreen from '../screens/TodaysBookingsScreen';
import CheckInScreen from '../screens/CheckInScreen';
import LiveQueueScreen from '../screens/LiveQueueScreen';
import WeeklySummaryScreen from '../screens/WeeklySummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface AppTabConfig {
  key: string;
  title: string;
  description: string;
  icon: IconName;
  activeIcon: IconName;
  screen: React.FC;
}

export const APP_TABS: AppTabConfig[] = [
  {
    key: 'bookings',
    title: 'Bookings',
    description: "Today's appointments",
    icon: 'calendar-check-outline',
    activeIcon: 'calendar-check',
    screen: TodaysBookingsScreen,
  },
  {
    key: 'checkin',
    title: 'Check In',
    description: 'Verify booking codes',
    icon: 'account-check-outline',
    activeIcon: 'account-check',
    screen: CheckInScreen,
  },
  {
    key: 'queue',
    title: 'Live Queue',
    description: 'Tokens and call next',
    icon: 'account-group-outline',
    activeIcon: 'account-group',
    screen: LiveQueueScreen,
  },
  {
    key: 'report',
    title: 'Reports',
    description: 'Weekly performance',
    icon: 'chart-bar',
    activeIcon: 'chart-bar',
    screen: WeeklySummaryScreen,
  },
  {
    key: 'settings',
    title: 'Settings',
    description: 'Clinic configuration',
    icon: 'cog-outline',
    activeIcon: 'cog',
    screen: SettingsScreen,
  },
];
