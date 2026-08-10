import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  type ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { APP_TABS, type AppTabConfig } from '../../config/navigation';
import { palette, spacing, radius } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

interface WebShellProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
  children: React.ReactNode;
}

const WebShell: React.FC<WebShellProps> = ({ activeIndex, onTabPress, children }) => {
  const { clinicId } = useAuth();
  const activeTab = APP_TABS[activeIndex];
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={palette.textOnPrimary} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Clinic Desk</Text>
            <Text style={styles.brandSubtitle}>Front-Desk OS</Text>
          </View>
        </View>

        <View style={styles.nav}>
          {APP_TABS.map((tab, index) => (
            <SidebarItem
              key={tab.key}
              tab={tab}
              active={index === activeIndex}
              onPress={() => onTabPress(index)}
            />
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.footerLabel}>Clinic ID</Text>
          <Text style={styles.footerValue}>{clinicId || '—'}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.pageTitle}>{activeTab.title}</Text>
            <Text style={styles.pageSubtitle}>{activeTab.description}</Text>
          </View>
          <View style={styles.topbarMeta}>
            <MaterialCommunityIcons name="calendar-today" size={16} color={palette.textSecondary} />
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
};

interface SidebarItemProps {
  tab: AppTabConfig;
  active: boolean;
  onPress: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ tab, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.navItem, active && styles.navItemActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <MaterialCommunityIcons
      name={active ? tab.activeIcon : tab.icon}
      size={20}
      color={active ? palette.textOnPrimary : palette.textDisabled}
    />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: palette.background,
    minHeight: '100vh' as unknown as number,
  },
  sidebar: {
    width: 248,
    backgroundColor: palette.primaryDark, // Opsyfy Dark Green
    borderRightWidth: 1,
    borderRightColor: palette.primaryDark,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    color: palette.textOnPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: 'rgba(245, 239, 230, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  nav: {
    flex: 1,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: palette.primary, // Opsyfy lighter green for active
  },
  navLabel: {
    color: 'rgba(245, 239, 230, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  navLabelActive: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  footerLabel: {
    color: 'rgba(245, 239, 230, 0.5)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  footerValue: {
    color: palette.textOnPrimary,
    fontSize: 13,
    marginTop: spacing.xxs,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    backgroundColor: palette.background, // Opsyfy warm beige
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: palette.background, // Match background
    borderBottomWidth: 1,
    borderBottomColor: palette.border, // Very thin border
  },
  pageTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  topbarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surface, // Clean white pill
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dateText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    overflow: 'scroll',
  },
});

export default WebShell;
