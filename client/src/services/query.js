export function asQueryParams(params) {
  return params
    ? "?" +
        Object.entries(params)
          .map(
            ([key, value]) => ![null, undefined, ""].includes(value) && [key, value].map(encodeURIComponent).join("="),
          )
          .filter(Boolean)
          .join("&")
    : "";
}

export async function query(url, params, options, prependApiRoot = true) {
  if (prependApiRoot) {
    url = [process.env.PUBLIC_URL, url].join("/");
  }

  const fetchOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  if (/get/i.test(fetchOptions.method)) {
    url += asQueryParams(params);
  } else {
    fetchOptions.body = JSON.stringify(params);
  }

  const response = await fetch(url, fetchOptions);
  return await response.json();
}

export async function post(url, params, options, prependApiRoot = true) {
  if (prependApiRoot) {
    url = [process.env.PUBLIC_URL, url].join("/");
  }

  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  if (/get/i.test(fetchOptions.method)) {
    url += asQueryParams(params);
  } else {
    fetchOptions.body = JSON.stringify(params);
  }

  const response = await fetch(url, fetchOptions);
  return await response.json();
}
