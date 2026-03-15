import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  updateGroupInfo,
  deleteGroup,
  inviteMembers,
  acceptInvitation,
  declineInvitation,
} from "../services/groupService";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    createGroup: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateGroupInfo = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateGroupInfo(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    updateGroupInfo: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    deleteGroup: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useInviteMembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, userIds }: { id: number; userIds: number[] }) =>
      inviteMembers(id, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers"] });
    },
  });

  return {
    inviteMembers: mutation.mutateAsync,
    isInviting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    acceptInvitation: mutation.mutateAsync,
    isAccepting: mutation.isPending,
  };
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    declineInvitation: mutation.mutateAsync,
    isDeclining: mutation.isPending,
  };
};
