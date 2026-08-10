import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { palette, spacing } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, right }) => {
  const { isDesktopWeb } = useBreakpoint();

  if (isDesktopWeb) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Appbar.Header mode="small" style={styles.appbar} statusBarHeight={0}>
        <Appbar.Content
          title={title}
          titleStyle={styles.title}
          subtitle={subtitle}
          subtitleStyle={styles.subtitle}
        />
        {right}
      </Appbar.Header>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  appbar: {
    backgroundColor: palette.surface,
    elevation: 0,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    marginTop: spacing.xxs,
    fontWeight: '500',
  },
});

export default ScreenHeader;
