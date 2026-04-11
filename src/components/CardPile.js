import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { CardBack, CardFront } from './PlayingCard';

const CARD_W = 160;
const CARD_H = 224;

export default function CardPile({ deck, drawnCard, onDraw, isAnimating }) {
  const remaining = deck.length;

  return (
    <View style={styles.container}>
      {/* 残り枚数 */}
      <Text style={styles.countText}>{remaining} 枚残り</Text>

      <View style={styles.pilesRow}>
        {/* 左: カードの山（裏向き） */}
        <View style={styles.pileWrapper}>
          <Text style={styles.pileLabel}>山札</Text>
          <TouchableOpacity
            onPress={onDraw}
            disabled={remaining === 0 || isAnimating}
            activeOpacity={0.85}
          >
            {remaining > 0 ? (
              <View style={styles.stackContainer}>
                {/* 重なり感を出す影カード */}
                {remaining > 2 && (
                  <View style={[styles.shadowCard, { top: -6, left: -6 }]} />
                )}
                {remaining > 1 && (
                  <View style={[styles.shadowCard, { top: -3, left: -3 }]} />
                )}
                <CardBack width={CARD_W} height={CARD_H} />
              </View>
            ) : (
              <View style={[styles.emptyPile, { width: CARD_W, height: CARD_H }]}>
                <Text style={styles.emptyText}>終了</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 右: めくったカード */}
        <View style={styles.pileWrapper}>
          <Text style={styles.pileLabel}>めくったカード</Text>
          {drawnCard ? (
            <CardFront
              suit={drawnCard.suit}
              value={drawnCard.value}
              width={CARD_W}
              height={CARD_H}
            />
          ) : (
            <View style={[styles.emptyPile, { width: CARD_W, height: CARD_H }]}>
              <Text style={styles.emptyText}>{'タップして\nめくる'}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  countText: {
    color: '#ffffff99',
    fontSize: 13,
    marginBottom: 16,
    letterSpacing: 1,
  },
  pilesRow: {
    flexDirection: 'row',
    gap: 28,
    alignItems: 'flex-start',
  },
  pileWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  pileLabel: {
    color: '#ffffffbb',
    fontSize: 12,
    letterSpacing: 1,
  },
  stackContainer: {
    position: 'relative',
    width: CARD_W + 6,
    height: CARD_H + 6,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  shadowCard: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    backgroundColor: '#1a237e',
    borderWidth: 1.5,
    borderColor: '#3949ab',
  },
  emptyPile: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff33',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#ffffff44',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
