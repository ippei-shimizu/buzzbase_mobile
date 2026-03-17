import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserAwards,
  createAward,
  updateAward,
  deleteAward,
} from "../services/awardService";

export const useUserAwards = (userId: number | undefined) => {
  return useQuery({
    queryKey: ["awards", userId],
    queryFn: () => getUserAwards(userId!),
    enabled: !!userId,
  });
};

export const useAwardMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAwards = () => {
    queryClient.invalidateQueries({ queryKey: ["awards"] });
  };

  const create = useMutation({
    mutationFn: ({ userId, title }: { userId: number; title: string }) =>
      createAward(userId, title),
    onSuccess: invalidateAwards,
  });

  const update = useMutation({
    mutationFn: ({
      userId,
      awardId,
      title,
    }: {
      userId: number;
      awardId: number;
      title: string;
    }) => updateAward(userId, awardId, title),
    onSuccess: invalidateAwards,
  });

  const remove = useMutation({
    mutationFn: ({ userId, awardId }: { userId: number; awardId: number }) =>
      deleteAward(userId, awardId),
    onSuccess: invalidateAwards,
  });

  return { create, update, remove };
};
