import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { palette, spacing } from '../../theme/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, right }) => (
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
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: spacing.xxs,
  },
});

export default ScreenHeader;
