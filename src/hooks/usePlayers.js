import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYERS_KEY = '@kingscup_players_v2';
const UNLOCK_KEY  = '@kingscup_unlock_v1';

export const ALL_PLAYER_IDS = ['A','B','C','D','E','F','G','H','I','J'];

// 解放レベルに対応する最大人数
export function getMaxPlayers(level) {
  if (level >= 2) return 10;
  if (level >= 1) return 8;
  return 5;
}

export function usePlayers() {
  const [players,     setPlayersState] = useState([]);
  const [unlockLevel, setUnlockLevel]  = useState(0);
  const [loaded,      setLoaded]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sp = await AsyncStorage.getItem(PLAYERS_KEY);
        if (sp) setPlayersState(JSON.parse(sp));
        const su = await AsyncStorage.getItem(UNLOCK_KEY);
        if (su) setUnlockLevel(Number(JSON.parse(su)) || 0);
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  const savePlayers = useCallback(async (next) => {
    try { await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(next)); } catch (_) {}
  }, []);

  // 新ゲーム開始時に設定（カウントは既存を引き継ぐ）
  const setPlayerConfig = useCallback((config) => {
    setPlayersState(prev => {
      const next = config.map(({ id, gender }) => {
        const existing = prev.find(p => p.id === id);
        return { id, gender, count: existing?.count ?? 0 };
      });
      savePlayers(next);
      return next;
    });
  }, [savePlayers]);

  // 1人飲んだ
  const addDrink = useCallback((id) => {
    setPlayersState(prev => {
      const next = prev.map(p => p.id === id ? { ...p, count: p.count + 1 } : p);
      savePlayers(next);
      return next;
    });
  }, [savePlayers]);

  // 全員のカウントをリセット
  const resetCounts = useCallback(() => {
    setPlayersState(prev => {
      const next = prev.map(p => ({ ...p, count: 0 }));
      savePlayers(next);
      return next;
    });
  }, [savePlayers]);

  // 人数上限を1段階解放
  const unlockMore = useCallback(async () => {
    const next = Math.min(unlockLevel + 1, 2);
    setUnlockLevel(next);
    try { await AsyncStorage.setItem(UNLOCK_KEY, JSON.stringify(next)); } catch (_) {}
  }, [unlockLevel]);

  const maxPlayers = getMaxPlayers(unlockLevel);

  return { players, unlockLevel, maxPlayers, loaded, setPlayerConfig, addDrink, resetCounts, unlockMore };
}
