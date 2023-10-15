import { IApp } from "@/interfaces/IApp";
import _ from "lodash";
import App from "@/models/App";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

const getAppsByUserId = async (userId: string): Promise<IApp[]> => {
  return JSON.parse(JSON.stringify(await App.find({ user: userId }).lean()));
};

const createApp = async (
  data: Pick<IApp, "name" | "description" | "authorizedOrigins">,
  userId: string
) => {
  const userAppsCount = await App.count({ user: userId });
  if (userAppsCount >= 10)
    throw new AppError(
      "Your account has reached it's apps limit.",
      StatusCodes.FORBIDDEN
    );

  /** @todo validate data */
  const appData = _.pick(data, ["name", "description", "authorizedOrigins"]);
  return App.create({
    ...appData,
    user: userId,
  });
};

const updateApp = async (
  appId: string,
  data: Pick<IApp, "name" | "description" | "authorizedOrigins">,
  userId: string
) => {
  let app = await App.findOne({ _id: appId, user: userId });

  if (!app)
    throw new AppError(
      "App with that id not found or you're not authorized.",
      StatusCodes.BAD_REQUEST
    );

  /** @todo validate data */
  const appData = _.pick(data, ["name", "description", "authorizedOrigins"]);
  app = Object.assign(app, { ...appData });
  return app.save();
};

export default { getAppsByUserId, createApp, updateApp };
