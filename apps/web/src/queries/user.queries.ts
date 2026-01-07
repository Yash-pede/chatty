import { api } from "@/lib/axios.ts";
import { User } from "@repo/db/types";

export async function getUserById(userId: string) {
  const res = await api.get(`/users/${userId}`);
  return res.data as {
    success: boolean;
    data: User;
  };
}
