import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api-client";
import { queryKeys } from "./query-keys";

export interface ProfileSummaryDto {
  userId: string;
  authType: string;
  email: string;
  displayName: string;
  avatarKey: string | null;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
}

export interface ProfileDetailResult {
  profile: ProfileSummaryDto;
}

export interface ProfileListResult {
  profiles: ProfileSummaryDto[];
}

export async function fetchProfileDetail(userId: string): Promise<ProfileDetailResult> {
  const { data } = await apiGet<ProfileDetailResult>(`/profiles/${userId}`);
  return data;
}

export async function fetchProfilesByUserIds(userIds: readonly string[]): Promise<ProfileListResult> {
  const { data } = await apiGet<ProfileListResult>("/profiles", {
    userIds: userIds.join(",")
  });

  return data;
}

export function useProfileQuery(userId: string | null) {
  return useQuery({
    enabled: typeof userId === "string" && userId.length > 0,
    queryKey: queryKeys.profiles.detail(userId ?? "missing"),
    queryFn: () => fetchProfileDetail(userId ?? "")
  });
}

export function useProfilesQuery(userIds: readonly string[]) {
  return useQuery({
    enabled: userIds.length > 0,
    queryKey: queryKeys.profiles.list(userIds),
    queryFn: () => fetchProfilesByUserIds(userIds)
  });
}