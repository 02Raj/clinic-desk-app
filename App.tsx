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
import { APP_TABS } from './src/config/navigation';
import { useBreakpoint } from './src/hooks/useBreakpoint';
import WebShell from './src/components/layout/WebShell';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppDataProvider } from './src/context/AppDataContext';
import LoginScreen from './src/screens/LoginScreen';
import LandingScreen from './src/screens/landing/LandingScreen';
import ClinicOnboardingScreen from './src/screens/landing/ClinicOnboardingScreen';
import SignupSuccessScreen from './src/screens/landing/SignupSuccessScreen';

interface BottomTabBarProps {
  activeIndex: number;
  onTabPress: (index: number) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = React.memo(({ activeIndex, onTabPress }) => (
  <View style={styles.tabBar}>
    {APP_TABS.map((tab, i) => {
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
  const [showLogin, setShowLogin] = useState(false);
  const { isDesktopWeb } = useBreakpoint();
  const { isAuthenticated } = useAuth();
  const ActiveScreen = APP_TABS[activeIndex].screen;

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <View style={styles.screenContainer}>
          <LandingScreen
            onGetStarted={() => setShowLogin(true)}
            onSignIn={() => setShowLogin(true)}
          />
        </View>
      );
    }
    return (
      <View style={styles.screenContainer}>
        <LoginScreen onBackToLanding={() => setShowLogin(false)} />
      </View>
    );
  }

  if (isDesktopWeb) {
    return (
      <WebShell activeIndex={activeIndex} onTabPress={setActiveIndex}>
        <ActiveScreen />
      </WebShell>
    );
  }

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
  const [publicView, setPublicView] = useState<'landing' | 'onboarding' | 'signup-success' | 'login'>('landing');
  const [signupEmail, setSignupEmail] = useState('');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (Platform.OS === 'web') {
      if (publicView === 'landing') {
        return (
          <View style={styles.landingRoot}>
            <LandingScreen
              onGetStarted={() => setPublicView('onboarding')}
              onSignIn={() => setPublicView('login')}
            />
          </View>
        );
      }
      if (publicView === 'onboarding') {
        return (
          <ClinicOnboardingScreen
            onComplete={(email) => {
              setSignupEmail(email);
              setPublicView('signup-success');
            }}
            onBack={() => setPublicView('landing')}
            onSignIn={() => setPublicView('login')}
          />
        );
      }
      if (publicView === 'signup-success') {
        return (
          <SignupSuccessScreen
            email={signupEmail}
            onGoToLogin={() => setPublicView('login')}
            onBackToHome={() => setPublicView('landing')}
          />
        );
      }
      return (
        <LoginScreen onBackToLanding={() => setPublicView('landing')} />
      );
    }
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
  landingRoot: {
    flex: 1,
    ...Platform.select({
      web: { height: '100vh', overflow: 'hidden' } as unknown as ViewStyle,
      default: {},
    }),
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
      web: { boxShadow: '0px -4px 20px rgba(15, 23, 42, 0.05)' } as ViewStyle,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
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
