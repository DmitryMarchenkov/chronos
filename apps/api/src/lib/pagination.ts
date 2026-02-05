import { paginationSchema } from '@chronos/shared-validation';

export const getPagination = (query: unknown) =>
  paginationSchema.parse(query ?? {});

export const formatPagination = (page: number, pageSize: number, total: number) => ({
  page,
  pageSize,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
});
