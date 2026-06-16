export interface HitDirection {
  id: number;
  label: string;
  count: number;
  top_category: string;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
}

export interface HitLocationPoint {
  x: number;
  y: number;
  plate_result_id: number;
}

export interface HitLocationData {
  points: HitLocationPoint[];
}

export interface OutTypeBreakdownCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface OutTypeBreakdownData {
  breakdown: OutTypeBreakdownCategory[];
  total: number;
}

/**
 * カウント別分析カード（初球 / 有利カウント / 追い込み）の 1 セル分。
 */
export interface CountSituation {
  at_bats: number;
  hits: number;
  batting_average: number;
}

/**
 * stats 打撃のカウント別分析レスポンス。
 * `first_pitch_swing` / `final_balls` / `final_strikes` の記録がある新仕様 PA のみが対象。
 */
export interface CountSituations {
  first_pitch: CountSituation;
  favorable_count: CountSituation;
  pinch_count: CountSituation;
  total_target_pa: number;
}

export interface HomeRunDirection {
  id: number;
  label: string;
  count: number;
}

export interface HitDirectionData {
  directions: HitDirection[];
  home_runs: HomeRunDirection[];
}

export interface PlateAppearanceCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface BattingStatsRow {
  label: string;
  opponent?: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hit: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
  total_bases: number;
  runs_batted_in: number;
  run: number;
  strike_out: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  caught_stealing: number;
  error: number;
  batting_average: number;
  slugging_percentage: number;
  ops: number;
  iso: number;
  bb_per_k: number;
  babip: number;
}

export interface PitchingStatsRow {
  label: string;
  opponent?: string;
  appearances: number;
  win: number;
  loss: number;
  hold: number;
  saves: number;
  complete_games: number;
  shutouts: number;
  innings_pitched: number;
  hits_allowed: number;
  home_runs_hit: number;
  strikeouts: number;
  base_on_balls: number;
  hit_by_pitch: number;
  run_allowed: number;
  earned_run: number;
  number_of_pitches: number;
  era: number;
  whip: number;
  k_per_nine: number;
  bb_per_nine: number;
  k_bb: number;
  win_percentage: number;
}

export interface WinLossSummary {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  win_rate: number;
}

export interface MonthlyGame {
  month: number;
  count: number;
}

export interface OpponentRecord {
  team_name: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
}

export interface EraTrendPoint {
  month: number;
  era: number;
}

export interface Scoring {
  runs_for: number;
  runs_against: number;
  run_differential: number;
  avg_runs_for: number;
  avg_runs_against: number;
}

export interface RecentFormGame {
  game_result_id: number;
  date: string;
  match_type: string | null;
  opponent: string;
  result: "win" | "loss" | "draw";
  my_score: number;
  opponent_score: number;
}

export interface GameSummary {
  win_loss: WinLossSummary;
  scoring: Scoring;
  recent_form: RecentFormGame[];
  monthly_games: MonthlyGame[];
  opponent_records: OpponentRecord[];
}

export type StatsPeriod = "yearly" | "monthly" | "daily";

/**
 * stats タブ打撃セクション最上部の主要スタッツカード用レスポンス。
 * OBP / SLG / OPS はサーバー側で計算済（小数 3 桁）。
 */
export interface HeadlineStats {
  batting_average: number;
  hit: number;
  home_run: number;
  runs_batted_in: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  at_bats: number;
}

/**
 * 得点圏（runners_state IN 2..7）に絞った打撃集計。
 * 母数 0 のときも nil ではなく 0 / 0.0 が返るので、`at_bats === 0` で
 * mobile 側を「対象データなし」UI に分岐させる。
 */
export interface RunnersSituationSummary {
  batting_average: number;
  at_bats: number;
  hits: number;
  two_base_hit: number;
  three_base_hit: number;
  home_run: number;
}

/**
 * 打球の質（contact_qualities マスタ）別の集計レスポンス。
 * 真芯 / 先っぽ / 詰まり / 擦り / ドライブ の 5 種が display_order 順で返る。
 */
