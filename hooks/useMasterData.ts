import { useQuery } from "@tanstack/react-query";
import {
  getPrefectures,
  getBaseballCategories,
} from "../services/masterDataService";
import { getTeams } from "../services/teamService";

export const usePrefectures = () => {
  return useQuery({
    queryKey: ["prefectures"],
    queryFn: getPrefectures,
  });
};

export const useBaseballCategories = () => {
  return useQuery({
    queryKey: ["baseballCategories"],
    queryFn: getBaseballCategories,
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });
};
