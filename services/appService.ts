import { IApp } from "@/interfaces/IApp";
import _ from "lodash";
import App from "@/models/App";
import AppError from "@/utils/appError";
import { StatusCodes } from "http-status-codes";

const getAppsByUserId = async (userId: string) => {
  return JSON.parse(JSON.stringify(await App.find({ user: userId }).lean()));
};

const createApp = async (
  data: Pick<IApp, "name" | "description">,
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

export default { getAppsByUserId, createApp };