export interface ContactQualityCategory {
  id: number;
  label: string;
  count: number;
  percentage: number;
}

export interface ContactQualityData {
  breakdown: ContactQualityCategory[];
  total: number;
}

/**
 * タイミング別の打席比率（timings マスタの 3 種: ドンピシャ / 泳ぎ気味 / 遅れ気味）。
 */
export interface TimingBreakdownCategory {
  id: number;
  label: string;
  count: number;
  percentage: number;
}

export interface TimingBreakdownData {
  breakdown: TimingBreakdownCategory[];
  total: number;
}

/**
 * 球種別の打撃集計レスポンス。pitch_types マスタの 10 種すべてが
 * display_order 順で返り、at_bats=0 の行も含まれる。
 */
export interface PitchTypeRow {
  id: number;
  label: string;
  at_bats: number;
  hits: number;
  total_bases: number;
  batting_average: number;
  slugging_percentage: number;
}

export interface PitchTypeData {
  rows: PitchTypeRow[];
  total_target_pa: number;
}

/**
 * stats 打撃の追加スタッツ（主要スタッツ以外）。
 * マイページ / ダッシュボードの SummaryStatsTable と同じ 16 項目。
 */
export interface AdditionalStats {
  games: number;
  plate_appearances: number;
  two_base_hit: number;
  three_base_hit: number;
  total_bases: number;
  run: number;
  strike_out: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_hit: number;
  sacrifice_fly: number;
  stealing_base: number;
  caught_stealing: number;
  iso: number;
  isod: number;
  bb_per_k: number;
}

/**
 * 打撃推移グラフの粒度。
 * - `game`: 試合単位で **累積** の打率 / OBP / SLG / OPS
 * - `month`: 月単位で **月単独**
 * - `year`: 年単位で **年単独**（シーズン比較向き）
 * - `recent_games`: 直近 10 試合の移動平均（hot/cold streak の可視化）
 */
export type BattingTrendGranularity =
  | "game"
  | "month"
  | "year"
  | "recent_games";

/**
 * 推移グラフ 1 点分のデータ。
 */
export interface BattingTrendPoint {
  key: string;
  label: string;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  at_bats_in_period: number;
  cumulative_at_bats: number;
}

export interface BattingTrendData {
  granularity: BattingTrendGranularity;
  points: BattingTrendPoint[];
}

/**
 * 対戦投手別の集計レスポンス。対戦数 min_plate_appearances 未満の投手は
 * back 側で除外され、rows は対戦数降順 → 投手名昇順で並ぶ。
 */
export interface PitcherFaceoff {
  pitcher_id: number;
  pitcher_name: string;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  base_on_balls: number;
  hit_by_pitch: number;
  sacrifice_fly: number;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
  ops: number;
  top_result: string;
  result_counts: PitcherResultCount[];
}

/** 投手別の plate_result 別件数。plate_result_id 昇順で返る。 */
export interface PitcherResultCount {
  plate_result_id: number;
  plate_result_name: string;
  count: number;
}

export interface PitcherFaceoffData {
  rows: PitcherFaceoff[];
  total_target_pa: number;
  min_plate_appearances: number;
}

/**
 * 投手属性別サマリ。利き手 / 腕の角度 / 球速帯 / 投手タイプの 4 軸で
 * 打席を束ねた打率を返す。`key` が null の要素は「未設定」バケットで、
 * 各配列の末尾に並ぶ。
 */
export interface PitcherAttributeBucket {
  key: string | number | null;
  label: string;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  batting_average: number;
  display_order: number;
}

export interface PitcherAttributeSummaryData {
  by_throw_hand: PitcherAttributeBucket[];
  by_arm_angle: PitcherAttributeBucket[];
  by_velocity_zone: PitcherAttributeBucket[];
  by_pitcher_style: PitcherAttributeBucket[];
}
