import { api } from "@/lib/axios.ts";

export async function getUserById(userId: string) {
  const res = await api.get(`/users/${userId}`);
  return res.data;
}
