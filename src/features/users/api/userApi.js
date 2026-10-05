import { apiRequest } from "../../../helpers/apiHelper";

// GET /users -> daftar pengguna
const getUsers = async () => {
  const response = await apiRequest("/users");
  return response.data.users;
};

// GET /users/:id -> satu pengguna
const getUserById = async (id) => {
  const response = await apiRequest(`/users/${id}`);
  return response.data.user;
};

// GET /users/me -> profil pengguna yang sedang login
const getProfile = async () => {
  const response = await apiRequest("/users/me");
  return response.data.user;
};

// PUT /users/me -> ubah nama dan email, mengembalikan profil terbaru
const updateProfile = async ({ name, email }) => {
  const response = await apiRequest("/users/me", {
    method: "PUT",
    body: { name, email },
  });
  return response.data.user;
};

// POST /users/me/photo (multipart, field "photo") -> pesan sukses
const updatePhoto = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await apiRequest("/users/me/photo", {
    method: "POST",
    body: formData,
  });
  return response.message;
};

// PUT /users/password -> pesan sukses.
// Dokumentasi API menulis path ini, sedangkan modul menulis /users/me/password.
const updatePassword = async ({ password, newPassword, newPasswordConfirmation }) => {
  const response = await apiRequest("/users/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  });
  return response.message;
};

const userApi = {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  updatePhoto,
  updatePassword,
};

export default userApi;