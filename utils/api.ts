async function get<T>(url: string): Promise<
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
    console.error(error);
    return {
      status: "error",
      message: "Uh oh! Something went wrong",
      errors: ["Uh oh! Something went wrong"],
    };
  }
}

async function post<T>(
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
    console.error(error);
    return {
      status: "error",
      message: "Uh oh! Something went wrong",
      errors: ["Uh oh! Something went wrong"],
    };
  }
}

async function patch<T>(
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
      method: "PATCH",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "default",
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Uh oh! Something went wrong",
      errors: ["Uh oh! Something went wrong"],
    };
  }
}

const api = {
  get,
  post,
  patch,
};

export default api;
