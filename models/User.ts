import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import {
  AVATAR_BACKGROUND_COLORS,
  EProviders,
  IUserDocument,
} from "@/interfaces/IUser";
import createModel from "@/lib/createModel";

const userSchema = new Schema<IUserDocument>(
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
      maxLength: 50,
      required: [true, "Missing name"],
    },
    email: {
      type: String,
      required: [true, "Missing email"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
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
    image: String,
    avatarBackgroundColor: {
      type: String,
      enum: {
        values: AVATAR_BACKGROUND_COLORS,
        message: "{VALUE} is not supported",
      },
      validate: {
        validator: (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color),
        message: () => `Invalid HEX color code for avatar background`,
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

userSchema.pre<IUserDocument>("save", async function (next) {
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

const User = createModel<IUserDocument>("User", userSchema);

export default User;
