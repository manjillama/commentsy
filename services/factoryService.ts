/* eslint-disable import/no-anonymous-default-export */
import { Model, Document } from "mongoose";
import APIFeatures, { parseQueryFilter } from "@/utils/apiFeatures";

type Find<T> = {
  populate: (options: any) => Find<T>;
  exec: () => Promise<[T[], number, number]>;
};
/**
 * @param  {Model<T>} model
 * @param  {any} query
 * @returns Find
 */
function find<T extends Document>(model: Model<T>, query: any): Find<T> {
  const { limit } = query;

  const size = limit && !Number.isNaN(Number(limit)) ? Number(limit) : 40;

  const features = new APIFeatures(model.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate(size);

  const totalCountFilter = parseQueryFilter(query);

  return {
    populate(options: any) {
      features.query.populate(options);
      return this;
    },
    async exec() {
      const [data, total] = await Promise.all([
        features.query,
        model.countDocuments(totalCountFilter as any),
      ]);
      return [data, total, size];
    },
  };
}

export default {
  find,
};
