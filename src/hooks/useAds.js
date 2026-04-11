/**
 * useAds.js — 広告管理フック（クラッシュ完全対策版）
 * ─────────────────────────────────────────────────────────────────
 * ・MobileAds().initialize() を起動時に必ず呼ぶ
 * ・createAndLoad / show の全操作を try/catch で保護
 * ・Expo Go では即 onDone / onCancelled にフォールバック
 * ─────────────────────────────────────────────────────────────────
 */
import { useCallback, useEffect, useRef } from 'react';

// ── 本番 広告ユニット ID ────────────────────────────────────────
export const AD_UNITS = {
  K_INTER:         'ca-app-pub-8388601065600220/1757224434',
  RULES_REW:       'ca-app-pub-8388601065600220/8131061095',
  JOKER_REW:       'ca-app-pub-8388601065600220/5449057438',
  GAME_OVER_INTER: 'ca-app-pub-8388601065600220/8147576220',
  PLAY_AGAIN_REW:  'ca-app-pub-8388601065600220/3655893370',
};

// ── AdMob 初期化（モジュールロード時に1回だけ実行） ──────────────
let AdMobModule = null;
let adsReady    = false;

try {
  const mod = require('react-native-google-mobile-ads');
  if (mod && mod.MobileAds) {
    AdMobModule = mod;
    // SDK 初期化 ── これをしないと createForAdRequest がクラッシュする
    mod.MobileAds()
      .initialize()
      .then(() => { adsReady = true; })
      .catch(() => { adsReady = false; });
  }
} catch (_) {
  // Expo Go など native build でない場合はスキップ
}

const AD_CONFIG = { requestNonPersonalizedAdsOnly: true };

// サブスクリプションを安全に解除するヘルパー
function safeUnsub(fn) {
  try { if (typeof fn === 'function') fn(); } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────
// インタースティシャル広告フック
// ─────────────────────────────────────────────────────────────────
export function useInterstitialAd(adUnitId) {
  const adRef    = useRef(null);
  const isLoaded = useRef(false);
  const subs     = useRef([]);

  const cleanup = useCallback(() => {
    subs.current.forEach(safeUnsub);
    subs.current = [];
  }, []);

  const createAndLoad = useCallback(() => {
    if (!AdMobModule) return;
    try {
      cleanup();
      const { InterstitialAd, AdEventType } = AdMobModule;
      if (!InterstitialAd || !AdEventType) return;

      const ad = InterstitialAd.createForAdRequest(adUnitId, AD_CONFIG);
      adRef.current    = ad;
      isLoaded.current = false;

      subs.current.push(
        ad.addAdEventListener(AdEventType.LOADED, () => { isLoaded.current = true; }),
        ad.addAdEventListener(AdEventType.ERROR,  () => { isLoaded.current = false; }),
      );
      ad.load();
    } catch (_) {
      // 広告ロード失敗は無視（ゲームは続行）
    }
  }, [adUnitId, cleanup]);

  useEffect(() => {
    // MobileAds 初期化完了を待ってからロード
    const t = setTimeout(createAndLoad, 1500);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, [createAndLoad, cleanup]);

  const show = useCallback((onDone) => {
    if (!AdMobModule || !isLoaded.current || !adRef.current) {
      onDone?.();
      return;
    }
    try {
      const { AdEventType } = AdMobModule;
      if (!AdEventType) { onDone?.(); return; }

      const unsub = adRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        safeUnsub(unsub);
        onDone?.();
        createAndLoad();
      });

      const p = adRef.current.show();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          safeUnsub(unsub);
          onDone?.();
          createAndLoad();
        });
      }
    } catch (_) {
      onDone?.();
    }
  }, [createAndLoad]);

  return { show };
}

// ─────────────────────────────────────────────────────────────────
// リワード広告フック
// ─────────────────────────────────────────────────────────────────
export function useRewardedAd(adUnitId) {
  const adRef    = useRef(null);
  const isLoaded = useRef(false);
  const subs     = useRef([]);

  const cleanup = useCallback(() => {
    subs.current.forEach(safeUnsub);
    subs.current = [];
  }, []);

  const createAndLoad = useCallback(() => {
    if (!AdMobModule) return;
    try {
      cleanup();
      const { RewardedAd, RewardedAdEventType, AdEventType } = AdMobModule;
      if (!RewardedAd || !RewardedAdEventType || !AdEventType) return;

      const ad = RewardedAd.createForAdRequest(adUnitId, AD_CONFIG);
      adRef.current    = ad;
      isLoaded.current = false;

      subs.current.push(
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => { isLoaded.current = true; }),
        ad.addAdEventListener(RewardedAdEventType.ERROR,  () => { isLoaded.current = false; }),
      );
      ad.load();
    } catch (_) {
      // 広告ロード失敗は無視
    }
  }, [adUnitId, cleanup]);

  useEffect(() => {
    const t = setTimeout(createAndLoad, 1500);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, [createAndLoad, cleanup]);

  const show = useCallback((onRewarded, onCancelled) => {
    if (!AdMobModule || !isLoaded.current || !adRef.current) {
      // Apple審査時や在庫がない場合は、UXを損ねないためリワードを付与する
      onRewarded?.();
      return;
    }
    try {
      const { RewardedAdEventType, AdEventType } = AdMobModule;
      if (!RewardedAdEventType || !AdEventType) { onCancelled?.(); return; }

      let earned = false;

      const unsubReward = adRef.current.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD, () => { earned = true; }
      );
      const unsubClose = adRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        safeUnsub(unsubReward);
        safeUnsub(unsubClose);
        createAndLoad();
        if (earned) onRewarded?.();
        else        onCancelled?.();
      });

      const p = adRef.current.show();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          safeUnsub(unsubReward);
          safeUnsub(unsubClose);
          createAndLoad();
          onRewarded?.(); // 表示失敗時もリワード付与
        });
      }
    } catch (_) {
      onRewarded?.(); // 予期せぬエラーでもリワード付与
    }
  }, [createAndLoad]);

  return { show };
}
