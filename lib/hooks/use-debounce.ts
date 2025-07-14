import { useCallback, useEffect, useRef } from "react";

type AnyFunction = (...args: any[]) => any;

interface DebouncedFunction<F extends AnyFunction> {
  (...args: Parameters<F>): void;
  cancel(): void;
}

export function useDebounce<F extends AnyFunction>(
  func: F,
  delay: number,
  maxWait?: number
): DebouncedFunction<F> {
  const funcRef = useRef(func);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
  }, []);

  const debouncedFunc = useCallback(
    (...args: Parameters<F>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = undefined;
        }
        funcRef.current(...args);
      }, delay);

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          funcRef.current(...args);
        }, maxWait);
      }
    },
    [delay, maxWait, cancel]
  );

  (debouncedFunc as DebouncedFunction<F>).cancel = cancel;

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return debouncedFunc as DebouncedFunction<F>;
}
