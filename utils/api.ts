export async function get<T>(url: string): Promise<
  | {
      status: "success";
      data: T;
    }
  | { status: "fail" | "error"; message: string; errors: string[] }
> {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    return {
      status: "error",
      message: "Uh oh! Something went wrong",
      errors: ["Uh oh! Something went wrong"],
    };
  }
}

export async function post<T>(
  url: string,
  data: any
): Promise<
  | {
      status: "success";
      data: T;
    }
  | { status: "fail" | "error"; message: string; errors: string[] }
> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "default",
    });
    return await response.json();
  } catch (error) {
    return {
      status: "error",
      message: "Uh oh! Something went wrong",
      errors: ["Uh oh! Something went wrong"],
    };
  }
}
