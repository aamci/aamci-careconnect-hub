import { corsHeaders } from './cors.ts';

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401);
}

export function forbiddenResponse() {
  return errorResponse('Forbidden', 403);
}

export function methodNotAllowedResponse() {
  return errorResponse('Method not allowed', 405);
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
) {
  const totalPages = Math.ceil(total / pagination.limit);
  return jsonResponse({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  });
}
