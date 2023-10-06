import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import {
  AVATAR_BACKGROUND_COLORS,
  EProviders,
  IUser,
} from "@/interfaces/IUser";
import createModel from "@/lib/createModel";

const userSchema = new Schema<IUser>(
  {
    provider: {
      type: String,
      enum: {
        values: Object.values(EProviders),
        message: "{VALUE} is not supported",
      },
      required: [
        true,
        `Missing auth provider - ${Object.values(EProviders).join("/")}`,
      ],
    },
    name: {
      type: String,
      required: [true, "Missing name"],
    },
    email: {
      type: String,
      required: [true, "Missing email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: 8,
      maxLength: 100,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatarBackgroundColor: {
      type: String,
      enum: {
        values: AVATAR_BACKGROUND_COLORS,
        message: "{VALUE} is not supported",
      },
      default:
        AVATAR_BACKGROUND_COLORS[
          (Math.random() * AVATAR_BACKGROUND_COLORS.length) | 0
        ],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.provider === EProviders.credentials)
    this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.validatePassword = function (
  candidatePassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const User = createModel<IUser>("User", userSchema);

export default User;
