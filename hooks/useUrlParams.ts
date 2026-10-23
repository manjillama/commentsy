import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback } from "react";

/**
 * Returns searchParams value, a function to update it and a function to replace it.
 */
export function useUrlSearchParams(): [
  ReadonlyURLSearchParams,
  (key: string, value: string) => void,
  (key: string, value: string) => void
] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const setSearchParams = (key: string, value: string) => {
    router.push(pathname + "?" + createQueryString(key, value));
  };

  const replaceSearchParams = (key: string, value: string) => {
    router.push(`${pathname}?${key}=${value}`);
  };

  return [searchParams, setSearchParams, replaceSearchParams];
}
