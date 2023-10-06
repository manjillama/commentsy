import moment from "moment-timezone";
import {
  Document,
  FilterQuery,
  Query,
  QueryWithHelpers,
  Types,
} from "mongoose";
import { config } from "../config";

/**
 *
 * @param obj
 * Loop through object properties
 *    If object has key of 'match' | https://stackoverflow.com/questions/43729199/how-i-can-use-like-operator-on-mongoose
 *        Replace previous match key with $regex and add '$options=i' property for case-insensitive
 *    If object has key of 'lte' or 'lt' and is a valid date
 *        Mutate the value to end of the day.
 *        i.e. When user searches for a list using a (less than) query for a given date. We're updating the value for the end of the day.
 */
function mutateFilters(obj: any) {
  Object.keys(obj).forEach(function (key) {
    if (
      obj[key] !== null &&
      !Array.isArray(obj[key]) &&
      typeof obj[key] === "object"
    )
      mutateFilters(obj[key]);
    else {
      if (key === "match") {
        obj["$regex"] = Array.isArray(obj[key]) ? obj[key].join("|") : obj[key];
        obj["$options"] = "i"; // make case-insensitive
        delete obj[key];
      } else if (key === "lte" || key === "lt") {
        if (moment(obj[key], "YYYY-MM-DD", true).isValid())
          obj[key] = moment
            .tz(new Date(obj[key]), config.defaultTimeZone)
            .endOf("day")
            .toDate();
      }
    }
  });
}

export function parseQueryFilter(queryString: any) {
  const queryObj = { ...queryString };

  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  mutateFilters(queryObj);

  let queryStr: any = JSON.stringify(queryObj);
  // ADVANCE FILTERING
  queryStr = JSON.parse(
    queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match: string) => `$${match}`)
  );

  return queryStr;
}

export default class APIFeatures<T extends Document> {
  constructor(
    public query: Query<
      (Document<unknown, {}, T> &
        T & {
          _id: Types.ObjectId;
        })[],
      Document<unknown, {}, T> &
        T & {
          _id: Types.ObjectId;
        },
      {},
      T,
      "find"
    >,
    private queryString: FilterQuery<T>
  ) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1A) FILTERING
  filter(): APIFeatures<T> {
    const queryStr = parseQueryFilter(this.queryString);
    this.query.find(queryStr);
    return this;
  }

  // 2) SORTING
  sort(): APIFeatures<T> {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join("");
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  // 3) FIELD LIMITING
  limitFields(): APIFeatures<T> {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // exclude the __v field
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 4) PAGINATION
  paginate(size: number): APIFeatures<T> {
    const page = +this.queryString.page || 1;
    const skip = (page - 1) * size;
    // skip: skip results (offset) and limit: number of results per page
    this.query = this.query.skip(skip).limit(size);

    return this;
  }
}
