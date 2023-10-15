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
    (async function () {
      setFetching(true);
      const data = await api.get<T>(url);
      if (data.status === "success") setData(data.data);
      else setError(data.message);
      setFetching(false);
    })();
  }, [url]);

  return [fetching, data, error];
}
