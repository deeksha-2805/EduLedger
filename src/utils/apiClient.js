export default async function apiFetch(path, options = {}) {
  // Default to localhost backend port 4000 when NEXT_PUBLIC_API_URL is not provided4
    if (!path) {
    throw new Error("apiFetch: path is required");
  }

  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${base}${path}`;
  const { clientId, ...rest } = options || {};
  const headers = new Headers(rest.headers || {});
  headers.set("x-client-id", clientId ? String(clientId) : process.env.NEXT_PUBLIC_CLIENT_ID || "web-client");

  const merged = {
    credentials: "include",
    ...rest,
    headers,
  };
  console.log("API Request:", url); // helps debug

  return fetch(url, merged);
}

// export default async function apiFetch(path, options = {}) {
//   if (!path) {
//     throw new Error("apiFetch: path is required");
//   }

//   const base = process.env.NEXT_PUBLIC_API_URL || "";
//   const url = `${base}${path}`;

//   const { clientId, ...rest } = options || {};

//   const headers = new Headers(rest.headers || {});
//   headers.set(
//     "x-client-id",
//     clientId ? String(clientId) : process.env.NEXT_PUBLIC_CLIENT_ID || "web-client"
//   );

//   const merged = {
//     credentials: "include",
//     ...rest,
//     headers,
//   };

//   console.log("API Request:", url); // helps debug

//   return fetch(url, merged);
// }