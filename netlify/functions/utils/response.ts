/**
 * Netlify Function response helpers
 */

export function success(data: any, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

export function error(message: string, statusCode: number = 500, details?: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify({ 
      error: message,
      ...(details && { details })
    }),
  };
}

export function unauthorized(message: string = 'Unauthorized') {
  return error(message, 401);
}

export function badRequest(message: string = 'Bad request') {
  return error(message, 400);
}

export function notFound(message: string = 'Not found') {
  return error(message, 404);
}

export function forbidden(message: string = 'Forbidden') {
  return error(message, 403);
}

/**
 * Handle CORS preflight
 */
export function handleCors() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: '',
  };
}

