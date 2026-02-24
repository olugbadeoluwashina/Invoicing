import { Application } from '@oak/oak';
import { loadEnv } from './src/config/env.ts';
import { errorMiddleware } from '@app/infra/middlewares/error.middleware.ts';
import { loggerMiddleware } from '@app/infra/middlewares/logger.middleware.ts';

const env = loadEnv();
const app = new Application();

app.use(errorMiddleware);
app.use(loggerMiddleware);

app.use((ctx) => {
  ctx.response.body = 'Hello World!';
});

await app.listen({ port: env.PORT });
