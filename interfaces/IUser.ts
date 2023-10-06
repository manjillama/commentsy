import mongoose from "mongoose";

export enum EProviders {
  credentials = "credentials",
  github = "github",
  google = "google",
}
export const AVATAR_BACKGROUND_COLORS = [
  "#264653",
  "#2a9d8f",
  "#e9c46a",
  "#f4a261",
  "#e76f51",
  "#8ecae6",
  "#219ebc",
  "#023047",
  "#ffb703",
  "#fb8500",
] as const;
export type AvatarBackgroundColorType =
  (typeof AVATAR_BACKGROUND_COLORS)[number];
export interface IUser extends mongoose.Document {
  provider: EProviders;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  avatarBackgroundColor: AvatarBackgroundColorType;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
