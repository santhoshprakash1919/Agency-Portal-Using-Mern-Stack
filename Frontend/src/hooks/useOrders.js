import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance.js";

export function useOrders(filters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => (await axiosInstance.get("/orders", { params: filters })).data,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ["order", id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosInstance.get(`/orders/${id}`)).data,
  });
}

export function usePublicInvoice(orderNumber) {
  return useQuery({
    queryKey: ["public-invoice", orderNumber],
    enabled: Boolean(orderNumber),
    queryFn: async () => (await axiosInstance.get(`/orders/public/${orderNumber}`)).data,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await axiosInstance.post("/orders", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await axiosInstance.patch(`/orders/${id}`, payload)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await axiosInstance.patch(`/orders/${id}/status`, payload)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axiosInstance.delete(`/orders/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
