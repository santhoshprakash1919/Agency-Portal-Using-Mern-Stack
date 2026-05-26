import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance.js";

export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => (await axiosInstance.get("/agencies")).data,
  });
}

export function useCreateAgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await axiosInstance.post("/agencies", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agencies"] }),
  });
}

export function useUpdateAgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await axiosInstance.patch(`/agencies/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agencies"] }),
  });
}
