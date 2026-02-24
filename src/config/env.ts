interface AppEnv {
  PORT: number;
}

export function loadEnv(): AppEnv {
  return {
    PORT: parseInt(Deno.env.get('PORT') ?? '3000'),
  };
}
