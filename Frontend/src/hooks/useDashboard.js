import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance.js";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await axiosInstance.get("/dashboard/stats")).data,
  });
}

export function useWeeklyOrders() {
  return useQuery({
    queryKey: ["dashboard", "weekly-orders"],
    queryFn: async () => (await axiosInstance.get("/dashboard/weekly-orders")).data,
  });
}
