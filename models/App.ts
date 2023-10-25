import { Schema } from "mongoose";
import { nanoid } from "nanoid";
import createModel from "@/lib/createModel";
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
      maxLength: 20,
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
            origins.every((origin) => /^(https?:\/\/[^/]+)$/.test(origin))
          );
        },
        message: () =>
          `Invalid origin: URIs is required and must not contain a path or end with "/".`,
      },
    },
    commentStyles: {
      type: String,
      /** @todo Add json validator */
      default: JSON.stringify({
        light: {
          primary: {
            backgroundColor: "#fff",
            color: "#000",
          },
          accent: {
            backgroundColor: "#000",
            color: "#fff",
          },
        },
        dark: {
          primary: {
            backgroundColor: "#000",
            color: "#fff",
          },
          accent: {
            backgroundColor: "#fff",
            color: "#000",
          },
        },
      }),
    },
  },
  {
    timestamps: true,
  }
);

const App = createModel<IAppDocument>("App", appSchema);

export default App;
