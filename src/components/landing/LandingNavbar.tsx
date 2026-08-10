import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  type ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../theme/landingTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import LandingButton from './LandingButton';
import { LANDING_MAX_WIDTH } from './landingLayout';

interface LandingNavbarProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  scrolled: boolean;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'product', label: 'Product' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'faq', label: 'FAQ' },
];

const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onGetStarted,
  onSignIn,
  scrolled,
  onNavigate,
}) => {
  const { isMobileLayout } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <View style={[styles.bar, scrolled && styles.barScrolled]}>
        <View style={[styles.inner, isMobileLayout && styles.innerMobile]}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="hospital-building" size={16} color={landing.textOnGreen} />
            </View>
            <Text style={styles.brandText}>Clinic Desk</Text>
          </View>

          {!isMobileLayout ? (
            <View style={styles.links}>
              {NAV_ITEMS.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleNav(item.id)} accessibilityRole="link">
                  <Text style={styles.link}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={onSignIn} accessibilityRole="link">
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
              <LandingButton label="Get started" onPress={onGetStarted} size="compact" />
            </View>
          ) : (
            <View style={styles.mobileActions}>
              <LandingButton label="Get started" onPress={onGetStarted} size="compact" />
              <TouchableOpacity onPress={() => setMenuOpen(true)} accessibilityLabel="Open menu" style={styles.menuBtn}>
                <MaterialCommunityIcons name="menu" size={22} color={landing.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.drawer}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => handleNav(item.id)} style={styles.drawerItem}>
                <Text style={styles.drawerText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { setMenuOpen(false); onSignIn(); }} style={styles.drawerItem}>
              <Text style={styles.drawerText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: 'rgba(245, 239, 230, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    ...Platform.select({
      web: { backdropFilter: 'blur(12px)' } as ViewStyle,
      default: {},
    }),
  },
  barScrolled: {
    borderBottomColor: landing.border,
    backgroundColor: 'rgba(245, 239, 230, 0.97)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: LANDING_MAX_WIDTH + 80,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 18,
  },
  innerMobile: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: landing.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 17, fontWeight: '800', color: landing.text, letterSpacing: -0.3 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  link: {
    fontSize: 13,
    fontWeight: '500',
    color: landing.textMuted,
    ...Platform.select({ web: { cursor: 'pointer' } as ViewStyle, default: {} }),
  },
  mobileActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBtn: { padding: 6 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 32, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawer: {
    width: 260,
    backgroundColor: landing.cream,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: landing.border,
  },
  drawerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: landing.divider },
  drawerText: { fontSize: 16, fontWeight: '600', color: landing.text },
});

export default LandingNavbar;
