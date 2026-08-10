import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { palette, spacing } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface PageContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, scroll = false, style }) => {
  const { isDesktopWeb } = useBreakpoint();

  const content = (
    <View style={[styles.inner, isDesktopWeb && styles.innerDesktop, style]}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.fill}>{content}</View>;
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  innerDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});

export default PageContainer;
