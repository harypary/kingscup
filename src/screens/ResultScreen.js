import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRewardedAd, AD_UNITS } from '../hooks/useAds';

export default function ResultScreen({ players, onPlayAgain, onHome }) {
  const [adLoading, setAdLoading] = React.useState(false);
  const { show: showPlayAgainAd } = useRewardedAd(AD_UNITS.PLAY_AGAIN_REW);

  const sorted   = [...players].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 0;
  const medals   = ['🥇', '🥈', '🥉'];

  const handlePlayAgain = () => {
    setAdLoading(true);
    showPlayAgainAd(
      () => { setAdLoading(false); onPlayAgain(); },
      () => { setAdLoading(false); onPlayAgain(); }, // スキップでも遷移
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {adLoading && (
        <View style={styles.adOverlay}>
          <ActivityIndicator size="large" color="#ffd54f" />
          <Text style={styles.adOverlayText}>広告を読み込み中...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>🏆</Text>
        <Text style={styles.title}>ゲーム終了！</Text>
        <Text style={styles.sub}>指名された回数ランキング</Text>

        <View style={styles.list}>
          {sorted.map((p, i) => {
            const isTop    = i === 0 && p.count > 0;
            const barWidth = maxCount > 0 ? (p.count / maxCount) * 100 : 0;
            const genderEmoji = p.gender === 'male' ? '♂️' : p.gender === 'female' ? '♀️' : '';
            return (
              <View key={p.id} style={[styles.rankRow, isTop && styles.rankRowTop]}>
                <Text style={styles.medal}>{medals[i] ?? `${i + 1}.`}</Text>
                <View style={[styles.badge, isTop && styles.badgeTop]}>
                  <Text style={[styles.badgeText, isTop && styles.badgeTextTop]}>{p.id}</Text>
                </View>
                {genderEmoji ? <Text style={styles.genderEmoji}>{genderEmoji}</Text> : null}
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${barWidth}%` }, isTop && styles.barTop]} />
                </View>
                <Text style={[styles.countText, isTop && styles.countTextTop]}>{p.count}回</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain} disabled={adLoading} activeOpacity={0.85}>
          <Text style={styles.playAgainText}>🔄  もう一度プレイ</Text>
        </TouchableOpacity>
        <Text style={styles.adNote}>※ 広告視聴後にプレイヤー設定画面へ</Text>

        <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>🏠  ホームへ</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0d1b2a' },
  adOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000cc', zIndex: 999, justifyContent: 'center', alignItems: 'center', gap: 16 },
  adOverlayText: { color: '#ffffff99', fontSize: 14 },
  content:       { paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  icon:          { fontSize: 64, marginBottom: 12 },
  title:         { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  sub:           { color: '#ffffff66', fontSize: 14, letterSpacing: 1, marginBottom: 28 },
  list:          { width: '100%', gap: 10 },
  rankRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff0d', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#ffffff14', gap: 8 },
  rankRowTop:    { backgroundColor: '#ffd54f18', borderColor: '#ffd54f44' },
  medal:         { width: 28, fontSize: 20, textAlign: 'center' },
  badge:         { width: 34, height: 34, borderRadius: 8, backgroundColor: '#ffffff15', alignItems: 'center', justifyContent: 'center' },
  badgeTop:      { backgroundColor: '#ffd54f33' },
  badgeText:     { color: 'white', fontSize: 16, fontWeight: 'bold' },
  badgeTextTop:  { color: '#ffd54f' },
  genderEmoji:   { fontSize: 14 },
  barContainer:  { flex: 1, height: 8, backgroundColor: '#ffffff15', borderRadius: 4, overflow: 'hidden' },
  bar:           { height: '100%', backgroundColor: '#3949ab', borderRadius: 4 },
  barTop:        { backgroundColor: '#ffd54f' },
  countText:     { color: '#ffffffaa', fontSize: 14, fontWeight: '600', width: 36, textAlign: 'right' },
  countTextTop:  { color: '#ffd54f' },
  playAgainBtn:  { marginTop: 32, backgroundColor: '#ffd54f', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center', shadowColor: '#ffd54f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  playAgainText: { color: '#0d1b2a', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  adNote:        { color: '#ffffff44', fontSize: 11, marginTop: 8 },
  homeBtn:       { marginTop: 12, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: '#ffffff33' },
  homeBtnText:   { color: '#ffffffcc', fontSize: 16 },
});
