import { api } from "@/lib/axios.ts";
import { User } from "@repo/db/types";

export async function getUserById(userId: string) {
  const res = await api.get(`/users/${userId}`);
  return res.data as {
    success: boolean;
    data: User;
  };
}

export async function updateClerkUserById(userId: string, params: any) {
  const res = await api.patch(`/users/update-user/${userId}`, params);
  return res.data as {
    success: boolean;
    data: any;
  };
}