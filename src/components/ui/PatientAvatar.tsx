import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { palette, radius, spacing } from '../../theme/theme';

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

interface PatientAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'neutral' | 'primary';
}

const PatientAvatar: React.FC<PatientAvatarProps> = ({
  name,
  size = 'md',
  variant = 'neutral',
}) => {
  const dim = size === 'lg' ? 48 : size === 'sm' ? 36 : 40;
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 12 : 14;
  const isPrimary = variant === 'primary';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: isPrimary ? palette.primary : palette.primaryContainer,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: isPrimary ? palette.textOnPrimary : palette.primary,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PatientAvatar;
