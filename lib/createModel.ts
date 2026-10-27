import { config } from "@/config";
import { deleteModel, Model, model, models, Schema } from "mongoose";

export default function createModel<T, TModel = Model<T>>(
  modelName: string,
  schema: Schema<T>
): TModel {
  if (process.env.NODE_ENV === config.envs.dev) {
    // Recompile when this module reloads so schema changes (including new
    // fields and validators) take effect during Next.js hot reloads.
    if (models[modelName]) deleteModel(modelName);
    return model<T, TModel>(modelName, schema);
  }

  return (models[modelName] as TModel | undefined) ??
    model<T, TModel>(modelName, schema);
}
