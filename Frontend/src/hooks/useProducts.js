import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance.js";

const fetchProducts = async (filters) => {
  const response = await axiosInstance.get("/products", { params: filters });
  return response.data;
};

export function useProducts(filters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => (await axiosInstance.get(`/products/${id}`)).data,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await axiosInstance.post("/products", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await axiosInstance.patch(`/products/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axiosInstance.delete(`/products/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
