export type Failure = {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "UNAUTHORIZED" | "FORBIDDEN";
  message: string;
};

export type Result<T> = 
| { ok: true; value: T } 
| { ok: false; error: Failure };

/** Wrap a successful value in a Result */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Wrap a plain failure descriptor in a Result */
export function fail<T>(error: Failure): Result<T> {
  return { ok: false, error };
}
