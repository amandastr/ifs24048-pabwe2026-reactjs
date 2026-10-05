import { apiRequest } from "../../../helpers/apiHelper";

// POST /auth/login -> { user, token }
const login = async ({ email, password }) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  return response.data;
};

// POST /auth/register -> pesan sukses (API tidak mengembalikan data)
const register = async ({ name, email, password }) => {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password },
  });

  return response.message;
};

const authApi = { login, register };

export default authApi;