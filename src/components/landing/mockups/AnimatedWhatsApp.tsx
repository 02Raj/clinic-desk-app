import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Easing } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { landing } from '../../../theme/landingTheme';
import { cardShadow } from '../landingLayout';

const BOOKING_SCRIPT = [
  { id: '1', type: 'user', text: 'Can I book tomorrow?', time: '9:14 AM' },
  { id: '2', type: 'bot', text: 'Sure. We have 10:30 AM and 12:00 PM available.', time: '9:14 AM' },
  { id: '3', type: 'user', text: '10:30 please.', time: '9:15 AM' },
  { id: '4', type: 'bot', text: "You're booked for tomorrow at 10:30 AM.\nCode K7M2 · Dr. Mehta", time: '9:15 AM' },
];

const LOOP_SCRIPT = [
  { id: '1', type: 'bot', text: 'Hi! Book with Dr. Mehta tomorrow?', buttons: ['Book 5:00 PM', 'Other times'], time: '9:02 AM' },
  { id: '2', type: 'user', text: 'Book 5:00 PM', time: '9:02 AM' },
  { id: '3', type: 'bot', text: 'Confirmed. Code K7M2 — Dr. Mehta, 5:00 PM', time: '9:02 AM' },
  { id: '4', type: 'bot', text: "You're #3 in queue. Est. wait 18 min.", isAlt: true, time: null },
];

type ChatMsg = {
  id: string;
  type: string;
  text: string;
  time?: string | null;
  buttons?: string[];
  isAlt?: boolean;
};

interface AnimatedWhatsAppProps {
  compact?: boolean;
  large?: boolean;
  variant?: 'booking' | 'loop';
  animate?: boolean;
}

const AnimatedWhatsApp: React.FC<AnimatedWhatsAppProps> = ({
  compact,
  large,
  variant = 'loop',
  animate = true,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const script: ChatMsg[] = variant === 'booking' ? BOOKING_SCRIPT : LOOP_SCRIPT;

  useEffect(() => {
    if (!animate || contentHeight === 0 || variant === 'booking') return;
    scrollY.setValue(0);
    const anim = Animated.loop(
      Animated.timing(scrollY, {
        toValue: -contentHeight / 2,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [contentHeight, scrollY, animate, variant]);

  const renderBubble = (msg: ChatMsg, index: number) => (
    <View
      key={`${msg.id}-${index}`}
      style={msg.type === 'user' ? styles.bubbleUser : msg.isAlt ? styles.bubbleBotAlt : styles.bubbleBot}
    >
      <Text style={msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleText}>{msg.text}</Text>
      {msg.buttons?.map((btn) => (
        <View key={btn} style={styles.bubbleBtn}>
          <Text style={styles.bubbleBtnText}>{btn}</Text>
        </View>
      ))}
      {msg.time ? <Text style={styles.bubbleTime}>{msg.time}</Text> : null}
    </View>
  );

  const phoneWidth = large ? 320 : compact ? 240 : 280;
  const screenHeight = large ? 480 : compact ? 380 : 420;

  return (
    <View style={[styles.phone, { width: phoneWidth }, cardShadow]}>
      <View style={styles.notch} />
      <View style={[styles.screen, { height: screenHeight }]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CD</Text>
          </View>
          <View>
            <Text style={styles.clinicName}>City Care Clinic</Text>
            <Text style={styles.clinicStatus}>via Clinic Desk · online</Text>
          </View>
          <MaterialCommunityIcons name="video" size={18} color="#8696A0" style={styles.headerIcon} />
        </View>
        <View style={styles.chatArea}>
          {variant === 'booking' || !animate ? (
            <View style={styles.chatTrack}>{script.map((msg, idx) => renderBubble(msg, idx))}</View>
          ) : (
            <Animated.View
              style={[styles.chatTrack, { transform: [{ translateY: scrollY }] }]}
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
              {[...script, ...script].map((msg, idx) => renderBubble(msg, idx))}
            </Animated.View>
          )}
          {animate && variant !== 'booking' && <View style={styles.chatFade} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  phone: {
    borderRadius: 28,
    backgroundColor: '#111',
    padding: 10,
    alignSelf: 'center',
  },
  notch: {
    width: 72,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginBottom: 8,
  },
  screen: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ECE5DD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#075E54',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  clinicName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  clinicStatus: { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  headerIcon: { marginLeft: 'auto' },
  chatArea: { flex: 1, overflow: 'hidden', position: 'relative' },
  chatTrack: { padding: 12, gap: 8 },
  chatFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    ...Platform.select({
      web: { background: 'linear-gradient(to top, #ECE5DD, transparent)' } as object,
      default: {},
    }),
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    maxWidth: '88%',
    marginBottom: 6,
  },
  bubbleBotAlt: {
    alignSelf: 'flex-start',
    backgroundColor: '#D9FDD3',
    borderRadius: 8,
    padding: 10,
    maxWidth: '88%',
    marginBottom: 6,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#D9FDD3',
    borderRadius: 8,
    padding: 10,
    maxWidth: '75%',
    marginBottom: 6,
  },
  bubbleText: { fontSize: 12, color: '#111', lineHeight: 17 },
  bubbleTextUser: { fontSize: 12, color: '#111', lineHeight: 17 },
  bubbleBtn: {
    marginTop: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    alignItems: 'center',
  },
  bubbleBtnText: { fontSize: 12, color: '#00A884', fontWeight: '600' },
  bubbleTime: { fontSize: 9, color: '#8696A0', alignSelf: 'flex-end', marginTop: 4 },
});

export default AnimatedWhatsApp;
