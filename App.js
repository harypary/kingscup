import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRules } from './src/hooks/useRules';
import HomeScreen     from './src/screens/HomeScreen';
import GameScreen     from './src/screens/GameScreen';
import RuleEditScreen from './src/screens/RuleEditScreen';

export default function App() {
  const [screen, setScreen] = useState('home');

  const {
    rules, updateRule, resetRules, resetSingleRule, loaded,
    useJoker, jokerRule, updateJokerSettings,
  } = useRules();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ffd54f" />
      </View>
    );
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onPlay={() => setScreen('game')}
          onRules={() => setScreen('rules')}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          rules={rules}
          useJoker={useJoker}
          jokerRule={jokerRule}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'rules' && (
        <RuleEditScreen
          rules={rules}
          onUpdate={updateRule}
          onReset={resetRules}
          onResetSingle={resetSingleRule}
          onBack={() => setScreen('home')}
          useJoker={useJoker}
          jokerRule={jokerRule}
          onUpdateJoker={updateJokerSettings}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: '#0d1b2a',
    justifyContent: 'center', alignItems: 'center',
  },
});
