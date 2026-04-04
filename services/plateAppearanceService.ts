import axiosInstance from "@utils/axiosInstance";

export interface PlateAppearancePayload {
  plate_appearance: {
    game_result_id: number;
    user_id: number;
    batter_box_number: number;
    batting_result: string;
    batting_position_id: number;
    plate_result_id: number;
    hit_direction_id?: number;
  };
}

export const createPlateAppearance = async (
  data: PlateAppearancePayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.post("/plate_appearances", data);
  return response.data;
};

export const updatePlateAppearance = async (
  id: number,
  data: PlateAppearancePayload,
): Promise<{ id: number }> => {
  const response = await axiosInstance.put(`/plate_appearances/${id}`, data);
  return response.data;
};

export const deletePlateAppearance = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/plate_appearances/${id}`);
};

export const checkExistingPlateAppearance = async (
  gameResultId: number,
  userId: number,
  batterBoxNumber: number,
): Promise<{ id: number } | null> => {
  try {
    const response = await axiosInstance.get(
      `/plate_search?game_result_id=${gameResultId}&user_id=${userId}&batter_box_number=${batterBoxNumber}`,
    );
    return response.data;
  } catch {
    return null;
  }
};
