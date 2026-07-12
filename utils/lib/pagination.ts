import { Model } from "mongoose";

interface PaginationOptions {
  page?: string | null;
  limit?: string | null;
  select?: string;
  populate?: any;
}

export const getPaginatedData = async <T>(
  model: Model<T>,
  query: any = {},
  options: PaginationOptions = {},
  sort: any = { createdAt: -1 }
) => {
  const page = parseInt(options.page || "1", 10);
  const limit = parseInt(options.limit || "10", 10);
  const skip = (page - 1) * limit;

  const totalCount = await model.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  let mQuery = model.find(query).sort(sort).skip(skip).limit(limit);
  if (options.select) {
    mQuery = mQuery.select(options.select);
  }
  if (options.populate) {
    mQuery = mQuery.populate(options.populate);
  }
  
  const data = await mQuery;

  return {
    data,
    totalCount,
    totalPages,
    currentPage: page,
  };
};
