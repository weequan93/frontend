export type ApiName = 'general' | 'admin' | 'bens' | 'contractInfo' | 'deriw' | 'metadata' | 'multichain' | 'rewards' | 'stats' | 'tac' | 'userOps' | 'visualize';

export interface ApiResource {
  path: string;
  pathParams?: Array<string>;
  queryParams?: Array<string>;
  filterFields?: Array<string>;
  paginated?: boolean;
  headers?: RequestInit['headers'];
}
