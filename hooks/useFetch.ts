import api from "@/utils/api";
import { useEffect, useState } from "react";

/**
 * @param  {string} url
 * @returns {Array} [fetching, response, error]
 */
export function useFetch<T>(url: string): [boolean, T | null, string | null] {
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const [baseUrl, queryString] = url.split("?");
    const params = new URLSearchParams(queryString);
    for (const [key, value] of Array.from(params.entries())) {
      if (value === "undefined" || value === "") params.delete(key);
    }
    const sanitizedUrl = baseUrl + (params.size ? `?${params}` : "");

    setFetching(true);
    setError(null);
    setData(null);
    api.get<T>(sanitizedUrl, { signal: controller.signal }).then(response => {
      // Older results must not replace data for a newer URL.
      if (!active) return;
      if (response.status === "success") setData(response.data);
      else setError(response.message);
      setFetching(false);
    });
    return () => { active = false; controller.abort(); };
  }, [url]);

  return [fetching, data, error];
}
