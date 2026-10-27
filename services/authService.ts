import { AVATAR_BACKGROUND_COLORS, EProviders } from "@/interfaces/IUser";
import User from "@/models/User";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

type LoginResponse = {
  id: string;
  name: string;
  email: string;
  provider: `${EProviders}`;
  avatarBackgroundColor: (typeof AVATAR_BACKGROUND_COLORS)[number];
  image?: string;
};

const getLoginUserFromCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse | null> => {
  if (!email || !password)
    throw new AppError("CredentialsSigninMissing", StatusCodes.BAD_GATEWAY);

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) return null;

  if (user.provider !== EProviders.credentials)
    throw new AppError("OAuthAccountNotLinked", StatusCodes.BAD_GATEWAY);

  if (
    user.provider === EProviders.credentials &&
    (await user.validatePassword(password, user.password))
  )
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      provider: user.provider,
      avatarBackgroundColor: user.avatarBackgroundColor,
      image: user.image,
    };

  return null;
};

/**
 * Is called just after user oauth signin but before the user session is created
 * Creates a new user if not created already
 * @param  {string} email
 * @param  {string} name
 * @param  {`${EProviders}`} provider
 * @returns {IUser} user
 */
const handlePostOAuthUserSignIn = async (
  email: string,
  name: string,
  provider: `${EProviders}`,
  image?: string
): Promise<LoginResponse> => {
  const user = await User.findOne({ email });
  if (user) {
    if (user.image !== image) {
      user.image = image;
      user.save();
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      provider: user.provider,
      image,
      avatarBackgroundColor: user.avatarBackgroundColor,
    };
  }
  const newUser = await User.create({
    email,
    name,
    provider,
    isEmailVerified: true,
    image,
  });
  return {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    provider,
    image,
    avatarBackgroundColor: newUser.avatarBackgroundColor,
  };
};

export default { getLoginUserFromCredentials, handlePostOAuthUserSignIn };
