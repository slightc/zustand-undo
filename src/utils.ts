export function mixin<A extends object, B extends object>(a: A, b: B) {
  for (const key in b) {
    (a as any)[key] = b[key];
  }
  return a as A & B;
}
