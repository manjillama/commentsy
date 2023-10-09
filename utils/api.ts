export async function post(url: string, data: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application.json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "default",
  });
  return response.json();
}
