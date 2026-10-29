import logger from "@/utils/logger";
import { IApp } from "@/interfaces/IApp";
import _ from "lodash";
import App from "@/models/App";
import AppError from "@/utils/appError";
import { isCommentStyles } from "@/utils/commentStyles";
import { StatusCodes } from "http-status-codes";

const getAppsByUserId = async (userId: string): Promise<IApp[]> => {
  return JSON.parse(JSON.stringify(await App.find({ user: userId }).lean()));
};

const createApp = async (
  data: Pick<IApp, "name" | "description" | "authorizedOrigins" | "requireGuestApproval">,
  userId: string
) => {
  const userAppsCount = await App.count({ user: userId });
  if (userAppsCount >= 10)
    throw new AppError(
      "Your account has reached it's apps limit.",
      StatusCodes.FORBIDDEN
    );

  if (data.requireGuestApproval !== undefined && typeof data.requireGuestApproval !== "boolean")
    throw new AppError("Guest approval must be enabled or disabled", StatusCodes.BAD_REQUEST);
  const appData = _.pick(data, ["name", "description", "authorizedOrigins", "requireGuestApproval"]);
  const app = await App.create({ ...appData, user: userId });
  logger.info("site.created", { appId: app._id.toString() });
  return app;
};

const updateApp = async (
  appId: string,
  data: Partial<Pick<IApp, "name" | "description" | "authorizedOrigins" | "requireGuestApproval" | "commentStyles">>,
  userId: string
) => {
  let app = await App.findOne({ _id: appId, user: userId });

  if (!app)
    throw new AppError(
      "App with that id not found or you're not authorized.",
      StatusCodes.BAD_REQUEST
    );

  if (data.requireGuestApproval !== undefined && typeof data.requireGuestApproval !== "boolean")
    throw new AppError("Guest approval must be enabled or disabled", StatusCodes.BAD_REQUEST);
  if (data.commentStyles !== undefined) {
    let styles: unknown;
    try {
      styles = JSON.parse(data.commentStyles);
    } catch {
      throw new AppError("Invalid comment colors", StatusCodes.BAD_REQUEST);
    }
    if (!isCommentStyles(styles))
      throw new AppError("Use three- or six-digit hex colors for both themes.", StatusCodes.BAD_REQUEST);
    const validatedStyles = styles;
    // Persist only the supported style properties.
    data = { ...data, commentStyles: JSON.stringify(Object.fromEntries(
      (["light", "dark"] as const).map(theme => [theme, Object.fromEntries(
        (["primary", "accent"] as const).map(role => [role, {
          backgroundColor: validatedStyles[theme][role].backgroundColor,
          color: validatedStyles[theme][role].color,
          ...(role === "primary" ? { borderColor: validatedStyles[theme].primary.borderColor ?? "#d4d4d4" } : {}),
        }])
      )])
    )) };
  }
  const appData = _.pick(data, ["name", "description", "authorizedOrigins", "commentStyles", "requireGuestApproval"]);
  app = Object.assign(app, { ...appData });
  await app.save();
  logger.info("site.updated", { appId: app._id.toString(), fields: Object.keys(appData) });
  return app;
};

export default { getAppsByUserId, createApp, updateApp };
