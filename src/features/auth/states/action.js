import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../api/authApi";
import { putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";

// Mengembalikan status register/logout/error ke kondisi awal
export const resetAuthStatus = createAction("auth/resetStatus");

export const asyncAuthLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user, token } = await authApi.login({ email, password });
      putAccessToken(token);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const asyncAuthRegister = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      return await authApi.register({ name, email, password });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const asyncAuthLogout = createAsyncThunk("auth/logout", async () => {
  removeAccessToken();
});