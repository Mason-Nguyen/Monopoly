export interface ProfileSummary {
  userId: string;
  authType: "guest" | "local";
  email: string | null;
  displayName: string;
  avatarKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date | null;
}