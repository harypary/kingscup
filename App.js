import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRules }   from './src/hooks/useRules';
import { usePlayers } from './src/hooks/usePlayers';
import HomeScreen        from './src/screens/HomeScreen';
import PlayerSetupScreen from './src/screens/PlayerSetupScreen';
import GameScreen        from './src/screens/GameScreen';
import RuleEditScreen    from './src/screens/RuleEditScreen';
import ResultScreen      from './src/screens/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState('home');

  const {
    rules, updateRule, resetRules, resetSingleRule, loaded: rulesLoaded,
    useJoker, jokerRule, updateJokerSettings,
  } = useRules();

  const {
    players, unlockLevel, maxPlayers, loaded: playersLoaded,
    setPlayerConfig, addDrink, addDrinkMany, resetCounts, unlockMore,
  } = usePlayers();

  if (!rulesLoaded || !playersLoaded) {
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
          players={players}
          onPlay={() => setScreen('setup')}
          onRules={() => setScreen('rules')}
          onResetCounts={resetCounts}
        />
      )}
      {screen === 'setup' && (
        <PlayerSetupScreen
          unlockLevel={unlockLevel}
          maxPlayers={maxPlayers}
          onBack={() => setScreen('home')}
          onStart={(config) => { setPlayerConfig(config); setScreen('game'); }}
          unlockMore={unlockMore}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          rules={rules}
          useJoker={useJoker}
          jokerRule={jokerRule}
          players={players}
          addDrinkMany={addDrinkMany}
          onBack={() => setScreen('home')}
          onGameOver={() => setScreen('result')}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          players={players}
          onPlayAgain={() => setScreen('setup')}
          onHome={() => setScreen('home')}
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
  loading: { flex: 1, backgroundColor: '#0d1b2a', justifyContent: 'center', alignItems: 'center' },
});
