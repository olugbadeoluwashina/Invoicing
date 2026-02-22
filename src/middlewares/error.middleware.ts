import { Context, Next } from '@oak/oak';
import { AppError } from '@app/shared/error.ts';

export async function errorMiddleware(ctx: Context, next: Next) {
   try {
      await next();
   } catch (err) {
      if (err instanceof AppError) {
         ctx.response.body = {
            status: false,
         };
      }
   }
}
