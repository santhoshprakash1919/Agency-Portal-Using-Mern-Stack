import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance.js";

export function useCustomers(filters) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => (await axiosInstance.get("/customers", { params: filters })).data,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ["customer", id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosInstance.get(`/customers/${id}`)).data,
  });
}

export function useCustomerOrders(id) {
  return useQuery({
    queryKey: ["customer-orders", id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosInstance.get(`/customers/${id}/orders`)).data,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await axiosInstance.post("/customers", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) =>
      (await axiosInstance.patch(`/customers/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
