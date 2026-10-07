import { createSlice } from "@reduxjs/toolkit";
import { getAccessToken } from "../../../helpers/apiHelper";
import {
  asyncAuthLogin,
  asyncAuthRegister,
  asyncAuthLogout,
  resetAuthStatus,
} from "./action";

// Fungsi (bukan object) agar token di localStorage dibaca saat store dibuat
export const getInitialState = () => ({
  isAuthLogin: Boolean(getAccessToken()), // true jika pengguna sedang login
  isAuthRegister: false, // true setelah registrasi berhasil
  isAuthLogout: false, // true setelah logout berhasil
  isLoading: false, // true selama permintaan berjalan
  error: null, // pesan error terakhir
});

const setPending = (state) => {
  state.isLoading = true;
  state.error = null;
};

const setRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload ?? action.error.message;
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(asyncAuthLogin.pending, setPending)
      .addCase(asyncAuthLogin.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthLogin = true;
        state.isAuthLogout = false;
      })
      .addCase(asyncAuthLogin.rejected, setRejected)
      .addCase(asyncAuthRegister.pending, setPending)
      .addCase(asyncAuthRegister.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthRegister = true;
      })
      .addCase(asyncAuthRegister.rejected, setRejected)
      .addCase(asyncAuthLogout.fulfilled, (state) => {
        state.isAuthLogin = false;
        state.isAuthLogout = true;
      })
      .addCase(resetAuthStatus, (state) => {
        state.isAuthRegister = false;
        state.isAuthLogout = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;