import { Schema } from "mongoose";
import { webOrigin } from "@/utils/origin";
import { nanoid } from "nanoid";
import createModel from "@/lib/createModel";
import { DEFAULT_COMMENT_STYLES, isCommentStyles } from "@/utils/commentStyles";
import { IAppDocument } from "@/interfaces/IApp";

const appSchema = new Schema<IAppDocument>(
  {
    code: {
      type: String,
      unique: true,
      default: () => nanoid(12),
    },
    name: {
      type: String,
      maxLength: 40,
      required: [true, "Missing app name"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Missing user id (user)"],
    },
    description: {
      type: String,
      maxLength: 120,
      required: [true, "Missing app description"],
    },
    authorizedOrigins: {
      type: [String],
      validate: {
        validator: function (origins: string[]) {
          return (
            origins.length > 0 &&
            origins.every((origin) => webOrigin(origin) === origin)
          );
        },
        message: () =>
          `Invalid origin: URIs is required and must not contain a path or end with "/".`,
      },
    },
    requireGuestApproval: { type: Boolean, default: false },
    commentStyles: {
      type: String,
      default: JSON.stringify(DEFAULT_COMMENT_STYLES),
      validate: {
        validator: (value: string) => {
          try {
            return isCommentStyles(JSON.parse(value));
          } catch {
            return false;
          }
        },
        message: "Invalid comment colors. Use three- or six-digit hex colors for both themes.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const App = createModel<IAppDocument>("App", appSchema);

export default App;
