/**
 * 打席詳細記録のマスタデータ型定義。
 * back の v2 マスタ系シリアライザ（`pitch_type_serializer` 等）に揃える。
 */

export interface PitchTypeMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface ContactQualityMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface TimingMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface HitDepthMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface ArmAngleMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface VelocityZoneMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface PitcherStyleMaster {
  id: number;
  name: string;
  display_order: number;
}

export interface AppearanceSituationMaster {
  id: number;
  name: string;
  display_order: number;
}
