import React from 'react';
import { Image } from 'react-native';
import Svg, {
  Rect, G, Line, Text as SvgText, Circle, ClipPath, Defs,
} from 'react-native-svg';
import { CARD_IMAGES } from '../data/cardImages';

/** カード表面（chicodeza 画像） */
export function CardFront({ suit, value, width, height }) {
  const key = suit === 'JOKER' ? 'JOKER' : `${suit}${value}`;
  const source = CARD_IMAGES[key];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width, height, resizeMode: 'contain' }}
    />
  );
}

/** カード裏面（SVG デザイン） */
export function CardBack({ width, height }) {
  const rx      = width * 0.08;
  const pad     = 8;
  const innerW  = width  - pad * 2;
  const innerH  = height - pad * 2;
  const innerRx = rx * 0.65;
  const spacing = 13; // 斜め格子の間隔

  // 斜め格子ラインの本数
  const count = Math.ceil((width + height) / spacing) + 4;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <ClipPath id="inner">
          <Rect x={pad} y={pad} width={innerW} height={innerH} rx={innerRx} />
        </ClipPath>
      </Defs>

      {/* 外枠（白いカード） */}
      <Rect
        x={0} y={0} width={width} height={height}
        rx={rx} fill="white" stroke="#cccccc" strokeWidth={1}
      />

      {/* ネイビー内エリア */}
      <Rect
        x={pad} y={pad} width={innerW} height={innerH}
        rx={innerRx} fill="#1a237e"
      />

      {/* 斜め格子パターン（内側クリップ） */}
      <G clipPath="url(#inner)">
        {Array.from({ length: count }, (_, i) => {
          const offset = i * spacing - height;
          return (
            <G key={i}>
              {/* ／方向 */}
              <Line
                x1={pad + offset}        y1={pad}
                x2={pad + offset + height} y2={pad + innerH}
                stroke="#3949ab" strokeWidth={1} opacity={0.55}
              />
              {/* ＼方向 */}
              <Line
                x1={pad + innerW - offset}        y1={pad}
                x2={pad + innerW - offset - height} y2={pad + innerH}
                stroke="#3949ab" strokeWidth={1} opacity={0.55}
              />
            </G>
          );
        })}
      </G>

      {/* 内側ボーダー */}
      <Rect
        x={pad} y={pad} width={innerW} height={innerH}
        rx={innerRx} fill="none" stroke="#5c6bc0" strokeWidth={1}
      />

      {/* 中央テキスト "King's Cup" */}
      <SvgText
        x={width / 2} y={height * 0.43}
        textAnchor="middle" fill="#ffd54f"
        fontSize={width * 0.115} fontWeight="bold"
        fontFamily="serif" letterSpacing={0.5}
      >
        {"King's"}
      </SvgText>
      <SvgText
        x={width / 2} y={height * 0.58}
        textAnchor="middle" fill="#ffd54f"
        fontSize={width * 0.115} fontWeight="bold"
        fontFamily="serif" letterSpacing={0.5}
      >
        {"Cup"}
      </SvgText>

      {/* 四隅のゴールドドット */}
      <Circle cx={pad + 9}          cy={pad + 9}          r={3.5} fill="#ffd54f" opacity={0.75} />
      <Circle cx={width - pad - 9}  cy={pad + 9}          r={3.5} fill="#ffd54f" opacity={0.75} />
      <Circle cx={pad + 9}          cy={height - pad - 9} r={3.5} fill="#ffd54f" opacity={0.75} />
      <Circle cx={width - pad - 9}  cy={height - pad - 9} r={3.5} fill="#ffd54f" opacity={0.75} />
    </Svg>
  );
}
