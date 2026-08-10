import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { spacing } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface WebPageProps {
  children: React.ReactNode;
  scroll?: boolean;
  fill?: boolean;
  style?: ViewStyle;
}

const WebPage: React.FC<WebPageProps> = ({
  children,
  scroll = false,
  fill = true,
  style,
}) => {
  const { isDesktopWeb } = useBreakpoint();

  if (!isDesktopWeb) {
    return <>{children}</>;
  }

  const inner = (
    <View style={[styles.inner, fill && styles.innerFill, style]}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, fill && styles.scrollFill]}
        showsVerticalScrollIndicator={false}
      >
        {inner}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fill, styles.pagePadding]}>
      {inner}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
  },
  pagePadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  scrollFill: {
    minHeight: '100%' as unknown as number,
  },
  inner: {
    width: '100%',
  },
  innerFill: {
    flex: 1,
    minHeight: 0,
  },
});

export default WebPage;
