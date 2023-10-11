import { IApp } from "@/interfaces/IApp";
import _ from "lodash";
import App from "@/models/App";

const getAppsByUserId = async (userId: string) => {
  return JSON.parse(JSON.stringify(await App.find({ userId }).lean()));
};

const createApp = (
  data: Pick<IApp, "name" | "description">,
  userId: string
) => {
  /** @todo validate data */
  const appData = _.pick(data, ["name", "description", "authorizedOrigins"]);
  return App.create({
    ...appData,
    userId,
  });
};

export default { getAppsByUserId, createApp };
