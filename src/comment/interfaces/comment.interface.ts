import { DEFAULT_SORT_BY, DEFAULT_SORT_DIRECT } from 'src/constants';

export interface IOptions {
  limit: number;
  offset: number;
}

export interface ISort {
  sort: SortType;
  sortDirect: SortDirection;
}

const SortOptions = ['email', 'userName', DEFAULT_SORT_BY] as const;
export type SortType = (typeof SortOptions)[number];

const SortDirectionOptions = ['ASC', DEFAULT_SORT_DIRECT] as const;
export type SortDirection = (typeof SortDirectionOptions)[number];
