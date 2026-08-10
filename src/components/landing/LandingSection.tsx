import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { layout, sectionBackground, type SectionVariant } from './landingLayout';

interface LandingSectionProps {
  id?: string;
  variant?: SectionVariant;
  children: React.ReactNode;
  onLayout?: (e: import('react-native').LayoutChangeEvent) => void;
  noPadding?: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({
  id,
  variant = 'cream',
  children,
  onLayout,
  noPadding,
}) => {
  const { isMobileLayout } = useBreakpoint();

  return (
    <View
      nativeID={id}
      onLayout={onLayout}
      style={[
        layout.section,
        isMobileLayout && layout.sectionMobile,
        { backgroundColor: sectionBackground[variant] },
        noPadding && styles.noPadding,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  noPadding: {
    paddingVertical: 0,
  },
});

export default LandingSection;
