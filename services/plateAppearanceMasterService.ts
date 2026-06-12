import type {
  AppearanceSituationMaster,
  ArmAngleMaster,
  ContactQualityMaster,
  HitDepthMaster,
  PitchTypeMaster,
  PitcherStyleMaster,
  TimingMaster,
  VelocityZoneMaster,
} from "../types/plateAppearanceMasters";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_CONTACT_QUALITIES_URL = `${API_BASE_URL}/api/v2/contact_qualities`;
const V2_PITCH_TYPES_URL = `${API_BASE_URL}/api/v2/pitch_types`;
const V2_TIMINGS_URL = `${API_BASE_URL}/api/v2/timings`;
const V2_HIT_DEPTHS_URL = `${API_BASE_URL}/api/v2/hit_depths`;
const V2_ARM_ANGLES_URL = `${API_BASE_URL}/api/v2/arm_angles`;
const V2_VELOCITY_ZONES_URL = `${API_BASE_URL}/api/v2/velocity_zones`;
const V2_PITCHER_STYLES_URL = `${API_BASE_URL}/api/v2/pitcher_styles`;
const V2_APPEARANCE_SITUATIONS_URL = `${API_BASE_URL}/api/v2/appearance_situations`;

interface ContactQualitiesResponse {
  contact_qualities: ContactQualityMaster[];
}

interface PitchTypesResponse {
  pitch_types: PitchTypeMaster[];
}

interface TimingsResponse {
  timings: TimingMaster[];
}

interface HitDepthsResponse {
  hit_depths: HitDepthMaster[];
}

/**
 * 打球の質マスタを `display_order` 昇順で取得する。
 * 打席詳細データ入力（#334）のチップ選択 UI に使用する。
 */
export const getContactQualities = async (): Promise<
  ContactQualityMaster[]
> => {
  const response = await axiosInstance.get<ContactQualitiesResponse>(
    V2_CONTACT_QUALITIES_URL,
  );
  return response.data.contact_qualities;
};

/**
 * 球種マスタ（10 系統）を `display_order` 昇順で取得する。
 */
export const getPitchTypes = async (): Promise<PitchTypeMaster[]> => {
  const response =
    await axiosInstance.get<PitchTypesResponse>(V2_PITCH_TYPES_URL);
  return response.data.pitch_types;
};

/**
 * タイミングマスタ（ドンピシャ / 泳ぎ気味 / 遅れ気味）を取得する。
 */
export const getTimings = async (): Promise<TimingMaster[]> => {
  const response = await axiosInstance.get<TimingsResponse>(V2_TIMINGS_URL);
  return response.data.timings;
};

/**
 * 打球の深さマスタ（内野 / 外野 / フェンス際）を取得する。
 * Step1 のグラウンドタップで自動算出される `hit_depth_id` の表示確認用としても利用する。
 */
export const getHitDepths = async (): Promise<HitDepthMaster[]> => {
  const response =
    await axiosInstance.get<HitDepthsResponse>(V2_HIT_DEPTHS_URL);
  return response.data.hit_depths;
};

interface ArmAnglesResponse {
  arm_angles: ArmAngleMaster[];
}

interface VelocityZonesResponse {
  velocity_zones: VelocityZoneMaster[];
}

interface PitcherStylesResponse {
  pitcher_styles: PitcherStyleMaster[];
}

interface AppearanceSituationsResponse {
  appearance_situations: AppearanceSituationMaster[];
}

/** 投手の腕の角度マスタ（4種）を取得する。投手登録フォームで使う。 */
export const getArmAngles = async (): Promise<ArmAngleMaster[]> => {
  const response =
    await axiosInstance.get<ArmAnglesResponse>(V2_ARM_ANGLES_URL);
  return response.data.arm_angles;
};

/** 投手の球速帯マスタ（5種）を取得する。 */
export const getVelocityZones = async (): Promise<VelocityZoneMaster[]> => {
  const response = await axiosInstance.get<VelocityZonesResponse>(
    V2_VELOCITY_ZONES_URL,
  );
  return response.data.velocity_zones;
};

/** 投手タイプマスタ（4種）を取得する。 */
export const getPitcherStyles = async (): Promise<PitcherStyleMaster[]> => {
  const response = await axiosInstance.get<PitcherStylesResponse>(
    V2_PITCHER_STYLES_URL,
  );
  return response.data.pitcher_styles;
};

/** 登板状況マスタ（先発 / 中継ぎ / 抑え）を取得する。 */
export const getAppearanceSituations = async (): Promise<
  AppearanceSituationMaster[]
> => {
  const response = await axiosInstance.get<AppearanceSituationsResponse>(
    V2_APPEARANCE_SITUATIONS_URL,
  );
  return response.data.appearance_situations;
};
