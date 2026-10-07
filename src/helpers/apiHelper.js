const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const putAccessToken = (token) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

// Mengubah object menjadi query string, nilai kosong diabaikan
export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

// Wrapper fetch untuk REST API Delcom.
// Mengembalikan JSON response jika status "success", selain itu melempar Error
// (dengan properti `status` HTTP dan `data` dari response API).
export const apiRequest = async (
  path,
  { method = "GET", params, body, auth = true } = {}
) => {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser mengatur Content-Type multipart otomatis
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${DELCOM_BASEURL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server");
  }

  let json;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok || !json || json.status !== "success") {
    const error = new Error(json?.message || "Terjadi kesalahan pada server");
    error.status = response.status;
    error.data = json?.data ?? null;
    throw error;
  }

  return json;
};