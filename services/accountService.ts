import logger from "@/utils/logger";
import User from "@/models/User";
import AppError from "@/utils/appError";
import { AVATAR_BACKGROUND_COLORS, EProviders } from "@/interfaces/IUser";

const getAccount = async (userId: string) => {
  const user = await User.findById(userId).select("name email image provider avatarBackgroundColor createdAt").lean();
  if (!user) throw new AppError("Account not found", 404);
  return JSON.parse(JSON.stringify(user));
};

const updateProfile = async (userId: string, data: { name?: unknown; avatarBackgroundColor?: unknown }) => {
  if (!data || typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > 50)
    throw new AppError("Enter a display name between 1 and 50 characters", 400);
  if (!AVATAR_BACKGROUND_COLORS.includes(data.avatarBackgroundColor as any))
    throw new AppError("Choose one of the available avatar colors", 400);
  const user = await User.findById(userId);
  if (!user) throw new AppError("Account not found", 404);
  user.name = data.name.trim();
  user.avatarBackgroundColor = data.avatarBackgroundColor as typeof AVATAR_BACKGROUND_COLORS[number];
  await user.save();
  logger.info("account.profile.updated");
  return getAccount(userId);
};

const changePassword = async (userId: string, data: { currentPassword?: unknown; newPassword?: unknown }) => {
  if (!data || typeof data.currentPassword !== "string" || !data.currentPassword || typeof data.newPassword !== "string" || data.newPassword.length < 8 || data.newPassword.length > 100 || Buffer.byteLength(data.newPassword, "utf8") > 72)
    throw new AppError("Enter your current password and a new password of 8–72 UTF-8 bytes (at most 100 characters)", 400);
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("Account not found", 404);
  if (user.provider !== EProviders.credentials)
    throw new AppError("Manage your password with your sign-in provider", 400);
  if (!user.password || !await user.validatePassword(data.currentPassword, user.password)) {
    logger.warn("account.password.rejected", { reason: "invalid_current_password" });
    throw new AppError("Your current password is incorrect", 400);
  }
  if (data.currentPassword === data.newPassword)
    throw new AppError("Choose a password different from your current password", 400);
  user.password = data.newPassword;
  // The User model hashes modified passwords before saving.
  await user.save();
  logger.info("account.password.changed");
};

export default { getAccount, updateProfile, changePassword };
