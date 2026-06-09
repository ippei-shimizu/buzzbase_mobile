import type {
  ContactQualityMaster,
  HitDepthMaster,
  PitchTypeMaster,
  TimingMaster,
} from "../types/plateAppearanceMasters";
import { API_BASE_URL } from "@constants/api";
import axiosInstance from "@utils/axiosInstance";

const V2_CONTACT_QUALITIES_URL = `${API_BASE_URL}/api/v2/contact_qualities`;
const V2_PITCH_TYPES_URL = `${API_BASE_URL}/api/v2/pitch_types`;
const V2_TIMINGS_URL = `${API_BASE_URL}/api/v2/timings`;
const V2_HIT_DEPTHS_URL = `${API_BASE_URL}/api/v2/hit_depths`;

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
