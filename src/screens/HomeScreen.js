import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions, Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');

function CrownSvg({ size = 120 }) {
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 120 84">
      <Path d="M10,72 L10,44 L30,16 L60,44 L90,16 L110,44 L110,72 Z" fill="#ffd54f" stroke="#f9a825" strokeWidth={2} strokeLinejoin="round" />
      <Rect x={10} y={62} width={100} height={14} rx={4} fill="#f9a825" />
      <Circle cx={30} cy={16} r={7} fill="#ef5350" stroke="#c62828" strokeWidth={1} />
      <Circle cx={60} cy={44} r={7} fill="#42a5f5" stroke="#1565c0" strokeWidth={1} />
      <Circle cx={90} cy={16} r={7} fill="#66bb6a" stroke="#2e7d32" strokeWidth={1} />
    </Svg>
  );
}

export default function HomeScreen({ players, onPlay, onRules, onResetCounts }) {
  const hasPlayers = players && players.length > 0;
  const totalCount = hasPlayers ? players.reduce((s, p) => s + p.count, 0) : 0;

  const handleReset = () => {
    Alert.alert('回数リセット', '全プレイヤーの累積回数を0にリセットしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'リセット', style: 'destructive', onPress: onResetCounts },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      <View style={styles.container}>
        {/* 王冠 */}
        <View style={styles.crownWrapper}>
          <CrownSvg size={SW * 0.40} />
        </View>

        {/* タイトル */}
        <Text style={styles.title}>King's Cup</Text>
        <Text style={styles.subtitle}>キングスカップ</Text>

        {/* 累積カウント表示 */}
        {hasPlayers && (
          <View style={styles.statsBox}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>📊 累積回数</Text>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>🔄 リセット</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.playerGrid}>
              {players.map(p => (
                <View key={p.id} style={styles.playerChip}>
                  <Text style={styles.playerChipId}>{p.id}</Text>
                  <Text style={styles.playerChipCount}>{p.count}</Text>
                </View>
              ))}
            </View>
            {totalCount > 0 && (
              <Text style={styles.statsSub}>合計 {totalCount} 回</Text>
            )}
          </View>
        )}

        {/* ルール紹介 */}
        {!hasPlayers && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>52枚のカードを1枚ずつめくり、{'\n'}カードのルールに従ってプレイ！</Text>
          </View>
        )}

        {/* ボタン */}
        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.85}>
            <Text style={styles.playButtonText}>🃏  ゲーム開始</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rulesButton} onPress={onRules} activeOpacity={0.85}>
            <Text style={styles.rulesButtonText}>✏️  ルールを編集</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>※ お酒は20歳になってから</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0d1b2a' },
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  crownWrapper: { marginBottom: 4 },
  title:       { color: '#ffd54f', fontSize: 40, fontWeight: 'bold', letterSpacing: 3, textShadowColor: '#f9a82580', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  subtitle:    { color: '#ffffff88', fontSize: 16, letterSpacing: 4, marginTop: -8 },

  statsBox:    { width: '100%', backgroundColor: '#ffffff0e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ffffff18' },
  statsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statsTitle:  { color: '#ffffffcc', fontSize: 14, fontWeight: '600' },
  resetBtn:    { backgroundColor: '#ffffff14', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  resetBtnText: { color: '#ffd54fcc', fontSize: 12, fontWeight: '600' },
  playerGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip:  { backgroundColor: '#ffffff14', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff1a', minWidth: 52 },
  playerChipId: { color: '#ffd54f', fontSize: 14, fontWeight: 'bold' },
  playerChipCount: { color: '#ffffffaa', fontSize: 18, fontWeight: 'bold' },
  statsSub:    { color: '#ffffff44', fontSize: 11, textAlign: 'right', marginTop: 10 },

  infoBox:     { backgroundColor: '#ffffff0e', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14, borderWidth: 1, borderColor: '#ffffff18' },
  infoText:    { color: '#ffffffaa', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  buttonArea:      { width: '100%', gap: 12, marginTop: 4 },
  playButton:      { backgroundColor: '#ffd54f', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#ffd54f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  playButtonText:  { color: '#0d1b2a', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  rulesButton:     { backgroundColor: 'transparent', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#ffffff33' },
  rulesButtonText: { color: '#ffffffcc', fontSize: 16, letterSpacing: 0.5 },
  footer:      { color: '#ffffff33', fontSize: 11, marginTop: 8 },
});
