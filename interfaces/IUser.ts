import mongoose from "mongoose";

export enum EProviders {
  credentials = "credentials",
  github = "github",
  google = "google",
}
export const AVATAR_BACKGROUND_COLORS = [
  "#fed0bb",
  "#8ecae6",
  "#219ebc",
  "#ffb703",
  "#74c69d",
  "#e9c46a",
  "#f4a261",
  "#c1121f",
  "#cdb4db",
  "#ffafcc",
  "#06d6a0",
  "#c77dff",
] as const;
export type AvatarBackgroundColorType =
  (typeof AVATAR_BACKGROUND_COLORS)[number];
export interface IUser {
  _id: string;
  provider: EProviders;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  image?: string;
  avatarBackgroundColor: AvatarBackgroundColorType;
  createdAt: Date;
  updatedAt: Date;
}
export interface IUserDocument extends mongoose.Document, Omit<IUser, "_id"> {
  validatePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
