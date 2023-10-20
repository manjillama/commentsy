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

  const getSanitizedUrl = () => {
    const [baseUrl, queryString] = url.split("?");
    const queryParams = new URLSearchParams(queryString);
    // Remove undefined and '' value params
    queryParams.forEach((value, key) => {
      if (value === "undefined" || value === "") queryParams.delete(key);
    });
    const updatedUrl =
      baseUrl + (queryParams.toString() ? `?${queryParams.toString()}` : "");

    return updatedUrl;
  };

  useEffect(() => {
    (async function () {
      setFetching(true);
      const data = await api.get<T>(getSanitizedUrl());
      if (data.status === "success") setData(data.data);
      else setError(data.message);
      setFetching(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return [fetching, data, error];
}
