import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "../api/userApi";

// Membuat async thunk standar: sukses -> payload hasil API, gagal -> pesan error
const createApiThunk = (type, apiCall) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await apiCall(arg);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// Mengembalikan status perubahan akun dan error ke kondisi awal
export const resetUsersStatus = createAction("users/resetStatus");

export const asyncGetUsers = createApiThunk("users/getAll", () =>
  userApi.getUsers()
);

export const asyncGetUserById = createApiThunk("users/getById", (id) =>
  userApi.getUserById(id)
);

export const asyncGetProfile = createApiThunk("users/getProfile", () =>
  userApi.getProfile()
);

export const asyncChangeProfile = createApiThunk(
  "users/changeProfile",
  (data) => userApi.updateProfile(data)
);

export const asyncChangeProfilePhoto = createApiThunk(
  "users/changeProfilePhoto",
  (file) => userApi.updatePhoto(file)
);

export const asyncChangeProfilePassword = createApiThunk(
  "users/changeProfilePassword",
  (data) => userApi.updatePassword(data)
);