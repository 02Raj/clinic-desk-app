import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';

interface WebDashboardLayoutProps {
  header?: React.ReactNode;
  main: React.ReactNode;
  aside?: React.ReactNode;
  asideWidth?: number;
}

const WebDashboardLayout: React.FC<WebDashboardLayoutProps> = ({
  header,
  main,
  aside,
  asideWidth = 320,
}) => (
  <View style={styles.root}>
    {header ? <View style={styles.header}>{header}</View> : null}
    <View style={styles.body}>
      <View style={styles.main}>{main}</View>
      {aside ? (
        <View style={[styles.aside, { width: asideWidth }]}>{aside}</View>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: spacing.md,
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  aside: {
    flexShrink: 0,
    minHeight: 0,
  },
});

export default WebDashboardLayout;
