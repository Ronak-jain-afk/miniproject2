import type { Model, Document, FilterQuery } from 'mongoose';

export interface PaginateParams<T extends Document> {
  model: Model<T>;
  filter?: FilterQuery<T>;
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
  select?: string;
}

export interface PaginateResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function paginate<T extends Document>({
  model,
  filter = {},
  page = 1,
  limit = 20,
  sort = { createdAt: -1 },
  populate,
  select,
}: PaginateParams<T>): Promise<PaginateResult<T>> {
  const skip = (page - 1) * limit;

  let query: any = model.find(filter).sort(sort).skip(skip).limit(limit);
  if (populate) query = query.populate(populate);
  if (select) query = query.select(select);

  const [data, total] = await Promise.all([
    query.lean() as T[],
    model.countDocuments(filter),
  ]);

  return {
    data: data as unknown as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
