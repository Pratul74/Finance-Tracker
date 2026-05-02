import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSummary = () => {
  return useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await api.get("/records/summary/");
      return res.data;
    },
  });
};