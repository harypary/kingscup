import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Easing, StyleSheet,
  SafeAreaView, StatusBar, Alert, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { CardBack, CardFront } from '../components/PlayingCard';
import { createDeck } from '../data/rules';
import { useInterstitialAd, AD_UNITS } from '../hooks/useAds';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.min(SW * 0.52, 200);
const CARD_H = CARD_W * 1.4;

// カードに対応するプレイヤー選択モード
function getPlayerMode(cardValue) {
  if (cardValue === '2') return 'nominate';   // 全員から1人指名
  if (cardValue === '4') return 'female';     // 女性のみ
  if (cardValue === '5') return 'leftright';  // 左右2人
  if (cardValue === '6') return 'male';       // 男性のみ
  if (cardValue === '8') return 'partner';    // パートナー選択
  return null;
}

// プレイヤー選択UIコンポーネント
function PlayerSelector({ mode, players, selected, onToggle }) {
  let filtered = players;
  if (mode === 'female') filtered = players.filter(p => p.gender === 'female');
  if (mode === 'male')   filtered = players.filter(p => p.gender === 'male');
  if (filtered.length === 0) return null;

  const label = {
    nominate:  '誰を指名しますか？',
    female:    '女性プレイヤー（飲んだ人をタップ）',
    leftright: '左右の人（飲んだ人をタップ）',
    male:      '男性プレイヤー（飲んだ人をタップ）',
    partner:   'パートナーを選んでください',
  }[mode] || '';

  return (
    <View style={ps.wrap}>
      <Text style={ps.label}>{label}</Text>
      <View style={ps.grid}>
        {filtered.map(p => {
          const isOn = selected.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[ps.btn, isOn && ps.btnOn]}
              onPress={() => onToggle(p.id)}
              activeOpacity={0.75}
            >
              <Text style={[ps.txt, isOn && ps.txtOn]}>{p.id}</Text>
              {p.gender === 'male'   && <Text style={ps.gDot}>♂</Text>}
              {p.gender === 'female' && <Text style={ps.gDot}>♀</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  wrap: { marginTop: 16, marginBottom: 4, width: '100%' },
  label: { color: '#555', fontSize: 12, letterSpacing: 0.5, marginBottom: 10, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  btn:  { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f0f0f0', borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  btnOn: { backgroundColor: '#0d1b2a', borderColor: '#ffd54f' },
  txt:  { color: '#333', fontSize: 18, fontWeight: 'bold' },
  txtOn: { color: '#ffd54f' },
  gDot: { fontSize: 9, color: '#888', marginTop: 1 },
});

export default function GameScreen({ rules, useJoker, jokerRule, players, addDrink, onBack, onGameOver }) {
  const [deck,           setDeck]          = useState(() => createDeck(useJoker));
  const [currentCard,    setCurrentCard]   = useState(null);
  const [ruleVisible,    setRuleVisible]   = useState(false);
  const [flipping,       setFlipping]      = useState(false);
  const [kingCount,      setKingCount]     = useState(0);
  const [adLoading,      setAdLoading]     = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const flipAnim    = useRef(new Animated.Value(0)).current;
  const ruleOpacity = useRef(new Animated.Value(0)).current;

  const { show: showKAd }        = useInterstitialAd(AD_UNITS.K_INTER);
  const { show: showGameOverAd } = useInterstitialAd(AD_UNITS.GAME_OVER_INTER);

  const total = deck.length + (currentCard ? 1 : 0);

  const resetCardState = useCallback(() => {
    flipAnim.setValue(0);
    ruleOpacity.setValue(0);
    setFlipping(false);
    setRuleVisible(false);
    setCurrentCard(null);
    setSelectedPlayers([]);
  }, [flipAnim, ruleOpacity]);

  // ruleVisibleになったとき、性別カードは該当プレイヤーを自動選択
  useEffect(() => {
    if (!ruleVisible || !currentCard) return;
    const mode = getPlayerMode(currentCard.value);
    if (mode === 'female') {
      setSelectedPlayers(players.filter(p => p.gender === 'female').map(p => p.id));
    } else if (mode === 'male') {
      setSelectedPlayers(players.filter(p => p.gender === 'male').map(p => p.id));
    } else {
      setSelectedPlayers([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleVisible]);

  // プレイヤーボタンのトグル（パートナー・指名は1人のみ、他は複数可）
  const handleTogglePlayer = useCallback((id) => {
    const mode = getPlayerMode(currentCard?.value);
    if (mode === 'nominate' || mode === 'partner') {
      // 単一選択
      setSelectedPlayers(prev => prev.includes(id) ? [] : [id]);
    } else {
      // 複数選択
      setSelectedPlayers(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  }, [currentCard]);

  // カードをめくる
  const handleDraw = useCallback(() => {
    if (flipping || ruleVisible || deck.length === 0) return;
    const [top, ...rest] = deck;
    if (top.value === 'K') setKingCount(n => n + 1);
    setCurrentCard(top);
    setDeck(rest);
    setFlipping(true);

    Animated.sequence([
      Animated.timing(flipAnim, { toValue: 0.5, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(flipAnim, { toValue: 1,   duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        setRuleVisible(true);
        Animated.timing(ruleOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
      }, 1000);
    });
  }, [deck, flipping, ruleVisible, flipAnim, ruleOpacity]);

  // OKボタン
  const handleCloseRule = useCallback(() => {
    const isLastCard = deck.length === 0;
    const isKing     = currentCard?.value === 'K';

    // 選択されたプレイヤーの回数をカウント
    selectedPlayers.forEach(id => addDrink(id));
    setSelectedPlayers([]);

    const doReset = () => {
      Animated.timing(ruleOpacity, { toValue: 0, duration: 180, useNativeDriver: true })
        .start(() => resetCardState());
    };

    if (isLastCard) {
      setAdLoading(true);
      showGameOverAd(() => { setAdLoading(false); onGameOver(); });
    } else if (isKing) {
      setAdLoading(true);
      showKAd(() => { setAdLoading(false); doReset(); });
    } else {
      doReset();
    }
  }, [deck.length, currentCard, selectedPlayers, addDrink, ruleOpacity, resetCardState, showGameOverAd, showKAd, onGameOver]);

  // 戻るボタン（中断確認）
  const handleBack = useCallback(() => {
    Alert.alert('ゲームを中断', 'ホームに戻りますか？\n（回数記録は保持されます）', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '戻る', style: 'destructive', onPress: onBack },
    ]);
  }, [onBack]);

  // リセット
  const handleReset = useCallback(() => {
    Alert.alert('リセット', 'ゲームをリセットしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'リセット', style: 'destructive',
        onPress: () => { resetCardState(); setDeck(createDeck(useJoker)); setKingCount(0); },
      },
    ]);
  }, [resetCardState, useJoker]);

  // アニメーション補間
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg',   '90deg',  '90deg'] });
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-90deg', '-90deg', '0deg']  });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.45, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.55, 1], outputRange: [0, 0, 1, 1] });
  const cardLift  = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -16, 0] });
  const cardScale = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.07,  1] });

  const rule   = currentCard
    ? (currentCard.value === 'JOKER'
        ? { title: 'ジョーカー 🃏', description: jokerRule?.trim() || '全員が飲む！', color: '#37474f' }
        : rules[currentCard.value])
    : null;
  const isRed  = currentCard && (currentCard.suit === '♥' || currentCard.suit === '♦');
  const mode   = currentCard ? getPlayerMode(currentCard.value) : null;

  // プレイヤーUIを表示するか（性別カードは該当者がいる場合のみ）
  const showPlayerUI = (() => {
    if (!mode || players.length === 0) return false;
    if (mode === 'female') return players.some(p => p.gender === 'female');
    if (mode === 'male')   return players.some(p => p.gender === 'male');
    return true;
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />

      {adLoading && (
        <View style={styles.adOverlay}>
          <ActivityIndicator size="large" color="#ffd54f" />
          <Text style={styles.adOverlayText}>広告を読み込み中...</Text>
        </View>
      )}

      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>👑 King's Cup</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>リセット</Text>
          </TouchableOpacity>
        </View>

        {kingCount > 0 && (
          <View style={styles.kingBar}>
            <Text style={styles.kingText}>
              👑 King {kingCount}/4{kingCount === 4 ? '  🍺 飲め！' : ''}
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.main} scrollEnabled={ruleVisible} showsVerticalScrollIndicator={false}>
          <Text style={styles.deckCount}>{total} / {useJoker ? 53 : 52} 枚</Text>

          {/* カードエリア */}
          <View style={{ width: CARD_W + 12, height: CARD_H + 12 }}>
            {deck.length > 2 && <View style={[styles.shadowCard, { width: CARD_W, height: CARD_H, top: 0, left: 0 }]} />}
            {deck.length > 1 && <View style={[styles.shadowCard, { width: CARD_W, height: CARD_H, top: 3, left: 3 }]} />}
            {deck.length > 0 && (
              <TouchableOpacity onPress={handleDraw} disabled={flipping || ruleVisible} activeOpacity={0.88} style={{ position: 'absolute', top: 6, left: 6 }}>
                <CardBack width={CARD_W} height={CARD_H} />
              </TouchableOpacity>
            )}

            {currentCard && (
              <Animated.View style={{ position: 'absolute', top: 6, left: 6, width: CARD_W, height: CARD_H, transform: [{ translateY: cardLift }, { scale: cardScale }] }}>
                <Animated.View style={[{ position: 'absolute', width: CARD_W, height: CARD_H, backfaceVisibility: 'hidden' }, { opacity: backOpacity }, { transform: [{ perspective: 600 }, { rotateY: backRotate }] }]}>
                  <CardBack width={CARD_W} height={CARD_H} />
                </Animated.View>
                <Animated.View style={[{ position: 'absolute', width: CARD_W, height: CARD_H, backfaceVisibility: 'hidden' }, { opacity: frontOpacity }, { transform: [{ perspective: 600 }, { rotateY: frontRotate }] }]}>
                  <CardFront suit={currentCard.suit} value={currentCard.value} width={CARD_W} height={CARD_H} />
                </Animated.View>
              </Animated.View>
            )}
          </View>

          {/* ルールパネル */}
          {ruleVisible && rule && currentCard ? (
            <Animated.View style={[styles.rulePanel, { opacity: ruleOpacity }]}>
              <View style={styles.ruleCardRow}>
                {currentCard.value === 'JOKER' ? (
                  <Text style={styles.ruleCardValue}>🃏</Text>
                ) : currentCard.value === 'K' ? (
                  <Text style={[styles.ruleKingsLabel, { color: '#b71c1c' }]}>King's Cup</Text>
                ) : (
                  <>
                    <Text style={[styles.ruleCardValue, { color: isRed ? '#cc0000' : '#111' }]}>{currentCard.value}</Text>
                    <Text style={[styles.ruleCardSuit,  { color: isRed ? '#cc0000' : '#111' }]}>{currentCard.suit}</Text>
                  </>
                )}
              </View>

              <View style={[styles.ruleTitleBadge, { backgroundColor: rule.color }]}>
                <Text style={styles.ruleTitleText}>{rule.title}</Text>
              </View>

              <Text style={styles.ruleDesc}>{rule.description}</Text>

              {/* プレイヤー選択UI */}
              {showPlayerUI && (
                <PlayerSelector
                  mode={mode}
                  players={players}
                  selected={selectedPlayers}
                  onToggle={handleTogglePlayer}
                />
              )}

              <TouchableOpacity
                style={[styles.ruleOkBtn, { backgroundColor: rule.color }]}
                onPress={handleCloseRule}
                disabled={adLoading}
              >
                <Text style={styles.ruleOkText}>{currentCard.value === 'K' ? '👑  OK！' : 'OK！'}</Text>
              </TouchableOpacity>

              {(currentCard.value === 'K' || deck.length === 0) && (
                <Text style={styles.adNote}>※ OK後に広告が流れます</Text>
              )}
            </Animated.View>
          ) : (
            !flipping && <Text style={styles.hint}>山札をタップしてめくる</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0d1b2a' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  adOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000cc', zIndex: 999, justifyContent: 'center', alignItems: 'center', gap: 16 },
  adOverlayText: { color: '#ffffff99', fontSize: 14 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn:   { padding: 8 },
  backText:  { color: '#90caf9', fontSize: 14 },
  title:     { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  resetBtn:  { padding: 8 },
  resetText: { color: '#ef9a9a', fontSize: 13 },
  kingBar:   { backgroundColor: '#ffffff12', borderRadius: 100, paddingHorizontal: 20, paddingVertical: 6, alignSelf: 'center', marginBottom: 8 },
  kingText:  { color: '#ffd54f', fontSize: 14, fontWeight: '600' },
  main:      { alignItems: 'center', paddingTop: 36, paddingBottom: 40, flexGrow: 1 },
  deckCount: { color: '#ffffff66', fontSize: 13, letterSpacing: 1, marginBottom: 16 },
  shadowCard: { position: 'absolute', borderRadius: 12, backgroundColor: '#1a237e', borderWidth: 1.5, borderColor: '#3949ab' },
  hint:      { color: '#ffffff44', fontSize: 13, letterSpacing: 1, marginTop: 24 },
  rulePanel: { marginTop: 24, width: '100%', backgroundColor: '#fafafa', borderRadius: 20, padding: 22, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 },
  ruleCardRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  ruleCardValue:  { fontSize: 36, fontWeight: 'bold', fontFamily: 'serif' },
  ruleCardSuit:   { fontSize: 24 },
  ruleKingsLabel: { fontSize: 22, fontWeight: 'bold', fontFamily: 'serif', letterSpacing: 1, marginBottom: 2 },
  ruleTitleBadge: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 100, marginBottom: 12 },
  ruleTitleText:  { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  ruleDesc:       { color: '#333', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 4 },
  ruleOkBtn:      { marginTop: 16, paddingHorizontal: 48, paddingVertical: 13, borderRadius: 100 },
  ruleOkText:     { color: 'white', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  adNote:         { color: '#aaa', fontSize: 11, marginTop: 10 },
});
