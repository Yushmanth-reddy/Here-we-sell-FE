export interface ApiMeta {
  request_id: string;
  timestamp: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error: ApiErrorDetail | null;
  meta: ApiMeta;
  pagination?: {
    next_cursor: string | null;
    has_more: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    next_cursor: string | null;
    has_more: boolean;
  };
}
