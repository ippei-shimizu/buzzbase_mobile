import { useQuery } from "@tanstack/react-query";
import {
  getBaseballNotes,
  getBaseballNote,
} from "../services/baseballNoteService";

export const useBaseballNotes = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["baseballNotes"],
    queryFn: getBaseballNotes,
  });

  return {
    notes: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

export const useBaseballNote = (id: number | undefined) => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["baseballNote", id],
    queryFn: () => getBaseballNote(id!),
    enabled: !!id,
  });

  return {
    note: data,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};
