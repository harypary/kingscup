export const SUITS  = ['♠', '♥', '♦', '♣'];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RULES = {
  A: {
    title: '他の全員が飲む 🍺',
    description: '引いた人以外が全員飲む。',
    color: '#1a73e8',
  },
  '2': {
    title: '指名する 👉',
    description: '引いた人が1人を指名して飲ませる。',
    color: '#e53935',
  },
  '3': {
    title: '自分が飲む 🙋',
    description: '引いた本人が飲む。',
    color: '#8e24aa',
  },
  '4': {
    title: '女性が飲む 🙋‍♀️',
    description: '女性全員が飲む。',
    color: '#c62828',
  },
  '5': {
    title: '左右が飲む ↔️',
    description: '引いた人の左右の人が飲む。',
    color: '#00897b',
  },
  '6': {
    title: '男性が飲む 🙋‍♂️',
    description: '男性全員が飲む。',
    color: '#1565c0',
  },
  '7': {
    title: '天井を指す ☝️',
    description: '全員が天井に指を指す。一番遅かった人が飲む。',
    color: '#f57f17',
  },
  '8': {
    title: 'パートナー 👫',
    description:
      '引いた本人が1人パートナーを決める。\n指名された人は引いた人が飲む時に一緒に飲む。逆に指名された人が飲む時も引いた人も一緒に飲む。',
    color: '#2e7d32',
  },
  '9': {
    title: 'ゲームを決める 🎮',
    description: '引いた人が好きなゲームを決める。負けた人が飲む。',
    color: '#6a1b9a',
  },
  '10': {
    title: '山手線ゲーム 🚃',
    description: '山手線ゲームをして、負けた人が飲む。',
    color: '#00695c',
  },
  J: {
    title: 'ルール作成 📜',
    description:
      '引いた人が好きなルールを1つ作る。\n例：カタカナ禁止、左手で飲む、など。\nそのルールを破った人が飲む。',
    color: '#e65100',
  },
  Q: {
    title: 'クエスチョンマスター ❓',
    description:
      '引いた人が「クエスチョンマスター」になる。\nクエスチョンマスターの質問に答えた人が飲む。\n次のQが出るまで有効。',
    color: '#ad1457',
  },
  K: {
    title: "キングスカップ 👑",
    description:
      '真ん中のコップに好きなだけ飲み物を注ぐ。\n4枚目のKを引いた人はコップを全部飲み干す！\nその時点でゲーム終了。',
    color: '#b71c1c',
  },
};

export function createDeck(useJoker = false) {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, id: `${value}${suit}` });
    }
  }
  if (useJoker) {
    deck.push({ suit: 'JOKER', value: 'JOKER', id: 'JOKER1' });
  }
  return shuffle(deck);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
