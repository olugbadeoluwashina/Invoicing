import { assertEquals } from '@std/assert/equals';
import { Result, Failure } from '@app/shared/result.ts';

export function assertFailed<T>(result: Result<T>): asserts result is { ok: false; error: Failure } {
  assertEquals(result.ok, false, "Expected result to be a failure but it succeeded");
}

export function assertOk<T>(result: Result<T>): asserts result is { ok: true; value: T } {
  assertEquals(result.ok, true, "Expected result to be successful but it failed");
}