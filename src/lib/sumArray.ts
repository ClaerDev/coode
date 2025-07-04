export function sumArray<T>(array: T[], fn: (item: T) => number): number {
  return array.reduce((acc, item) => acc + fn(item), 0);
}
