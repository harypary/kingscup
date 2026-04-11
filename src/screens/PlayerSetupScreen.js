import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRewardedAd, AD_UNITS } from '../hooks/useAds';
import { ALL_PLAYER_IDS } from '../hooks/usePlayers';

export default function PlayerSetupScreen({ unlockLevel, maxPlayers, onStart, onBack, unlockMore }) {
  const [count,     setCount]     = useState(Math.min(4, maxPlayers));
  const [genders,   setGenders]   = useState({});
  const [names,     setNames]     = useState({});
  const [adLoading, setAdLoading] = useState(false);

  const { show: showLv1Ad } = useRewardedAd(AD_UNITS.RULES_REW);
  const { show: showLv2Ad } = useRewardedAd(AD_UNITS.JOKER_REW);

  const handleCountPress = useCallback((n) => {
    if (n <= maxPlayers) { setCount(n); return; }
    const targetLevel = n <= 8 ? 1 : 2;
    if (targetLevel > unlockLevel + 1) {
      Alert.alert('順番に解放が必要です', 'まず広告を見て8人まで解放してください。');
      return;
    }
    const limitLabel = n <= 8 ? '8人' : '10人';
    const showAd     = targetLevel === 1 ? showLv1Ad : showLv2Ad;
    Alert.alert(
      '📺  広告を見てプレイヤーを追加',
      `広告を視聴すると${limitLabel}まで追加できます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '広告を見る', onPress: () => {
            setAdLoading(true);
            showAd(
              () => { setAdLoading(false); unlockMore(); setCount(n); },
              () => { setAdLoading(false); Alert.alert('広告', '動画を最後まで視聴するとプレイ人数を増やせます。'); },
            );
          },
        },
      ]
    );
  }, [maxPlayers, unlockLevel, showLv1Ad, showLv2Ad, unlockMore]);

  const handleStart = useCallback(() => {
    const config = ALL_PLAYER_IDS.slice(0, count).map(id => ({
      id,
      name:   names[id] || '',
      gender: genders[id] || 'none',
    }));
    onStart(config);
  }, [count, names, genders, onStart]);

  const selectedIds = ALL_PLAYER_IDS.slice(0, count);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {adLoading && (
        <View style={styles.adOverlay}>
          <ActivityIndicator size="large" color="#ffd54f" />
          <Text style={styles.adOverlayText}>広告を読み込み中...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥  プレイヤー設定</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 人数選択 */}
        <Text style={styles.sectionLabel}>参加人数</Text>
        <View style={styles.countGrid}>
          {[2,3,4,5,6,7,8,9,10].map(n => {
            const isSelected = count === n;
            const isLocked   = n > maxPlayers;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.countBtn, isSelected && styles.countBtnSelected, isLocked && styles.countBtnLocked]}
                onPress={() => handleCountPress(n)}
                activeOpacity={0.75}
              >
                <Text style={[styles.countBtnText, isSelected && styles.countBtnTextSel, isLocked && styles.countBtnTextLocked]}>
                  {n}
                </Text>
                {isLocked && <Text style={styles.lockLabel}>{n <= 8 ? '🔒' : '🔒🔒'}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {unlockLevel < 2 && (
          <Text style={styles.unlockHint}>
            {unlockLevel === 0
              ? '🔒 広告視聴で8人まで・さらに10人まで増やせます'
              : '🔒 広告視聴でさらに2人追加できます'}
          </Text>
        )}

        {/* 名前・性別設定 */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>名前と性別（任意）</Text>
        {selectedIds.map(id => {
          const gender = genders[id] || 'none';
          return (
            <View key={id} style={styles.playerRow}>
              {/* ID バッジ */}
              <View style={styles.playerBadge}>
                <Text style={styles.playerBadgeText}>{id}</Text>
              </View>

              {/* 名前入力 */}
              <TextInput
                style={styles.nameInput}
                value={names[id] || ''}
                onChangeText={v => setNames(prev => ({ ...prev, [id]: v }))}
                placeholder={`プレイヤー${id}`}
                placeholderTextColor="#ffffff33"
                maxLength={10}
                returnKeyType="done"
              />

              {/* 性別ボタン */}
              <View style={styles.genderToggle}>
                {/* 男性ボタン（青） */}
                <TouchableOpacity
                  style={[styles.genderBtn, styles.genderBtnMale, gender === 'male' && styles.genderBtnMaleOn]}
                  onPress={() => setGenders(prev => ({ ...prev, [id]: gender === 'male' ? 'none' : 'male' }))}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextOn]}>♂</Text>
                </TouchableOpacity>

                {/* 女性ボタン（赤） */}
                <TouchableOpacity
                  style={[styles.genderBtn, styles.genderBtnFemale, gender === 'female' && styles.genderBtnFemaleOn]}
                  onPress={() => setGenders(prev => ({ ...prev, [id]: gender === 'female' ? 'none' : 'female' }))}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextOn]}>♀</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* スタート */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>🃏  ゲーム開始</Text>
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
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:       { padding: 6 },
  backText:      { color: '#90caf9', fontSize: 14 },
  headerTitle:   { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content:       { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel:  { color: '#ffffff66', fontSize: 12, letterSpacing: 1, marginBottom: 12 },

  countGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countBtn:           { width: 66, height: 66, borderRadius: 14, backgroundColor: '#ffffff10', borderWidth: 1.5, borderColor: '#ffffff18', alignItems: 'center', justifyContent: 'center' },
  countBtnSelected:   { backgroundColor: '#ffd54f22', borderColor: '#ffd54f' },
  countBtnLocked:     { backgroundColor: '#ffffff06', borderColor: '#ffffff0a' },
  countBtnText:       { color: 'white', fontSize: 22, fontWeight: 'bold' },
  countBtnTextSel:    { color: '#ffd54f' },
  countBtnTextLocked: { color: '#ffffff33' },
  lockLabel:          { color: '#ffffff44', fontSize: 10, marginTop: 2 },
  unlockHint:         { color: '#ffd54f66', fontSize: 12, marginTop: 10, textAlign: 'center', lineHeight: 18 },

  playerRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff0d', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ffffff14', gap: 10 },
  playerBadge:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffd54f22', borderWidth: 1, borderColor: '#ffd54f44', alignItems: 'center', justifyContent: 'center' },
  playerBadgeText: { color: '#ffd54f', fontSize: 15, fontWeight: 'bold' },

  nameInput: {
    flex: 1, color: 'white', fontSize: 14,
    backgroundColor: '#ffffff10', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: '#ffffff20',
  },

  genderToggle: { flexDirection: 'row', gap: 6 },

  genderBtn:        { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  genderBtnText:    { fontSize: 16 },
  genderBtnTextOn:  { color: 'white' },

  // 男性ボタン（青）
  genderBtnMale:    { backgroundColor: '#1565c011', borderColor: '#1565c055' },
  genderBtnMaleOn:  { backgroundColor: '#1565c0',   borderColor: '#1565c0'   },

  // 女性ボタン（赤）
  genderBtnFemale:   { backgroundColor: '#c6282811', borderColor: '#c6282855' },
  genderBtnFemaleOn: { backgroundColor: '#c62828',   borderColor: '#c62828'   },

  startBtn:     { marginTop: 28, backgroundColor: '#ffd54f', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#ffd54f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnText: { color: '#0d1b2a', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});
