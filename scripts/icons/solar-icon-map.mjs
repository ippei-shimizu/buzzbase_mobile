// Ionicons 名（アプリ内で使い続ける内部キー）から Solar Icons への対応表。
// generate-solar-icons.mjs の唯一の入力で、アイコンの見た目を変えたいときはここだけ触る。
//
// weight の原則:
//   "*-outline" 系 → -linear（細線）
//   solid 系       → -bold-duotone（塗り＋半透明レイヤー）
// 例外:
//   - チェブロン・チェック・×・＋・− など常時 14〜20px で使う UI クローム系は
//     duotone にすると潰れるため -linear / -bold にする
//   - 意味色（赤・緑・黄）を載せるステータス系は、半透明レイヤーが色を濁らせるため -bold にする
//
// 値の形式:
//   { solar: "<solar のフルネーム（weight サフィックス込み）>" }
//   { custom: "<コンポーネント名>", from: "<solar/ からの相対 import パス>" }

/** @type {Record<string, { solar: string } | { custom: string; from: string }>} */
export const ICON_MAP = {
  // --- outline 系（→ linear） ---
  "add-circle-outline": { solar: "add-circle-linear" },
  "alert-circle-outline": { solar: "danger-circle-linear" },
  "bandage-outline": { solar: "adhesive-plaster-linear" },
  "barbell-outline": { solar: "dumbbell-linear" },
  // Solar に野球ボールが無いため既存の自作 SVG を流用する。
  "baseball-outline": { custom: "BallIcon", from: "../BallIcon" },
  "book-outline": { solar: "book-linear" },
  "bulb-outline": { solar: "lightbulb-linear" },
  "calculator-outline": { solar: "calculator-minimalistic-linear" },
  "calendar-outline": { solar: "calendar-linear" },
  "camera-outline": { solar: "camera-linear" },
  "card-outline": { solar: "card-linear" },
  "checkmark-circle-outline": { solar: "check-circle-linear" },
  "clipboard-outline": { solar: "clipboard-text-linear" },
  "copy-outline": { solar: "copy-linear" },
  "create-outline": { solar: "pen-new-square-linear" },
  "cut-outline": { solar: "scissors-linear" },
  "document-text-outline": { solar: "document-text-linear" },
  "ellipse-outline": { solar: "record-linear" },
  "ellipsis-horizontal-circle-outline": { solar: "menu-dots-circle-linear" },
  "eye-outline": { solar: "eye-linear" },
  "fitness-outline": { solar: "pulse-linear" },
  "flag-outline": { solar: "flag-linear" },
  "flame-outline": { solar: "fire-linear" },
  // 投手カテゴリ。Solar に投球する手のアイコンが無いため「狙う」の的で代替する。
  "hand-right-outline": { solar: "target-linear" },
  "happy-outline": { solar: "smile-circle-linear" },
  "help-circle-outline": { solar: "question-circle-linear" },
  "images-outline": { solar: "gallery-linear" },
  "list-outline": { solar: "list-linear" },
  "mail-outline": { solar: "letter-linear" },
  "menu-outline": { solar: "hamburger-menu-linear" },
  "pencil-outline": { solar: "pen-linear" },
  "people-outline": { solar: "users-group-rounded-linear" },
  "person-outline": { solar: "user-linear" },
  "receipt-outline": { solar: "bill-list-linear" },
  "ribbon-outline": { solar: "medal-ribbon-linear" },
  "sad-outline": { solar: "sad-circle-linear" },
  "search-outline": { solar: "magnifer-linear" },
  "settings-outline": { solar: "settings-linear" },
  "share-outline": { solar: "share-linear" },
  "shield-half-outline": { solar: "shield-check-linear" },
  "shield-outline": { solar: "shield-linear" },
  "sparkles-outline": { solar: "magic-stick-3-linear" },
  // checkbox の対になる未チェック状態。Solar の stop は角丸の四角枠で check-square と形が揃う。
  "square-outline": { solar: "stop-linear" },
  "star-outline": { solar: "star-linear" },
  "stats-chart-outline": { solar: "chart-2-linear" },
  "ticket-outline": { solar: "ticket-linear" },
  "time-outline": { solar: "clock-circle-linear" },
  "timer-outline": { solar: "stopwatch-linear" },
  "trash-outline": { solar: "trash-bin-trash-linear" },
  "trophy-outline": { solar: "cup-star-linear" },
  "walk-outline": { solar: "walking-linear" },
  "warning-outline": { solar: "danger-triangle-linear" },

  // --- solid 系（→ bold-duotone、例外は個別に linear / bold） ---
  // Solar には枠なしの素の ＋ − ✓ ✕ が無いため、Solar Linear と同じ線幅で自作する。
  add: { custom: "PlusIcon", from: "../PlusIcon" },
  remove: { custom: "MinusIcon", from: "../MinusIcon" },
  checkmark: { custom: "CheckmarkIcon", from: "../CheckmarkIcon" },
  close: { custom: "CloseIcon", from: "../CloseIcon" },
  baseball: { custom: "BallIcon", from: "../BallIcon" },

  // 意味色を載せるステータス系。半透明レイヤーが赤・緑・黄を濁らせるため bold にする。
  "add-circle": { solar: "add-circle-bold" },
  "alert-circle": { solar: "danger-circle-bold" },
  "checkmark-circle": { solar: "check-circle-bold" },
  "close-circle": { solar: "close-circle-bold" },
  "information-circle": { solar: "info-circle-bold" },
  "remove-circle": { solar: "minus-circle-bold" },

  // UI クローム系。常時 14〜20px で使うため duotone にしない。
  "arrow-forward": { solar: "arrow-right-linear" },
  "chevron-back": { solar: "alt-arrow-left-linear" },
  "chevron-down": { solar: "alt-arrow-down-linear" },
  "chevron-forward": { solar: "alt-arrow-right-linear" },
  "chevron-up": { solar: "alt-arrow-up-linear" },
  search: { solar: "magnifer-linear" },
  refresh: { solar: "refresh-bold" },
  play: { solar: "play-bold" },
  checkbox: { solar: "check-square-bold" },
  ellipse: { solar: "record-bold" },
  pencil: { solar: "pen-bold" },
  star: { solar: "star-bold" },
  "lock-closed": { solar: "lock-bold" },
  "volume-high": { solar: "volume-loud-bold" },
  "volume-mute": { solar: "muted-bold" },

  // 装飾・達成系。20px 以上かつアクセント色で使うため duotone が映える。
  barbell: { solar: "dumbbell-bold-duotone" },
  "document-text": { solar: "document-text-bold-duotone" },
  flag: { solar: "flag-bold-duotone" },
  flame: { solar: "fire-bold-duotone" },
  happy: { solar: "smile-circle-bold-duotone" },
  sad: { solar: "sad-circle-bold-duotone" },
  medkit: { solar: "medical-kit-bold-duotone" },
  // 運営からのお知らせ。Solar に megaphone が無いため通知ベルで代替する。
  megaphone: { solar: "bell-bing-bold-duotone" },
  moon: { solar: "moon-bold-duotone" },
  people: { solar: "users-group-rounded-bold-duotone" },
  "person-add": { solar: "user-plus-rounded-bold-duotone" },
  ribbon: { solar: "medal-ribbon-bold-duotone" },
  sparkles: { solar: "magic-stick-3-bold-duotone" },
  "stats-chart": { solar: "chart-2-bold-duotone" },
  "trending-down": { solar: "graph-down-bold-duotone" },
  "trending-up": { solar: "graph-up-bold-duotone" },
  trophy: { solar: "cup-star-bold-duotone" },
  videocam: { solar: "videocamera-record-bold-duotone" },
};
