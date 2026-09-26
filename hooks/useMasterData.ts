import { useQuery } from "@tanstack/react-query";
import {
  getPrefectures,
  getBaseballCategories,
} from "../services/masterDataService";

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
