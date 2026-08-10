import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { landing } from '../../theme/landingTheme';
import { useLandingScroll } from '../../components/landing/useLandingScroll';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingMetrics from '../../components/landing/LandingMetrics';
import LandingProductPreview from '../../components/landing/LandingProductPreview';
import LandingProblem from '../../components/landing/LandingProblem';
import LandingWorkflow from '../../components/landing/LandingWorkflow';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingAutomation from '../../components/landing/LandingAutomation';
import LandingCapabilities from '../../components/landing/LandingCapabilities';
import LandingTrust from '../../components/landing/LandingTrust';
import LandingFAQ from '../../components/landing/LandingFAQ';
import LandingFinalCTA from '../../components/landing/LandingFinalCTA';
import LandingFooter from '../../components/landing/LandingFooter';

interface LandingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const SECTION_MAP: Record<string, string> = {
  product: 'product',
  'how-it-works': 'workflow',
  features: 'features',
  faq: 'faq',
};

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted, onSignIn }) => {
  const { scrollRef, setScrollY, registerSection, scrollToSection, navScrolled } = useLandingScroll();

  const navigate = (section: string) => {
    const id = SECTION_MAP[section] ?? section;
    scrollToSection(id);
  };

  return (
    <View style={styles.root}>
      <LandingNavbar
        onGetStarted={onGetStarted}
        onSignIn={onSignIn}
        scrolled={navScrolled}
        onNavigate={navigate}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        <LandingHero
          onGetStarted={onGetStarted}
          onScrollToHowItWorks={() => navigate('how-it-works')}
          onLayout={registerSection('hero')}
        />
        <LandingMetrics onLayout={registerSection('metrics')} />
        <LandingProductPreview onLayout={registerSection('product')} />
        <LandingProblem onLayout={registerSection('problem')} />
        <LandingWorkflow onLayout={registerSection('workflow')} />
        <LandingFeatures onLayout={registerSection('features')} />
        <LandingAutomation onLayout={registerSection('automation')} />
        <LandingCapabilities onLayout={registerSection('capabilities')} />
        <LandingTrust onLayout={registerSection('trust')} />
        <LandingFAQ onLayout={registerSection('faq')} />
        <LandingFinalCTA
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
          onLayout={registerSection('cta')}
        />
        <LandingFooter
          onNavigate={navigate}
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landing.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default LandingScreen;
