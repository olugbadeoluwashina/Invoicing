import { Context, Next } from '@oak/oak';

export async function loggerMiddleware(ctx: Context, next: Next) {
  await next();
  const rt = ctx.response.headers.get('X-Response-Time');
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
}
