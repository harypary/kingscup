import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RuleModal({ card, rules, visible, onClose }) {
  if (!card || !rules) return null;
  const rule = rules[card.value];
  if (!rule) return null;

  const isRed = card.suit === '♥' || card.suit === '♦';
  const suitColor = isRed ? '#cc0000' : '#111111';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.card}>
            {/* カード値とスート */}
            <View style={styles.cardHeader}>
              <Text style={[styles.cardValue, { color: suitColor }]}>{card.value}</Text>
              <Text style={[styles.cardSuit,  { color: suitColor }]}>{card.suit}</Text>
            </View>

            {/* ルールタイトル */}
            <View style={[styles.titleBadge, { backgroundColor: rule.color }]}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
            </View>

            {/* 区切り */}
            <View style={[styles.divider, { backgroundColor: rule.color + '44' }]} />

            {/* ルール説明 */}
            <Text style={styles.ruleDescription}>{rule.description}</Text>

            {/* 閉じるボタン */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: rule.color }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>OK！</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: '#000000cc',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    width: width * 0.82, backgroundColor: '#fafafa',
    borderRadius: 20, padding: 28, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 20,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  cardValue: { fontSize: 48, fontWeight: 'bold', fontFamily: 'serif' },
  cardSuit:  { fontSize: 32 },
  titleBadge: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 100, marginBottom: 14,
  },
  ruleTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  divider: { width: '100%', height: 1.5, marginBottom: 16 },
  ruleDescription: {
    color: '#333', fontSize: 15, lineHeight: 24,
    textAlign: 'center', marginBottom: 24,
  },
  closeButton: { paddingHorizontal: 48, paddingVertical: 14, borderRadius: 100 },
  closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
