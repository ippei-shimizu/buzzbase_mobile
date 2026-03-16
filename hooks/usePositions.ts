import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPositions } from "../services/gameRecordService";
import { updateUserPositions } from "../services/positionService";

export const usePositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
  });
};

export const useUpdateUserPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      positionIds,
    }: {
      userId: number;
      positionIds: number[];
    }) => updateUserPositions(userId, positionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
