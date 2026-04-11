import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch,
  StyleSheet, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { RULES, VALUES } from '../data/rules';
import { useRewardedAd, AD_UNITS } from '../hooks/useAds';

function CardRow({ cardValue, rule, onPress }) {
  return (
    <TouchableOpacity style={styles.cardRow} onPress={() => onPress(cardValue)} activeOpacity={0.75}>
      <View style={[styles.cardBadge, { backgroundColor: rule.color + '33', borderColor: rule.color + '66' }]}>
        <Text style={[styles.cardBadgeText, { color: rule.color }]}>{cardValue}</Text>
      </View>
      <View style={styles.cardRowInfo}>
        <Text style={styles.cardRowTitle}>{rule.title}</Text>
        <Text style={styles.cardRowDesc} numberOfLines={1}>{rule.description}</Text>
      </View>
      <Text style={styles.editIcon}>›</Text>
    </TouchableOpacity>
  );
}

function EditModal({ cardValue, rule, onSave, onCancel, onResetSingle }) {
  const [title, setTitle] = useState(rule.title);
  const [desc,  setDesc]  = useState(rule.description);

  const defaultRule = RULES[cardValue];
  const isDefault =
    title.trim() === defaultRule.title.trim() &&
    desc.trim()  === defaultRule.description.trim();

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    onSave(cardValue, { title: title.trim(), description: desc.trim() });
  };

  const handleResetSingle = () => {
    Alert.alert(
      '標準に戻す',
      `「${cardValue}」のルールを初期設定に戻しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '戻す', style: 'destructive',
          onPress: () => {
            onResetSingle(cardValue);
            onCancel();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.modalOverlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
      <View style={[styles.modalCard, { borderTopColor: rule.color }]}>
        {/* ヘッダー */}
        <View style={styles.modalHeader}>
          <View style={[styles.modalBadge, { backgroundColor: rule.color }]}>
            <Text style={styles.modalBadgeText}>{cardValue}</Text>
          </View>
          <Text style={styles.modalHeaderTitle}>ルール編集</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelIconBtn}>
            <Text style={styles.cancelIconText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* タイトル */}
        <Text style={styles.fieldLabel}>タイトル</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="例: 全員が飲む 🍺"
          placeholderTextColor="#aaa"
          maxLength={40}
        />

        {/* 説明 */}
        <Text style={styles.fieldLabel}>ルール説明</Text>
        <TextInput
          style={styles.descInput}
          value={desc}
          onChangeText={setDesc}
          placeholder="ルールの説明を入力..."
          placeholderTextColor="#aaa"
          multiline
          maxLength={200}
          textAlignVertical="top"
        />

        {/* 標準に戻す */}
        <TouchableOpacity
          style={[styles.resetSingleBtn, isDefault && styles.resetSingleBtnDisabled]}
          onPress={handleResetSingle}
          disabled={isDefault}
        >
          <Text style={[styles.resetSingleText, isDefault && styles.resetSingleTextDisabled]}>
            🔄  このカードを標準に戻す
          </Text>
        </TouchableOpacity>

        {/* ボタン */}
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: rule.color }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function RuleEditScreen({
  rules, onUpdate, onReset, onResetSingle, onBack,
  useJoker, jokerRule, onUpdateJoker,
}) {
  const [editing, setEditing]           = useState(null);
  const [jokerText, setJokerText]       = useState(jokerRule);
  const [jokerEnabled, setJokerEnabled] = useState(useJoker);
  const [rulesUnlocked, setRulesUnlocked] = useState(false); // セッション中の編集解放フラグ
  const [adLoading, setAdLoading]         = useState(false);

  // ── リワード広告フック（用途別に個別ユニット） ────────────────────
  const { show: showRulesAd } = useRewardedAd(AD_UNITS.RULES_REW);
  const { show: showJokerAd } = useRewardedAd(AD_UNITS.JOKER_REW);

  // ── カード行タップ: 解放済みなら即開く / 未解放なら広告 ─────────────
  const handleCardPress = useCallback((cardValue) => {
    if (rulesUnlocked) {
      setEditing(cardValue);
      return;
    }
    Alert.alert(
      '📺  広告を見てルールを編集',
      '動画広告を視聴するとこのセッション中は\nすべてのルールを自由に編集できます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '広告を見る', onPress: () => {
            setAdLoading(true);
            showRulesAd(
              () => {  // 報酬獲得 → 解放
                setAdLoading(false);
                setRulesUnlocked(true);
                setEditing(cardValue);
              },
              () => {  // スキップ/キャンセル
                setAdLoading(false);
                Alert.alert('広告', '動画を最後まで視聴するとルールを編集できます。');
              },
            );
          },
        },
      ]
    );
  }, [rulesUnlocked, showRulesAd]);

  // ── ジョーカートグル: ON にするときだけ広告 ──────────────────────
  const handleJokerToggle = useCallback((val) => {
    if (val && !jokerEnabled) {
      // OFF → ON: 広告を見る
      Alert.alert(
        '🃏  ジョーカー解放',
        '広告を視聴するとジョーカーが使えるようになります。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '広告を見る', onPress: () => {
              setAdLoading(true);
              showJokerAd(
                () => {  // 報酬獲得
                  setAdLoading(false);
                  setJokerEnabled(true);
                  onUpdateJoker(true, jokerText);
                },
                () => {  // スキップ
                  setAdLoading(false);
                  Alert.alert('広告', '動画を最後まで視聴するとジョーカーが使えます。');
                },
              );
            },
          },
        ]
      );
    } else {
      // ON → OFF はそのまま
      setJokerEnabled(val);
      onUpdateJoker(val, jokerText);
    }
  }, [jokerEnabled, jokerText, showJokerAd, onUpdateJoker]);

  const handleSave = useCallback((cardValue, fields) => {
    onUpdate(cardValue, fields);
    setEditing(null);
  }, [onUpdate]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'デフォルトに戻す',
      '全てのルールを初期設定に戻しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'リセット', style: 'destructive', onPress: onReset },
      ]
    );
  }, [onReset]);

  const handleJokerTextBlur = useCallback(() => {
    onUpdateJoker(jokerEnabled, jokerText);
  }, [jokerEnabled, jokerText, onUpdateJoker]);

  const editingRule = editing ? rules[editing] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {/* 広告ロード中オーバーレイ */}
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
        <Text style={styles.headerTitle}>ルール編集</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>全リセット</Text>
        </TouchableOpacity>
      </View>

      {/* 解放状態バナー */}
      {rulesUnlocked ? (
        <View style={styles.unlockedBanner}>
          <Text style={styles.unlockedText}>✅  このセッション中は自由に編集できます</Text>
        </View>
      ) : (
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedText}>📺  カードをタップ → 広告視聴で編集解放</Text>
        </View>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ジョーカー設定 */}
        <View style={styles.jokerSection}>
          <View style={styles.jokerToggleRow}>
            <View>
              <Text style={styles.jokerLabel}>🃏  ジョーカーを使用する</Text>
              {!jokerEnabled && (
                <Text style={styles.jokerAdHint}>📺 広告視聴で解放</Text>
              )}
            </View>
            <Switch
              value={jokerEnabled}
              onValueChange={handleJokerToggle}
              trackColor={{ false: '#334', true: '#3949ab' }}
              thumbColor={jokerEnabled ? '#90caf9' : '#888'}
              disabled={adLoading}
            />
          </View>

          {jokerEnabled && (
            <>
              <Text style={styles.jokerFieldLabel}>ジョーカーのルール（省略可）</Text>
              <TextInput
                style={styles.jokerInput}
                value={jokerText}
                onChangeText={setJokerText}
                onBlur={handleJokerTextBlur}
                placeholder="省略すると「全員が飲む」が適用されます"
                placeholderTextColor="#ffffff44"
                multiline
                maxLength={150}
                textAlignVertical="top"
              />
              <Text style={styles.jokerHint}>空白の場合：全員が飲む（デフォルト）</Text>
            </>
          )}
        </View>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>カードルール（タップで編集）</Text>
        </View>

        {VALUES.map(v => (
          <CardRow
            key={v}
            cardValue={v}
            rule={rules[v]}
            onPress={handleCardPress}
          />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {editing && editingRule && (
        <View style={StyleSheet.absoluteFill}>
          <EditModal
            cardValue={editing}
            rule={editingRule}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            onResetSingle={onResetSingle}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1b2a' },

  // 広告ロード中オーバーレイ
  adOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000cc', zIndex: 999,
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  adOverlayText: { color: '#ffffff99', fontSize: 14 },

  // 解放状態バナー
  unlockedBanner: {
    backgroundColor: '#1b5e2044', borderRadius: 8, marginHorizontal: 16,
    paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#2e7d3266',
  },
  unlockedText: { color: '#66bb6a', fontSize: 12, textAlign: 'center' },
  lockedBanner: {
    backgroundColor: '#ffffff08', borderRadius: 8, marginHorizontal: 16,
    paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#ffffff14',
  },
  lockedText: { color: '#ffffff66', fontSize: 12, textAlign: 'center' },

  jokerAdHint: { color: '#ffd54f88', fontSize: 11, marginTop: 2 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn:     { padding: 6 },
  backText:    { color: '#90caf9', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resetBtn:    { padding: 6 },
  resetText:   { color: '#ef9a9a', fontSize: 13 },
  subTitle:    { color: '#ffffff55', fontSize: 12, textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 },

  list:        { flex: 1 },
  listContent: { paddingHorizontal: 16 },

  // ジョーカーセクション
  jokerSection: {
    backgroundColor: '#ffffff0d', borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#3949ab44',
  },
  jokerToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jokerLabel: { color: 'white', fontSize: 15, fontWeight: '600' },
  jokerFieldLabel: { color: '#ffffff88', fontSize: 12, letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  jokerInput: {
    backgroundColor: '#ffffff12', borderRadius: 10, padding: 12,
    color: 'white', fontSize: 13, borderWidth: 1, borderColor: '#ffffff22',
    minHeight: 72, lineHeight: 20,
  },
  jokerHint: { color: '#ffffff44', fontSize: 11, marginTop: 6, textAlign: 'right' },

  sectionLabel:     { marginBottom: 10 },
  sectionLabelText: { color: '#ffffff55', fontSize: 12, letterSpacing: 1 },

  // カード行
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff0d', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#ffffff14', gap: 14,
  },
  cardBadge: {
    width: 42, height: 42, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  cardBadgeText: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif' },
  cardRowInfo:   { flex: 1 },
  cardRowTitle:  { color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardRowDesc:   { color: '#ffffff66', fontSize: 12 },
  editIcon:      { color: '#ffffff44', fontSize: 22 },

  // 編集モーダル
  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#1a2a3a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, borderTopWidth: 3,
  },
  modalHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalBadge:       { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBadgeText:   { color: 'white', fontSize: 18, fontWeight: 'bold', fontFamily: 'serif' },
  modalHeaderTitle: { flex: 1, color: 'white', fontSize: 18, fontWeight: 'bold' },
  cancelIconBtn:    { padding: 6 },
  cancelIconText:   { color: '#ffffff66', fontSize: 18 },

  fieldLabel: { color: '#ffffff88', fontSize: 12, letterSpacing: 1, marginBottom: 6, marginTop: 8 },
  titleInput: {
    backgroundColor: '#ffffff12', borderRadius: 10, padding: 14,
    color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#ffffff22', marginBottom: 4,
  },
  descInput: {
    backgroundColor: '#ffffff12', borderRadius: 10, padding: 14,
    color: 'white', fontSize: 14, borderWidth: 1, borderColor: '#ffffff22',
    minHeight: 100, lineHeight: 22,
  },

  // 標準に戻すボタン
  resetSingleBtn: {
    marginTop: 14, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, borderWidth: 1, borderColor: '#ef9a9a44',
    alignItems: 'center', backgroundColor: '#ef9a9a11',
  },
  resetSingleBtnDisabled: {
    borderColor: '#ffffff14', backgroundColor: 'transparent',
  },
  resetSingleText:         { color: '#ef9a9a', fontSize: 13 },
  resetSingleTextDisabled: { color: '#ffffff22' },

  modalButtons:  { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#ffffff33', alignItems: 'center',
  },
  cancelBtnText: { color: '#ffffffaa', fontSize: 15 },
  saveBtn:       { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText:   { color: 'white', fontSize: 15, fontWeight: 'bold' },
});
