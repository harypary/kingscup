import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RULES } from '../data/rules';

const RULES_KEY  = '@kingscup_rules_v2';
const JOKER_KEY  = '@kingscup_joker_v1';

export function useRules() {
  const [rules,     setRules]     = useState(RULES);
  const [useJoker,  setUseJoker]  = useState(false);
  const [jokerRule, setJokerRule] = useState('');
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // ルール読み込み
        const savedRules = await AsyncStorage.getItem(RULES_KEY);
        if (savedRules) {
          const parsed = JSON.parse(savedRules);
          const merged = {};
          for (const key of Object.keys(RULES)) {
            merged[key] = { ...RULES[key], ...(parsed[key] || {}) };
          }
          setRules(merged);
        }
        // ジョーカー設定読み込み
        const savedJoker = await AsyncStorage.getItem(JOKER_KEY);
        if (savedJoker) {
          const { useJoker: uj, jokerRule: jr } = JSON.parse(savedJoker);
          setUseJoker(uj  ?? false);
          setJokerRule(jr ?? '');
        }
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  async function updateRule(cardValue, fields) {
    const next = { ...rules, [cardValue]: { ...rules[cardValue], ...fields } };
    setRules(next);
    try { await AsyncStorage.setItem(RULES_KEY, JSON.stringify(next)); } catch (_) {}
  }

  async function resetRules() {
    setRules(RULES);
    try { await AsyncStorage.removeItem(RULES_KEY); } catch (_) {}
  }

  async function resetSingleRule(cardValue) {
    const next = { ...rules, [cardValue]: RULES[cardValue] };
    setRules(next);
    try { await AsyncStorage.setItem(RULES_KEY, JSON.stringify(next)); } catch (_) {}
  }

  async function updateJokerSettings(newUseJoker, newJokerRule) {
    setUseJoker(newUseJoker);
    setJokerRule(newJokerRule);
    try {
      await AsyncStorage.setItem(JOKER_KEY, JSON.stringify({
        useJoker: newUseJoker,
        jokerRule: newJokerRule,
      }));
    } catch (_) {}
  }

  return { rules, updateRule, resetRules, resetSingleRule, loaded, useJoker, jokerRule, updateJokerSettings };
}
