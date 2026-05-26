import { useAuthContext } from "../store/AuthProvider.jsx";

export default function useAuth() {
  return useAuthContext();
}
