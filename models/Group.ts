import { Schema } from "mongoose";
import createModel from "@/lib/createModel";
import { IGroupDocument } from "@/interfaces/IGroup";

const groupSchema = new Schema<IGroupDocument>(
  {
    identifier: {
      type: String,
      required: [true, "Missing group identifier (identifier)"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Missing owner id (owner)"],
    },
    app: {
      type: Schema.Types.ObjectId,
      ref: "App",
      required: [true, "Missing app id (app)"],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index(
  {
    app: 1,
    identifier: 1,
  },
  {
    unique: true,
  }
);

const Group = createModel<IGroupDocument>("Group", groupSchema);

export default Group;
