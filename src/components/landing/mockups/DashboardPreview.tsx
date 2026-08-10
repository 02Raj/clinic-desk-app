import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import BookingsPanelMock from './BookingsPanelMock';
import QueuePanelMock from './QueuePanelMock';
import { cardShadow } from '../landingLayout';
import { landing } from '../../../theme/landingTheme';

interface DashboardPreviewProps {
  size?: 'default' | 'large';
  showNewBooking?: boolean;
  highlightCode?: string;
}

const NAV_ITEMS = ['Bookings', 'Check In', 'Queue', 'Reports', 'Settings'];

const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  size = 'default',
  showNewBooking,
  highlightCode,
}) => {
  const { isMobileLayout } = useBreakpoint();
  const large = size === 'large';

  return (
    <View style={[styles.frame, cardShadow, large && styles.frameLarge, isMobileLayout && styles.frameMobile]}>
      <View style={[styles.chrome, large && styles.chromeLarge]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#E8A598' }]} />
          <View style={[styles.dot, { backgroundColor: '#E8D49A' }]} />
          <View style={[styles.dot, { backgroundColor: '#A8C9A0' }]} />
        </View>
        <Text style={styles.urlText}>app.clinicdesk.in / bookings</Text>
      </View>
      <View style={[styles.body, large && styles.bodyLarge, isMobileLayout && styles.bodyMobile]}>
        <View style={[styles.sidebar, large && styles.sidebarLarge]}>
          <View style={styles.sidebarLogo} />
          {NAV_ITEMS.map((item, i) => (
            <View key={item} style={[styles.navItem, i === 0 && styles.navItemActive]}>
              {large && !isMobileLayout ? (
                <Text style={[styles.navLabel, i === 0 && styles.navLabelActive]}>{item}</Text>
              ) : (
                <View style={[styles.navDot, i === 0 && styles.navDotActive]} />
              )}
            </View>
          ))}
        </View>
        <View style={[styles.main, large && styles.mainLarge]}>
          <View style={styles.panels}>
            <View style={styles.panelLeft}>
              <BookingsPanelMock
                size={large ? 'large' : 'default'}
                showNewBookingBanner={showNewBooking}
                highlightCode={highlightCode}
              />
            </View>
            {!isMobileLayout && (
              <View style={styles.panelRight}>
                <QueuePanelMock />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: landing.border,
    backgroundColor: landing.white,
    overflow: 'hidden',
    width: '100%',
  },
  frameLarge: {
    borderRadius: 16,
    maxWidth: 1080,
    alignSelf: 'center',
  },
  frameMobile: { borderRadius: 10 },
  chrome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: landing.creamDark,
    borderBottomWidth: 1,
    borderBottomColor: landing.border,
  },
  chromeLarge: { paddingHorizontal: 20, paddingVertical: 14 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  urlText: { fontSize: 11, color: landing.textMuted, fontWeight: '500' },
  body: { flexDirection: 'row', minHeight: 360 },
  bodyLarge: { minHeight: 480 },
  bodyMobile: { minHeight: 300 },
  sidebar: {
    width: 56,
    backgroundColor: landing.green,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 6,
  },
  sidebarLarge: { width: 148, paddingHorizontal: 12 },
  sidebarLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: landing.greenLight,
    marginBottom: 12,
    alignSelf: 'center',
  },
  navItem: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  navDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(245,239,230,0.35)' },
  navDotActive: { backgroundColor: landing.cream },
  navLabel: { fontSize: 12, color: 'rgba(245,239,230,0.55)', fontWeight: '500' },
  navLabelActive: { color: landing.cream, fontWeight: '700' },
  main: { flex: 1, backgroundColor: landing.cream, padding: 14 },
  mainLarge: { padding: 20 },
  panels: { flexDirection: 'row', gap: 14, flex: 1 },
  panelLeft: { flex: 1.25 },
  panelRight: { flex: 1 },
});

export default DashboardPreview;
