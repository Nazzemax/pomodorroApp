import debounce from "lodash.debounce";

export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  return debounce(fn, delay);
};