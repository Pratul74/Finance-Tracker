import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

export type RecordType = "income" | "expense";

export type Category =
  | "food"
  | "travel"
  | "clothing"
  | "medicine"
  | "entertainment"
  | "fitness"
  | "skills"
  | "investment"
  | "hobby"
  | "others";

export interface Record {
  id: number;
  user: number;
  amount: string;
  category: Category;
  type: RecordType;
  date: string;
  description: string;
  type_display: string;
  category_display: string;
}

export interface RecordsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Record[];
}

export interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  total: number;
}

interface RecordFilters {
  start?: string;
  end?: string;
  page?: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export const useRecords = (filters: RecordFilters = {}) =>
  useQuery<RecordsResponse>({
    queryKey: ["records", filters],
    queryFn: async () => {
      const { data } = await api.get("/records/", { params: filters });
      return data;
    },
  });

export const useSummary = (filters: RecordFilters = {}) =>
  useQuery<Summary>({
    queryKey: ["summary", filters],
    queryFn: async () => {
      const { data } = await api.get("/records/summary/", { params: filters });
      return data;
    },
  });

export const useMonthly = (filters: RecordFilters = {}) =>
  useQuery<MonthlyData[]>({
    queryKey: ["monthly", filters],
    queryFn: async () => {
      const { data } = await api.get("/records/monthly/", { params: filters });
      return data;
    },
  });

export const useCategory = (filters: RecordFilters = {}) =>
  useQuery<CategoryData[]>({
    queryKey: ["category", filters],
    queryFn: async () => {
      const { data } = await api.get("/records/category/", {
        params: filters,
      });
      return data;
    },
  });

export const useCreateRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Record>) => api.post("/records/", body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [] }), // bust all caches
  });
};

export const useDeleteRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/records/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [] }),
  });
};